// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const emptyState = document.getElementById("empty-state");
  const dashboardState = document.getElementById("dashboard-state");

  // Fetch current product from storage
  chrome.storage.local.get("currentProduct", (data) => {
    if (data.currentProduct && data.currentProduct.title) {
      // Show dashboard
      emptyState.classList.add("hidden");
      dashboardState.classList.remove("hidden");

      populateDashboard(data.currentProduct);
    } else {
      // Show empty state
      emptyState.classList.remove("hidden");
      dashboardState.classList.add("hidden");
    }
  });

  // Settings Panel Logic
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const backendUrlInput = document.getElementById("backend-url-input");
  const saveSettingsBtn = document.getElementById("save-settings-btn");
  const settingsStatus = document.getElementById("settings-status");

  // Load saved backend URL
  chrome.storage.local.get("backendUrl", (data) => {
    backendUrlInput.value = data.backendUrl || "http://localhost:3000";
  });

  // Toggle panel visibility
  settingsToggle.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
  });

  // Save settings
  saveSettingsBtn.addEventListener("click", () => {
    let url = backendUrlInput.value.trim();
    if (!url) {
      url = "http://localhost:3000";
    }
    
    // Normalize URL
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }

    chrome.storage.local.set({ backendUrl: url }, () => {
      settingsStatus.textContent = "URL Saved Successfully! 🌿";
      settingsStatus.style.color = "var(--primary-green-dark)";
      setTimeout(() => {
        settingsStatus.textContent = "";
      }, 2500);
    });
  });
});

function populateDashboard(product) {
  // Elements
  const categoryEl = document.getElementById("product-category");
  const titleEl = document.getElementById("product-title");
  const brandEl = document.getElementById("product-brand");
  const scoreNumberEl = document.getElementById("score-number");
  const tipEl = document.getElementById("score-tip");
  
  // Score bars
  const barBrand = document.getElementById("bar-brand");
  const barMaterials = document.getElementById("bar-materials");
  const barCerts = document.getElementById("bar-certs");
  const barPkg = document.getElementById("bar-pkg");

  const valBrand = document.getElementById("score-brand-val");
  const valMaterials = document.getElementById("score-materials-val");
  const valCerts = document.getElementById("score-certs-val");
  const valPkg = document.getElementById("score-pkg-val");

  // Title and basic info
  categoryEl.textContent = product.category || "General Goods";
  titleEl.textContent = product.title;
  brandEl.textContent = product.brand || "Unknown Brand";
  scoreNumberEl.textContent = product.score;
  tipEl.textContent = product.tip || "No analysis details available.";

  // Dynamic colors for score
  let scoreColor = "#2ecc71"; // Green
  if (product.score < 40) {
    scoreColor = "#e74c3c"; // Red
  } else if (product.score < 75) {
    scoreColor = "#f1c40f"; // Yellow
  }

  scoreNumberEl.style.color = scoreColor;

  // Animate circular progress ring
  const circle = document.getElementById("progress-circle");
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;

  circle.style.stroke = scoreColor;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  // Set offset with a slight timeout to trigger animation transition
  setTimeout(() => {
    const offset = circumference - (product.score / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }, 100);

  // Sub-metrics progress bars
  const bd = product.breakdown || { brandScore: 50, materialsAdjustment: 0, certificationsBonus: 0, packagingAdjustment: 0 };
  
  // Brand score (0 to 100)
  barBrand.style.width = `${bd.brandScore}%`;
  valBrand.textContent = `${bd.brandScore}/100`;

  // Materials score (centered at 50%, adjustments can move it up or down)
  const matPct = Math.max(0, Math.min(100, 50 + bd.materialsAdjustment * 2.5));
  barMaterials.style.width = `${matPct}%`;
  valMaterials.textContent = bd.materialsAdjustment >= 0 ? `+${bd.materialsAdjustment} pts` : `${bd.materialsAdjustment} pts`;
  if (bd.materialsAdjustment < 0) {
    barMaterials.style.background = "var(--alert-gradient)";
  } else {
    barMaterials.style.background = "var(--eco-gradient)";
  }

  // Certifications bonus (0 to 100%)
  const certPct = Math.min(100, bd.certificationsBonus * 3);
  barCerts.style.width = `${certPct}%`;
  valCerts.textContent = `+${bd.certificationsBonus} pts`;

  // Packaging & Disposability (centered at 50%)
  const pkgPct = Math.max(0, Math.min(100, 50 + bd.packagingAdjustment * 2.5));
  barPkg.style.width = `${pkgPct}%`;
  valPkg.textContent = bd.packagingAdjustment >= 0 ? `+${bd.packagingAdjustment} pts` : `${bd.packagingAdjustment} pts`;
  if (bd.packagingAdjustment < 0) {
    barPkg.style.background = "var(--alert-gradient)";
  } else {
    barPkg.style.background = "var(--eco-gradient)";
  }

  // Detected Indicators Tags
  const tagsWrapper = document.getElementById("detected-tags");
  tagsWrapper.innerHTML = ""; // Clear
  const kws = product.detectedKeywords || { ecoMaterials: [], badMaterials: [], certifications: [], ecoPackaging: [], badPackaging: [] };

  let totalTags = 0;

  // Add eco-materials
  kws.ecoMaterials.forEach(tag => {
    createTagElement(tagsWrapper, tag, "tag-eco", "🌱");
    totalTags++;
  });

  // Add bad-materials
  kws.badMaterials.forEach(tag => {
    createTagElement(tagsWrapper, tag, "tag-bad", "⚠️");
    totalTags++;
  });

  // Add certifications
  kws.certifications.forEach(tag => {
    createTagElement(tagsWrapper, tag, "tag-cert", "🏆");
    totalTags++;
  });

  // Add eco-packaging
  kws.ecoPackaging.forEach(tag => {
    createTagElement(tagsWrapper, tag, "tag-eco", "📦");
    totalTags++;
  });

  // Add bad-packaging
  kws.badPackaging.forEach(tag => {
    createTagElement(tagsWrapper, tag, "tag-bad", "🗑️");
    totalTags++;
  });

  // Hide indicator section if no tags are present
  const keywordsSection = document.getElementById("keywords-section");
  if (totalTags === 0) {
    keywordsSection.classList.add("hidden");
  } else {
    keywordsSection.classList.remove("hidden");
  }

  // Alternatives List
  const alternativesSection = document.getElementById("alternatives-section");
  const alternativesList = document.getElementById("alternatives-list");
  alternativesList.innerHTML = ""; // Clear

  if (product.alternatives && product.alternatives.length > 0) {
    alternativesSection.classList.remove("hidden");
    product.alternatives.forEach(alt => {
      const card = document.createElement("div");
      card.className = "alternative-card";
      card.innerHTML = `
        <span class="alternative-bullet">💚</span>
        <div class="alternative-details">
          <div class="alternative-name">${alt.name}</div>
          <div class="alternative-reason">${alt.reason}</div>
        </div>
      `;
      alternativesList.appendChild(card);
    });
  } else {
    alternativesSection.classList.add("hidden");
  }
}

function createTagElement(parent, text, className, icon) {
  const span = document.createElement("span");
  span.className = `tag ${className}`;
  span.innerHTML = `<span>${icon}</span> ${text}`;
  parent.appendChild(span);
}
