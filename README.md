# BigQuery Release Hub & Share 🚀

A modern, high-fidelity dark-themed web dashboard to monitor Google Cloud BigQuery release notes and instantly draft and share updates to X (Twitter).

---

## 🌟 Key Features

- **Automated Sync**: Fetches the official Google Cloud BigQuery RSS/Atom release feed directly from Google servers.
- **Smart Caching**: Implements a 5-minute memory caching mechanism to reduce redundant network requests.
- **Resilient Fallbacks**: If the external feed fetch fails, the app automatically serves the last successfully cached version of the release notes.
- **Real-Time Client-Side Filtering**: Instantly search and filter release entries by keywords (e.g. `JSON`, `Vector Search`, `Gemini`) using search indexing on the front-end.
- **One-Click Tweet Composer**: Click on any paragraph, heading, or list item in the feed to auto-generate a tweet formatted with the selected update context and a deep link back to the Google Cloud release note page.
- **Character Count Counter**: Monitors the 280-character limit dynamically with warnings (starting at 250 characters) and disables the tweet button when exceeded.

---

## 🏗️ Technology Stack

- **Backend**: Python 3.x, Flask (web framework), `requests` (http fetches), `xml.etree.ElementTree` (Atom feed parser)
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism & dark gradients), Modern JavaScript (ES6 Modules/Fetch API)
- **Aesthetics**: Premium modern typography using *Outfit* and *Plus Jakarta Sans* fonts, dynamic hover states, responsive layouts (tested on mobile, tablet, and desktop screens).

---

## 📂 Project Structure

```bash
├── app.py                # Main Flask server application (feed sync, caching, routes)
├── requirements.txt      # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css     # Dark UI and Glassmorphism design stylesheet
│   └── js/
│       └── app.js        # Client-side UI logic, filter engine, and composer
├── templates/
│   └── index.html        # Main HTML page structure
└── .gitignore            # Git exclusion rules for virtual env & temporary files
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher installed.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/InayatRasul/rasul-event-talks-app.git
   cd rasul-event-talks-app
   ```

2. **Set up the virtual environment (recommended):**
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

5. **Access the application:**
   Open your browser and navigate to:
   👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🛠️ API Documentation

### Get Release Notes
- **Endpoint**: `/api/releases`
- **Method**: `GET`
- **Response Format**:
  ```json
  {
    "success": true,
    "source": "fresh", // Can be "fresh", "cached", or "fallback"
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
