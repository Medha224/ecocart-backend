// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.action === "analyze") {
    try {
      const { name, brand, description } = message.data || {};
      
      fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name || "", brand: brand || "", description: description || "" })
      })
      .then(response => {
        if (!response.ok) throw new Error("Backend server error");
        return response.json();
      })
      .then(data => {
        try {
          sendResponse({ success: true, data });
        } catch (sendErr) {
          console.error("EcoCart background: sendResponse failed", sendErr);
        }
      })
      .catch(error => {
        console.error("EcoCart background fetch error:", error);
        try {
          sendResponse({ success: false, error: error.message });
        } catch (sendErr) {
          console.error("EcoCart background: sendResponse error fallback failed", sendErr);
        }
      });
    } catch (err) {
      console.error("EcoCart background: message handling error", err);
      sendResponse({ success: false, error: err.message });
    }

    return true; // Keep the message channel open for async response
  }
});
