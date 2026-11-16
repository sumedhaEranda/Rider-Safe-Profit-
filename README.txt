RIDER SAFE PROFIT – UPDATED PWA

Includes:
- iPhone and Android installable Progressive Web App.
- Uber Moto and Uber Delivery offer scanner.
- Camera capture or screenshot upload.
- Automatic OCR starts as soon as a screenshot is selected; no Read Offer Details button is needed.
- OCR reads LKR offer amount and km values (Tesseract.js, English).
- Editable detected values, estimated fuel/maintenance/profit and order/km guide.
- Existing order/expense history, settings and CSV export remain supported.

IMPORTANT:
1. OCR requires internet access to load the OCR engine from jsDelivr. Camera access requires HTTPS (or localhost). Selecting/capturing an image starts OCR automatically.
2. Always verify the scanned amount and distances before saving. OCR can misread text.
3. For a Moto offer with pickup and trip distances, the app adds both values.
4. For a multi-stop Delivery offer that displays one total distance, it uses that total distance. If the screenshot shows separate pickup and trip distances, verify the fields and adjust them.
5. The app stores data in this browser on this device. Export CSV regularly for backup. Existing data under localStorage key riderProfitData is preserved when updating these files on the same browser/device.
6. Do not clear website data if you need existing records.

INSTALL:
- Publish all files to an HTTPS static host (GitHub Pages or Netlify).
- Open the HTTPS site in Safari (iPhone) or Chrome (Android).
- iPhone: Share > Add to Home Screen.
- Android: Chrome menu > Install app / Add to Home screen.
