document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const refreshBtn = document.getElementById('refresh-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleIcon = document.getElementById('theme-toggle-icon');
  const themeToggleText = document.getElementById('theme-toggle-text');
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

  // Theme Toggle Functionality
  const sunPath = `<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm-12.37 1.41c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06zm12.37-12.37c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06z"/>`;
  const moonPath = `<path d="M12.3 2a10 10 0 0 0-1.9 1.5 10 10 0 1 0 11.6 11.6c.1-.4 0-.8-.3-1a1 1 0 0 0-1 0 8 8 0 1 1-10.4-10.4 1 1 0 0 0-.4-1.8 10 10 0 0 0 2.4-.4z"/>`;

  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
      themeToggleIcon.innerHTML = moonPath;
      themeToggleText.textContent = 'Dark Mode';
    } else {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
      themeToggleIcon.innerHTML = sunPath;
      themeToggleText.textContent = 'Light Mode';
    }
  }

  function toggleTheme() {
    const isLight = document.documentElement.classList.contains('light-theme');
    if (isLight) {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
      themeToggleIcon.innerHTML = sunPath;
      themeToggleText.textContent = 'Light Mode';
      localStorage.setItem('theme', 'dark');
      showToast('Switched to Dark Mode');
    } else {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
      themeToggleIcon.innerHTML = moonPath;
      themeToggleText.textContent = 'Dark Mode';
      localStorage.setItem('theme', 'light');
      showToast('Switched to Light Mode');
    }
  }

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
          <div class="release-meta-group">
            <span class="release-title">${release.title}</span>
            <span class="release-date">${formattedDate}</span>
          </div>
          <button class="copy-card-btn" title="Copy release notes to clipboard">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            Copy
          </button>
        </div>
        <div class="release-body">${release.content}</div>
      `;

      // Copy Button Action
      const copyBtn = card.querySelector('.copy-card-btn');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Clean text content of HTML tags
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = release.content;
        const plainContent = tempDiv.textContent || tempDiv.innerText || '';
        
        const copyText = `Google Cloud BigQuery Update - ${release.title}\n\n${plainContent.trim()}\n\nFull details: ${release.link}`;
        copyToClipboard(copyText, copyBtn);
      });

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

  // Copy to Clipboard
  async function copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied release notes to clipboard!');
      
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--success)">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
      `;
      button.classList.add('copied');
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      showToast('Failed to copy to clipboard.');
    }
  }

  // Export to CSV
  function exportToCSV() {
    const query = searchInput.value.toLowerCase().trim();
    const releasesToExport = query === '' ? allReleases : allReleases.filter(release => {
      const inTitle = release.title.toLowerCase().includes(query);
      const inContent = release.content.toLowerCase().includes(query);
      return inTitle || inContent;
    });

    if (releasesToExport.length === 0) {
      showToast('No releases available to export!');
      return;
    }

    const headers = ['ID', 'Title', 'Date', 'Link', 'Plain Content'];
    
    // Clean content utility to strip HTML tags
    const getPlainText = (html) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    };

    const escapeCSV = (field) => {
      if (field === null || field === undefined) return '';
      let str = field.toString().replace(/"/g, '""');
      if (str.search(/("|,|\n)/g) >= 0) {
        str = `"${str}"`;
      }
      return str;
    };

    const rows = releasesToExport.map(r => [
      r.id,
      r.title,
      r.updated,
      r.link,
      getPlainText(r.content).trim()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bigquery_release_notes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Successfully exported ${releasesToExport.length} releases to CSV!`);
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
  
  exportCsvBtn.addEventListener('click', exportToCSV);
  
  themeToggle.addEventListener('click', toggleTheme);
  
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

  // Initialize theme setup
  initTheme();

  // Initial load
  fetchReleases();
});
