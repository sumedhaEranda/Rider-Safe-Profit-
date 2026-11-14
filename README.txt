RIDER SAFE PROFIT PWA
=====================

This is a starter Progressive Web App for iPhone Safari. It stores records in this browser's localStorage.

FEATURES
- Record completed orders with actual bike-meter kilometres
- Estimate per-order fuel and maintenance reserve
- Safe-order guide: >= Rs.40/km GOOD, Rs.35-39.99/km CAUTION, below Rs.35/km LOW
- Record actual daily expenses separately
- Dashboard, 20-day target progress and CSV export
- Offline cache after first successful online load

DEFAULT SETTINGS
- Petrol: Rs.424/L
- Mileage: 35 km/L
- Maintenance reserve: Rs.3/km (editable placeholder)
- Target: Rs.98,000

IMPORTANT
1. The app is a tracking/estimation tool, not a guaranteed income predictor.
2. The order calculator estimates fuel + maintenance for the entered distance only. It does not include empty return travel, waiting time, food, or other expenses.
3. Dashboard net profit = recorded order payments minus expenses you manually enter. Do not double-count estimated fuel by entering it again as a real expense.
4. Data is stored only in this browser on this device. Clearing Safari website data or deleting browser data can erase it. Use Export CSV regularly for backup.
5. This ZIP is source code, not an installed app and not yet hosted online.

HOW TO PUBLISH WITHOUT A MAC
- Upload the contents of this folder to a static HTTPS host such as GitHub Pages or Netlify.
- Open the published HTTPS address in Safari on the iPhone.
- Tap Share -> Add to Home Screen.
- Turn on "Open as Web App" if that option appears, then tap Add.
- Open it once while online; the service worker can then cache the app for offline use.

For a first deployment, GitHub Pages is free for public repositories. Keep your exported CSV backups private.
