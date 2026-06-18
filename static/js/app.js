document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const refreshBtn = document.getElementById('refresh-btn');
  const searchInput = document.getElementById('search-input');
  const releasesList = document.getElementById('releases-list');
  const composerPlaceholder = document.getElementById('composer-placeholder');
  const composerActive = document.getElementById('composer-active');
  const composerTextarea = document.getElementById('composer-textarea');
  const charCounter = document.getElementById('char-counter');
  const tweetBtn = document.getElementById('tweet-btn');
  const clearSelectionBtn = document.getElementById('clear-selection');
  const toast = document.getElementById('toast');

  let allReleases = [];
  let selectedElement = null;
  let activeReleaseUrl = '';

  // Fetch Releases
  async function fetchReleases(isManual = false) {
    try {
      setLoading(true);
      const response = await fetch('/api/releases');
      const data = await response.json();

      if (data.success) {
        allReleases = data.releases;
        renderReleases(allReleases);
        if (isManual) {
          showToast('Release notes successfully updated!');
        }
      } else {
        renderError(data.error || 'Failed to fetch release notes.');
      }
    } catch (err) {
      console.error(err);
      renderError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Set Loading State
  function setLoading(isLoading) {
    if (isLoading) {
      refreshBtn.classList.add('loading');
      refreshBtn.disabled = true;
    } else {
      refreshBtn.classList.remove('loading');
      refreshBtn.disabled = false;
    }
  }

  // Render Error
  function renderError(message) {
    releasesList.innerHTML = `
      <div class="error-state">
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <h3>Oops! Something went wrong</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
      </div>
    `;
  }

  // Render Release Notes
  function renderReleases(releases) {
    if (releases.length === 0) {
      releasesList.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
          </svg>
          <h3>No release notes found</h3>
          <p>Try searching for a different term or check back later.</p>
        </div>
      `;
      return;
    }

    releasesList.innerHTML = '';

    releases.forEach(release => {
      const card = document.createElement('div');
      card.className = 'release-card';
      card.dataset.id = release.id;
      card.dataset.link = release.link;

      // Extract ISO Date to human-readable format
      let formattedDate = release.title; // Default fallback is the title (e.g. "June 17, 2026")
      if (release.updated) {
        try {
          const dateObj = new Date(release.updated);
          formattedDate = dateObj.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch (e) {
          console.error("Date parsing error", e);
        }
      }

      card.innerHTML = `
        <div class="release-header">
          <span class="release-title">${release.title}</span>
          <span class="release-date">${formattedDate}</span>
        </div>
        <div class="release-body">${release.content}</div>
      `;

      // Enable text-segment selection events inside release body
      const bodyElements = card.querySelectorAll('.release-body p, .release-body li');
      bodyElements.forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectElementForTweet(el, release.link);
        });
      });

      releasesList.appendChild(card);
    });

    // Restore selection highlight if the selected element is still rendered (unlikely but good practice)
    if (selectedElement) {
      const matchingEl = document.querySelector(`[data-link="${activeReleaseUrl}"] .release-body`);
      if (matchingEl) {
        // Just find matching text to re-select
      }
    }
  }

  // Selection Handler
  function selectElementForTweet(element, linkUrl) {
    // Clear previous selection highlight
    if (selectedElement) {
      selectedElement.classList.remove('selected');
    }

    // Toggle off if clicking the same element
    if (selectedElement === element) {
      clearSelection();
      return;
    }

    // Set new selection
    selectedElement = element;
    selectedElement.classList.add('selected');
    activeReleaseUrl = linkUrl;

    // Clean text: strip inner HTML tags for plain text representing update
    let plainText = element.textContent.replace(/\s+/g, ' ').trim();
    
    // Add prefix/suffix contexts
    let tweetTemplate = `BigQuery Update: "${plainText}" \n\nDetails: ${linkUrl}`;
    
    // Populate composer
    composerPlaceholder.style.display = 'none';
    composerActive.style.display = 'block';
    composerTextarea.value = tweetTemplate;
    
    updateCharCount();
  }

  // Clear Selection
  function clearSelection() {
    if (selectedElement) {
      selectedElement.classList.remove('selected');
      selectedElement = null;
    }
    activeReleaseUrl = '';
    composerActive.style.display = 'none';
    composerPlaceholder.style.display = 'block';
  }

  // Update Character Count
  function updateCharCount() {
    const len = composerTextarea.value.length;
    charCounter.textContent = `${len}/280`;

    // Visual indicators
    if (len > 280) {
      charCounter.className = 'char-counter danger';
      tweetBtn.disabled = true;
    } else if (len > 250) {
      charCounter.className = 'char-counter warning';
      tweetBtn.disabled = false;
    } else {
      charCounter.className = 'char-counter';
      tweetBtn.disabled = false;
    }
  }

  // Tweet Action
  function tweetContent() {
    const text = encodeURIComponent(composerTextarea.value);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  // Toast Notification utility
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Event Listeners
  refreshBtn.addEventListener('click', () => fetchReleases(true));
  
  composerTextarea.addEventListener('input', updateCharCount);
  
  tweetBtn.addEventListener('click', tweetContent);
  
  clearSelectionBtn.addEventListener('click', clearSelection);

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === '') {
      renderReleases(allReleases);
      return;
    }

    const filtered = allReleases.filter(release => {
      const inTitle = release.title.toLowerCase().includes(query);
      const inContent = release.content.toLowerCase().includes(query);
      return inTitle || inContent;
    });

    renderReleases(filtered);
  });

  // Initial load
  fetchReleases();
});
