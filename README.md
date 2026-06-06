# 🌿 EcoCart: Sustainable Shopping Assistant

EcoCart is a smart browser extension and backend analytics engine that helps shoppers make sustainable buying choices. It automatically analyzes product details (title, brand, specifications, and descriptions) on popular e-commerce sites, calculates an eco-friendliness score from `0` to `100`, and suggests greener alternatives.

The project is structured as a monorepo containing both the Express.js analysis server and the Manifest V3 Chrome Extension.

---

## 🚀 Key Features

* **Real-time DOM Injection**: Displays a green-themed inline analysis widget and floating badge directly under the product title on supported e-commerce sites.
* **Intelligent Scoring Engine**: Uses category-specific default baselines (Electronics, Clothing, Groceries, etc.), material sustainability adjustments ($\pm40$), eco-certification bonuses ($+30$), and packaging adjustments ($\pm20$).
* **Appliance Energy Heuristics**: Dedicated evaluation logic for household appliances (ACs, Fridges, Heaters) checking for Star ratings (1-5 star), inverter compressor tech, and refrigerant global warming potential (e.g. R32 vs R22).
* **Eco-Absent Cap**: Stricter scoring that caps standard non-sustainable products without green indicators to a maximum score of **45**.
* **AI Fallback Analysis**: Integration with **Gemini 1.5 Flash** for optional AI-driven evaluations when a `GEMINI_API_KEY` is provided.
* **Content Security Policy (CSP) Bypass**: Bypasses e-commerce strict connection blockers by tunneling analysis requests safely through a Chrome service worker (`background.js`).
* **Dynamic Configuration Panel**: Allows developers and end-users to change the backend API endpoint URL directly inside the extension popup settings.
* **Target Domain Restricting**: Restricts scripts to run only on supported domains (Amazon, eBay, and Walmart) to eliminate performance overhead on other websites.

---

## 📁 Repository Structure

```text
ecocart-backend/
├── ecocart-extension/      # Manifest V3 Chrome Extension (Frontend)
│   ├── background.js       # Service worker tunnel
│   ├── content.js          # Scrapes details & injects DOM widgets
│   ├── popup.html/css/js   # UI Dashboard & Settings panel
│   └── manifest.json       # Extension configurations & permissions
├── index.js                # Express.js rules engine & server entrypoint
├── package.json            # Node dependencies & scripts
├── test.js                 # Automatic test runner for scoring heuristics
└── README.md               # Documentation
```

---

## 🛠️ Getting Started

### 1. Running the Backend Locally
To run the server locally on port `3000`:
1. Navigate to the root directory:
   ```bash
   cd ecocart-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* Create a `.env` file in the root directory and add your Gemini API Key to enable AI evaluations:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2. Loading the Chrome Extension
1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (toggle switch in the top-right corner).
3. Click **Load unpacked** in the top-left.
4. Select the `ecocart-extension` folder located inside the `ecocart-backend` directory.

---

## 🌐 Production Deployment

The backend server is fully optimized to run on any cloud hosting provider like **Render** or **Railway**:

1. Go to [Render](https://render.com/) and create a **Web Service**.
2. Connect your GitHub repository.
3. Configure the build parameters:
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Set the Environment Variable: Add `GEMINI_API_KEY` under the Environment tab if you wish to use AI evaluations.
5. Deploy. Copy your live Render URL (e.g. `https://ecocart-backend-mgo6.onrender.com`).

### Connecting your Extension to a Live Server
By default, this repository's extension is pre-configured to hit your live Render server. To redirect it to any other endpoint:
1. Open the extension popup in Chrome.
2. Click **⚙️ Configure Backend URL** at the bottom of the dashboard.
3. Enter your live endpoint (e.g., `https://my-custom-backend.onrender.com`) and click **Save**.

---

## 🧪 Testing
The backend features an automated test script that tests 6 distinct category cases (including star ratings, synthetic penalties, and unknown baseline cases). Run it locally with:
```bash
node test.js
```
