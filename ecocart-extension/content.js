// content.js

// Safe helper to check if the extension context is still valid (e.g. extension hasn't been reloaded/updated)
function isContextValid() {
  try {
    return typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getManifest === 'function' && !!chrome.runtime.getManifest();
  } catch (e) {
    return false;
  }
}

// Inject global styles for the widget and badge
try {
  if (isContextValid()) {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ecocart-pulse {
        0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
        100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
      }

      @keyframes ecocart-pulse-yellow {
        0% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(241, 196, 15, 0); }
        100% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0); }
      }

      @keyframes ecocart-pulse-red {
        0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
        100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
      }

      #ecocart-badge {
        position: fixed;
        bottom: 25px;
        right: 25px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 35px;
        cursor: pointer;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 700;
        font-size: 15px;
        border: 1.5px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      #ecocart-badge.eco-good {
        background: linear-gradient(135deg, #2ecc71, #27ae60);
        color: white;
        animation: ecocart-pulse 2s infinite;
      }

      #ecocart-badge.eco-medium {
        background: linear-gradient(135deg, #f1c40f, #f39c12);
        color: #2c3e50;
        animation: ecocart-pulse-yellow 2s infinite;
      }

      #ecocart-badge.eco-bad {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        animation: ecocart-pulse-red 2s infinite;
      }

      #ecocart-badge:hover {
        transform: translateY(-4px) scale(1.04);
      }

      /* Inline Widget styling */
      .ecocart-inline-widget {
        background: rgba(255, 255, 255, 0.95);
        border: 1.5px solid #e0e0e0;
        border-radius: 14px;
        padding: 16px;
        margin: 15px 0;
        font-family: system-ui, -apple-system, sans-serif;
        box-shadow: 0 4px 15px rgba(0,0,0,0.04);
        transition: all 0.3s ease;
        width: 100%;
        max-width: 500px;
      }

      .ecocart-inline-widget:hover {
        box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        border-color: #bdc3c7;
      }

      .ecocart-inline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .ecocart-inline-title {
        font-weight: 700;
        font-size: 15px;
        color: #2c3e50;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .ecocart-inline-score {
        font-size: 20px;
        font-weight: 800;
        padding: 4px 12px;
        border-radius: 20px;
        color: white;
      }

      .ecocart-inline-score.eco-good {
        background: #2ecc71;
      }

      .ecocart-inline-score.eco-medium {
        background: #f1c40f;
        color: #333;
      }

      .ecocart-inline-score.eco-bad {
        background: #e74c3c;
      }

      .ecocart-inline-tip {
        font-size: 12.5px;
        color: #555555;
        line-height: 1.4;
        margin-bottom: 12px;
      }

      .ecocart-inline-actions {
        display: flex;
        gap: 8px;
      }

      .ecocart-inline-btn {
        background: #f1f2f6;
        border: none;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 11px;
        color: #2c3e50;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .ecocart-inline-btn:hover {
        background: #dfe4ea;
      }

      .ecocart-inline-btn.btn-action {
        background: #2ecc71;
        color: white;
      }

      .ecocart-inline-btn.btn-action:hover {
        background: #27ae60;
      }
    `;
    document.head.appendChild(style);
  }
} catch (e) {
  console.error("EcoCart: Style injection failed", e);
}

// Function to extract brand, product title, and description/features defensively
function extractProductDetails() {
  let title = "";
  let brand = "";
  let description = "";

  if (!isContextValid()) return { title, brand, description };

  try {
    const host = window.location.hostname;

    if (host.includes("amazon.")) {
      const titleEl = document.querySelector("#productTitle");
      if (titleEl && titleEl.textContent) title = titleEl.textContent.trim();

      const brandEl = document.querySelector("#bylineInfo") || document.querySelector("#brand") || document.querySelector(".brand-link");
      if (brandEl && brandEl.textContent) {
        brand = brandEl.textContent.trim()
                       .replace(/brand:\s*/gi, "")
                       .replace(/visit the\s+/gi, "")
                       .replace(/\s+store/gi, "")
                       .trim();
      }

      const featureBullets = document.querySelector("#feature-bullets");
      if (featureBullets && featureBullets.innerText) description += " " + featureBullets.innerText;
      const prodDesc = document.querySelector("#productDescription");
      if (prodDesc && prodDesc.innerText) description += " " + prodDesc.innerText;
      const detailBullets = document.querySelector("#detailBullets_feature_div");
      if (detailBullets && detailBullets.innerText) description += " " + detailBullets.innerText;

    } else if (host.includes("ebay.")) {
      const titleEl = document.querySelector(".x-item-title__mainTitle") || document.querySelector("h1.x-item-title");
      if (titleEl && titleEl.textContent) title = titleEl.textContent.trim();

      const specificsLabels = document.querySelectorAll(".ux-labels-values__labels");
      specificsLabels.forEach(labelEl => {
        if (labelEl && labelEl.textContent.toLowerCase().includes("brand")) {
          const valEl = labelEl.nextElementSibling;
          if (valEl && valEl.textContent) brand = valEl.textContent.trim();
        }
      });

      const specsTable = document.querySelector(".ux-layout-section--itemSpecifics");
      if (specsTable && specsTable.innerText) description += " " + specsTable.innerText;

    } else if (host.includes("walmart.")) {
      const titleEl = document.querySelector("h1") || document.querySelector("h1[itemprop='name']");
      if (titleEl && titleEl.textContent) title = titleEl.textContent.trim();

      const brandEl = document.querySelector("a[itemprop='brand']") || document.querySelector(".brand-name") || document.querySelector("[data-testid='brand-name']");
      if (brandEl && brandEl.textContent) brand = brandEl.textContent.trim();

      const wmtDesc = document.querySelector(".mb3") || document.querySelector("[data-testid='product-description']") || document.querySelector("#additional-info-section");
      if (wmtDesc && wmtDesc.innerText) description += " " + wmtDesc.innerText;
    }

    // Fallback: OpenGraph and general meta tags
    if (!title) {
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]');
      if (ogTitle) title = ogTitle.getAttribute("content") || "";
      else title = document.title || "";
    }

    if (!brand) {
      const metaBrand = document.querySelector('meta[property="product:brand"]') || 
                        document.querySelector('meta[property="og:brand"]') || 
                        document.querySelector('meta[name="brand"]') ||
                        document.querySelector('[itemprop="brand"]');
      if (metaBrand) {
        brand = metaBrand.getAttribute("content") || metaBrand.textContent || "";
      } else if (title) {
        brand = title.split(" ")[0] || "";
      }
    }

    if (!description) {
      const metaDesc = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
      if (metaDesc) description = metaDesc.getAttribute("content") || "";
    }
  } catch (e) {
    console.error("EcoCart: Extraction error", e);
  }

  title = title ? title.trim() : "";
  brand = brand ? brand.trim() : "Unknown Brand";
  description = description ? description.trim() : "";

  return { title, brand, description };
}

async function analyzeProduct() {
  if (!isContextValid()) return;

  try {
    const details = extractProductDetails();
    if (!details.title) return;

    chrome.runtime.sendMessage(
      { 
        action: "analyze", 
        data: { 
          name: details.title, 
          brand: details.brand, 
          description: details.description 
        } 
      },
      (response) => {
        if (!isContextValid()) return; // Exit if context invalidated during async fetch

        try {
          if (chrome.runtime.lastError) {
            console.log("EcoCart: Runtime error communicating with background script:", chrome.runtime.lastError.message);
            return;
          }
          
          if (response && response.success) {
            const data = response.data;
            chrome.storage.local.set({ currentProduct: { ...details, ...data } });
            
            // Inject inline widget first
            injectInlineWidget(details, data);
            
            // Inject/update floating badge
            injectEcoBadge(data.score);
          } else {
            console.log("EcoCart: Could not analyze product. Is local backend running on http://localhost:3000? Error:", response ? response.error : "Unknown error");
          }
        } catch (innerErr) {
          console.error("EcoCart: Response process error", innerErr);
        }
      }
    );
  } catch (e) {
    console.error("EcoCart: analyzeProduct error", e);
  }
}

function injectInlineWidget(details, data) {
  if (!isContextValid()) return false;

  try {
    if (document.querySelector(".ecocart-inline-widget")) return false;

    const host = window.location.hostname;
    let parent = null;
    let referenceNode = null;

    if (host.includes("amazon.")) {
      parent = document.querySelector("#centerCol");
      if (parent) {
        referenceNode = document.querySelector("#averageCustomerReviews") || document.querySelector("#titleSection");
      }
    } else if (host.includes("ebay.")) {
      parent = document.querySelector(".x-buybox-section") || document.querySelector(".x-item-title");
      if (parent) {
        referenceNode = parent.firstChild;
      }
    } else if (host.includes("walmart.")) {
      parent = document.querySelector("[data-testid='price-and-shipping-card']") || document.querySelector(".flex-column.justify-start");
      if (parent) {
        referenceNode = parent.firstChild;
      }
    }

    if (!parent) return false;

    const widget = document.createElement("div");
    widget.className = "ecocart-inline-widget";

    let scoreClass = "eco-good";
    if (data.score < 40) scoreClass = "eco-bad";
    else if (data.score < 75) scoreClass = "eco-medium";

    widget.innerHTML = `
      <div class="ecocart-inline-header">
        <div class="ecocart-inline-title">🌿 EcoCart Analysis</div>
        <div class="ecocart-inline-score ${scoreClass}">${data.score}</div>
      </div>
      <div class="ecocart-inline-tip">${data.tip}</div>
      <div class="ecocart-inline-actions">
        <button class="ecocart-inline-btn btn-action" id="ecocart-btn-details">View Breakdown</button>
        ${data.alternatives && data.alternatives.length > 0 ? `<button class="ecocart-inline-btn" id="ecocart-btn-alts">Greener Alternatives (${data.alternatives.length})</button>` : ''}
      </div>
    `;

    if (referenceNode && referenceNode.parentNode) {
      referenceNode.parentNode.insertBefore(widget, referenceNode.nextSibling);
    } else {
      parent.appendChild(widget);
    }

    widget.querySelector("#ecocart-btn-details").addEventListener("click", () => {
      showNotificationCard(data.score);
    });

    const altsBtn = widget.querySelector("#ecocart-btn-alts");
    if (altsBtn) {
      altsBtn.addEventListener("click", () => {
        showNotificationCard(data.score);
        setTimeout(() => {
          const card = document.querySelector("#ecocart-card");
          if (card) card.scrollTop = card.scrollHeight;
        }, 150);
      });
    }

    return true;
  } catch (e) {
    console.error("EcoCart: Injected widget creation error", e);
    return false;
  }
}

function injectEcoBadge(score) {
  if (!isContextValid()) return;

  try {
    if (document.querySelector("#ecocart-badge")) return;

    const badge = document.createElement("div");
    badge.id = "ecocart-badge";

    let scoreClass = "eco-good";
    let emoji = "🌿";

    if (score < 40) {
      scoreClass = "eco-bad";
      emoji = "⚠️";
    } else if (score < 75) {
      scoreClass = "eco-medium";
      emoji = "💡";
    }

    badge.className = scoreClass;
    badge.innerHTML = `<span>${emoji}</span> Eco Score: ${score}`;

    badge.addEventListener("click", () => {
      showNotificationCard(score);
    });

    document.body.appendChild(badge);
  } catch (e) {
    console.error("EcoCart: Badge creation error", e);
  }
}

function showNotificationCard(score) {
  if (!isContextValid()) return;

  try {
    const existingCard = document.querySelector("#ecocart-card");
    if (existingCard) {
      existingCard.remove();
      return;
    }

    chrome.storage.local.get("currentProduct", (data) => {
      if (!isContextValid()) return;

      try {
        if (!data || !data.currentProduct) return;
        const prod = data.currentProduct;

        const card = document.createElement("div");
        card.id = "ecocart-card";
        card.style.position = "fixed";
        card.style.bottom = "90px";
        card.style.right = "25px";
        card.style.width = "340px";
        card.style.maxHeight = "480px";
        card.style.overflowY = "auto";
        card.style.backgroundColor = "#ffffff";
        card.style.color = "#333333";
        card.style.borderRadius = "20px";
        card.style.padding = "24px";
        card.style.zIndex = "999999";
        card.style.boxShadow = "0 15px 45px rgba(0,0,0,0.18)";
        card.style.fontFamily = "system-ui, -apple-system, sans-serif";
        card.style.transition = "all 0.3s ease";
        card.style.border = "1px solid rgba(0,0,0,0.08)";

        const closeBtn = document.createElement("div");
        closeBtn.textContent = "✕";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "16px";
        closeBtn.style.right = "16px";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontWeight = "bold";
        closeBtn.style.color = "#888888";
        closeBtn.style.fontSize = "16px";
        closeBtn.addEventListener("click", () => card.remove());
        card.appendChild(closeBtn);

        const title = document.createElement("h3");
        title.textContent = "EcoCart Analysis";
        title.style.margin = "0 0 10px 0";
        title.style.color = "#2ecc71";
        title.style.fontSize = "18px";
        title.style.fontWeight = "800";
        card.appendChild(title);

        const prodTitle = document.createElement("p");
        const titleText = prod.title || "";
        prodTitle.textContent = titleText.length > 70 ? titleText.slice(0, 67) + "..." : titleText;
        prodTitle.style.fontSize = "12px";
        prodTitle.style.color = "#666666";
        prodTitle.style.margin = "0 0 16px 0";
        prodTitle.style.lineHeight = "1.4";
        card.appendChild(prodTitle);

        const scoreVal = document.createElement("div");
        scoreVal.style.display = "flex";
        scoreVal.style.alignItems = "center";
        scoreVal.style.marginBottom = "18px";
        
        let scoreColor = "#2ecc71";
        if (score < 40) scoreColor = "#e74c3c";
        else if (score < 75) scoreColor = "#f1c40f";

        scoreVal.innerHTML = `
          <div style="font-size: 32px; font-weight: 800; color: ${scoreColor}; margin-right: 12px; font-family: system-ui, -apple-system, sans-serif;">${score}</div>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #2c3e50;">Eco Score</div>
            <div style="font-size: 11px; color: #888888; text-transform: uppercase; font-weight: 600;">${prod.category || "General Goods"}</div>
          </div>
        `;
        card.appendChild(scoreVal);

        const tipEl = document.createElement("div");
        tipEl.textContent = prod.tip || "";
        tipEl.style.fontSize = "13px";
        tipEl.style.lineHeight = "1.5";
        tipEl.style.backgroundColor = "#f8f9fa";
        tipEl.style.padding = "12px 16px";
        tipEl.style.borderRadius = "10px";
        tipEl.style.marginBottom = "18px";
        tipEl.style.borderLeft = `5px solid ${scoreColor}`;
        card.appendChild(tipEl);

        if (prod.alternatives && prod.alternatives.length > 0) {
          const altTitle = document.createElement("div");
          altTitle.textContent = "Green Alternatives:";
          altTitle.style.fontWeight = "700";
          altTitle.style.fontSize = "13px";
          altTitle.style.marginBottom = "10px";
          altTitle.style.textTransform = "uppercase";
          altTitle.style.color = "#7f8c8d";
          card.appendChild(altTitle);

          prod.alternatives.forEach(alt => {
            const altEl = document.createElement("div");
            altEl.style.fontSize = "12px";
            altEl.style.marginBottom = "10px";
            altEl.style.padding = "10px 14px";
            altEl.style.borderRadius = "8px";
            altEl.style.backgroundColor = "#e8f8f5";
            altEl.style.border = "1px solid #a3e4d7";
            altEl.style.lineHeight = "1.4";
            altEl.innerHTML = `<strong style="color: #16a085;">${alt.name}</strong>: ${alt.reason}`;
            card.appendChild(altEl);
          });
        }

        document.body.appendChild(card);
      } catch (innerCardErr) {
        console.error("EcoCart: Notification card render failed", innerCardErr);
      }
    });
  } catch (e) {
    console.error("EcoCart: showNotificationCard failed", e);
  }
}

// Watch for SPA URL changes
try {
  let lastUrl = location.href;
  new MutationObserver(() => {
    try {
      if (!isContextValid()) return; // Exit observer loop if context is dead
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        const oldWidget = document.querySelector(".ecocart-inline-widget");
        if (oldWidget) oldWidget.remove();
        const oldBadge = document.querySelector("#ecocart-badge");
        if (oldBadge) oldBadge.remove();
        const oldCard = document.querySelector("#ecocart-card");
        if (oldCard) oldCard.remove();
        setTimeout(analyzeProduct, 1000);
      }
    } catch (obsErr) {
      console.error("EcoCart: Observer cycle error", obsErr);
    }
  }).observe(document, {subtree: true, childList: true});
} catch (e) {
  console.error("EcoCart: MutationObserver setup failed", e);
}

// Initial run
try {
  if (isContextValid()) {
    analyzeProduct();
  }
} catch (e) {
  console.error("EcoCart: Initial analysis trigger failed", e);
}
