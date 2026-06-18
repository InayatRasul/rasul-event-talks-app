import time
import requests
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
CACHE_DURATION = 300  # 5 minutes cache
cache = {
    "data": None,
    "expiry": 0
}

def parse_release_notes(xml_data):
    """
    Parses BigQuery release notes Atom feed into a structured JSON-serializable list.
    """
    root = ET.fromstring(xml_data)
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    
    entries = []
    # Find all entry elements
    for entry_elem in root.findall('.//atom:entry', ns):
        title_elem = entry_elem.find('atom:title', ns)
        updated_elem = entry_elem.find('atom:updated', ns)
        content_elem = entry_elem.find('atom:content', ns)
        link_elem = entry_elem.find('atom:link', ns)
        id_elem = entry_elem.find('atom:id', ns)
        
        title = title_elem.text if title_elem is not None else "Unknown Date"
        updated = updated_elem.text if updated_elem is not None else ""
        content = content_elem.text if content_elem is not None else ""
        link = link_elem.attrib.get('href', '') if link_elem is not None else ""
        entry_id = id_elem.text if id_elem is not None else ""
        
        entries.append({
            "id": entry_id,
            "title": title,
            "updated": updated,
            "link": link,
            "content": content
        })
        
    return entries

def fetch_feed_data():
    current_time = time.time()
    if cache["data"] and current_time < cache["expiry"]:
        return cache["data"], "cached"
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(FEED_URL, headers=headers, timeout=10)
        response.raise_for_status()
        
        entries = parse_release_notes(response.content)
        
        # Update cache
        cache["data"] = entries
        cache["expiry"] = current_time + CACHE_DURATION
        return entries, "fresh"
    except Exception as e:
        # If request fails but we have cached data, fall back to it
        if cache["data"]:
            return cache["data"], "fallback"
        raise e

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/releases")
def get_releases():
    try:
        releases, source = fetch_feed_data()
        return jsonify({
            "success": True,
            "source": source,
            "releases": releases
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
