const { getEcoScore } = require('./index.js');
const assert = require('assert');

console.log("Running EcoCart scoring engine tests...");

// Test Case 1: Eco-friendly clothing from Patagonia
try {
  const res = getEcoScore("Organic Cotton T-Shirt", "Patagonia");
  console.log("Test Case 1 (Patagonia Organic T-Shirt):", res);
  assert(res.score >= 90, "Patagonia organic t-shirt should have a very high score");
  assert.strictEqual(res.category, "Clothing & Textiles");
  assert(res.detectedKeywords.ecoMaterials.includes("organic cotton"));
  assert.strictEqual(res.alternatives.length, 0);
  console.log("✅ Test Case 1 passed!");
} catch (e) {
  console.error("❌ Test Case 1 failed:", e.message);
  process.exit(1);
}

// Test Case 2: Unfriendly plastic toothbrush from Walmart
try {
  const res = getEcoScore("Plastic Toothbrush Pack of 4", "Walmart");
  console.log("Test Case 2 (Walmart Plastic Toothbrush):", res);
  assert(res.score <= 40, "Plastic toothbrush from Walmart should have a low score");
  assert.strictEqual(res.category, "Household & Kitchen");
  assert(res.detectedKeywords.badMaterials.includes("plastic"));
  assert(res.alternatives.some(alt => alt.name === "Bamboo Toothbrush"));
  console.log("✅ Test Case 2 passed!");
} catch (e) {
  console.error("❌ Test Case 2 failed:", e.message);
  process.exit(1);
}

// Test Case 3: Neutral electronics from Samsung
try {
  const res = getEcoScore("Galaxy USB-C Phone Charger Cable", "Samsung");
  console.log("Test Case 3 (Samsung Charger):", res);
  assert(res.score >= 35 && res.score <= 45, "Samsung charger should have a capped low score due to absence of eco attributes");
  assert.strictEqual(res.category, "Electronics");
  console.log("✅ Test Case 3 passed!");
} catch (e) {
  console.error("❌ Test Case 3 failed:", e.message);
  process.exit(1);
}

// Test Case 4: FSC certified wood table from IKEA
try {
  const res = getEcoScore("FSC Certified Wood Coffee Table", "IKEA");
  console.log("Test Case 4 (IKEA Wood Table):", res);
  assert(res.score >= 80, "FSC certified wood table from IKEA should score high");
  assert.strictEqual(res.category, "Household & Kitchen");
  assert(res.detectedKeywords.certifications.includes("fsc certified"));
  assert(res.detectedKeywords.ecoMaterials.includes("wood"));
  console.log("✅ Test Case 4 passed!");
} catch (e) {
  console.error("❌ Test Case 4 failed:", e.message);
  process.exit(1);
}

// Test Case 5: Description scanning verification
try {
  const res = getEcoScore("Standard Shirt", "H&M", "This product is made of organic cotton and carries GOTS certification.");
  console.log("Test Case 5 (H&M Shirt with organic/GOTS description):", res);
  assert(res.score >= 70, "H&M shirt with organic cotton and GOTS in description should have high score");
  assert(res.detectedKeywords.ecoMaterials.includes("organic cotton"));
  assert(res.detectedKeywords.certifications.includes("gots"));
  console.log("✅ Test Case 5 passed!");
} catch (e) {
  console.error("❌ Test Case 5 failed:", e.message);
  process.exit(1);
}

// Test Case 6: Appliance energy efficiency rating checks
try {
  const res = getEcoScore("Voltas Vectra AC", "Voltas", "5 Star energy rating inverter AC copper condenser R32 gas");
  console.log("Test Case 6 (Voltas 5 Star Inverter AC):", res);
  assert(res.score >= 90, "Voltas 5 star AC should have a very high score due to efficiency");
  assert(res.detectedKeywords.certifications.includes("5 star energy rating"));
  assert(res.detectedKeywords.ecoMaterials.includes("inverter technology"));
  assert(res.detectedKeywords.ecoMaterials.includes("r32 refrigerant (low gwp)"));
  assert(res.detectedKeywords.ecoMaterials.includes("copper condenser"));
  console.log("✅ Test Case 6 passed!");
} catch (e) {
  console.error("❌ Test Case 6 failed:", e.message);
  process.exit(1);
}

console.log("\n🎉 All tests passed successfully!");
process.exit(0);
