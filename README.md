# BigQuery Release Hub & Share 🚀

A modern, high-fidelity dark-themed web dashboard to monitor Google Cloud BigQuery release notes and instantly compose and share updates to X (Twitter).

This application fetches official BigQuery release notes, parses the Atom feed on a lightweight Flask backend, applies smart server-side caching, and presents a beautiful glassmorphic front-end that allows you to filter updates and compose tweets with a single click.

---

## 🌟 Key Features

- **Automated Sync**: Fetches the official Google Cloud BigQuery RSS/Atom release feed directly from Google servers (`https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`).
- **Smart Caching**: Implements a 5-minute (300-second) memory-caching mechanism on the backend to reduce redundant external network requests and improve load times.
- **Resilient Fallbacks**: If the external feed fetch fails, the app automatically serves the last successfully cached version of the release notes.
- **Real-Time Client-Side Filtering**: Instantly search and filter release entries by keywords (e.g. `JSON`, `Vector Search`, `Gemini`) using search indexing on the front-end.
- **One-Click Tweet Composer**: Click on any paragraph, heading, or list item in the feed to auto-generate a tweet formatted with the selected update context and a deep link back to the Google Cloud release note page.
- **Dynamic Character Counter**: Tracks X (Twitter) character limits (280 characters) in real-time, displays warnings when approaching limits (starting at 250 characters), and prevents tweeting if the limit is exceeded.
- **Theme Customization**: Integrated light/dark mode toggle switch in the header that overrides core CSS custom properties and persists choice across page loads using `localStorage`.
- **Copy to Clipboard**: Quick-copy formatted updates (including Title, Plain text content, and reference Link) in a single click directly from any release card.
- **Export to CSV**: Export current release notes (supporting active search queries) directly to a formatted CSV spreadsheet for sharing or offline archiving.
- **Toast Notifications**: Interactive toast alerts that inform users of successful updates, copies, exports, and sync status.

---

## 🏗️ Technology Stack

### Backend
- **Python 3.x**: Core scripting language.
- **Flask**: Lightweight web framework routing pages and API queries.
- **requests**: Standard HTTP library for fetching external feeds.
- **xml.etree.ElementTree**: Part of the standard library, used for parsing the Atom feed XML structure.

### Frontend
- **Vanilla HTML5 & CSS3**: Formatted structure and custom modern styles featuring Glassmorphism, deep dark-themed gradients, and layout responsive states.
- **Modern JavaScript (ES6)**: Modular structure utilizing native Fetch APIs, event delegation, search-filtering, and dynamic DOM manipulation.
- **Typography**: Premium typography using *Outfit* and *Plus Jakarta Sans* fonts imported from Google Fonts.

---

## 📂 Project Structure

```bash
├── app.py                # Main Flask server application (feed sync, caching, routes)
├── requirements.txt      # Python dependencies (Flask, requests)
├── static/
│   ├── css/
│   │   └── style.css     # Glassmorphic dark theme stylesheet
│   └── js/
│       └── app.js        # Client-side selection, filtering, and composer logic
├── templates/
│   └── index.html        # Main HTML structure with custom SVG icons
└── .gitignore            # Git exclusion rules for venv, python cache, and workspace configurations
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher.
- A terminal connection.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/InayatRasul/rasul-event-talks-app.git
   cd rasul-event-talks-app
   ```

2. **Set up a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the local development server:**
   ```bash
   python app.py
   ```
   *By default, the server runs in debug mode on port `5000`.*

5. **Access the application:**
   Open your browser and navigate to:
   👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🛠️ API Reference

### Get Release Notes

Retrieve structured JSON-formatted release notes parsed from the Google Cloud BigQuery feed.

- **Endpoint**: `/api/releases`
- **Method**: `GET`
- **Headers**: `Accept: application/json`
- **Success Response Code**: `200 OK`
- **Success Response Example**:
  ```json
  {
    "success": true,
    "source": "fresh", 
    "releases": [
      {
        "id": "tag:google.com,2016:bigquery-release-notes#June_17_2026",
        "title": "June 17, 2026",
        "updated": "2026-06-17T00:00:00-07:00",
        "link": "https://docs.cloud.google.com/bigquery/docs/release-notes#June_17_2026",
        "content": "<h3>Feature</h3>\n<p>You can enable autonomous embedding generation..."
      }
    ]
  }
  ```
  *Note: The `source` field indicates where the data came from. Possible values are `fresh` (newly fetched from feed), `cached` (returned from memory cache), or `fallback` (returned from memory cache because an external fetch error occurred).*

- **Error Response Code**: `500 Internal Server Error`
- **Error Response Example**:
  ```json
  {
    "success": false,
    "error": "Failed to connect to feed server"
  }
  ```

---

## 💡 How It Works

### Backend Feed Parser & Cache Flow
1. When `/api/releases` is requested, the application checks if the cached feed data is valid (expires after 5 minutes).
2. If the cache is valid, the server returns the cached releases immediately.
3. If the cache is expired or empty, the server performs an HTTP `GET` request to Google Cloud's BigQuery Atom feed.
4. The XML feed is parsed into an element tree. It iterates over `<entry>` nodes, extracts titles, dates, links, and HTML contents, and maps them to a serializable dictionary list.
5. If the request succeeds, the cache is refreshed. If it fails (e.g., offline or network timeout) and a previous cache is available, the server returns the cache with `source: "fallback"` to guarantee uptime.

### Frontend Interactions
- **Filtering**: The search bar listens to the `input` event on the client side, matching the text against release titles and body content to dynamically hide or show cards.
- **Sharing**: Clicking on any paragraph (`<p>`) or list item (`<li>`) inside a release card highlights it, fetches its associated documentation link, constructs a template tweet, and displays it in the sidebar composer. Clicking "Tweet This" opens a secure Twitter intent URL redirect.
- **Copying**: Clicking the "Copy" button on any card parses and extracts its HTML content into clean plain text, copies it along with its direct documentation link to the user's clipboard, and gives a visual "Copied!" feedback state.
- **Exporting**: Clicking the "Export CSV" button parses all currently visible (matching the active search filter, or all releases if no filter is active) releases, escapes quotes and special characters, and generates a downloadable CSV file.
- **Theme Toggling**: The theme toggle switch in the header overrides core CSS variables inside a `.light-theme` class context, supporting light/dark layouts dynamically, and persists selections using the browser's `localStorage` API.

---

## ⚙️ Configuration

You can customize core properties directly in `app.py`:

- **Feed URL**: Modify `FEED_URL` to point to a different Atom feed.
- **Cache Duration**: Alter `CACHE_DURATION` (in seconds) to adjust caching behavior.
- **Host & Port**: Change parameters in `app.run(host="127.0.0.1", port=5000)` at the bottom of `app.py`.
