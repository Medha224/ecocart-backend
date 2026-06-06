const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Generative AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Advanced brand rating database
const brandDb = {
  // Eco-friendly / Sustainable brands (80-100)
  "patagonia": 95,
  "allbirds": 88,
  "seventh generation": 90,
  "method": 85,
  "mrs. meyer's": 82,
  "mrs. meyers": 82,
  "lush": 87,
  "dr. bronner's": 92,
  "dr. bronners": 92,
  "burt's bees": 85,
  "burts bees": 85,
  "ecotools": 88,
  "tentree": 90,
  "outerknown": 88,
  "reformation": 85,
  "beyond meat": 80,
  "ecover": 85,
  "veja": 88,
  "cotopaxi": 85,
  "chicosbag": 90,
  "klean kanteen": 92,
  "hydro flask": 78,
  "yeti": 65,

  // Moderate / Standard brands (55-79)
  "apple": 70,
  "samsung": 65,
  "sony": 68,
  "google": 72,
  "microsoft": 70,
  "nike": 62,
  "adidas": 65,
  "levi's": 68,
  "levis": 68,
  "ikea": 72,
  "unilever": 58,
  "procter & gamble": 55,
  "p&g": 55,
  "l'oreal": 58,
  "loreal": 58,
  "starbucks": 60,
  "target": 60,
  "walmart": 55,
  "voltas": 65,
  "daikin": 72,
  "carrier": 65,
  "blue star": 62,
  "bluestar": 62,
  "hitachi": 68,
  "whirlpool": 65,
  "godrej": 68,
  "panasonic": 70,
  "lg": 68,

  // High Impact / Fast Fashion / Plastic-heavy brands (20-45)
  "shein": 15,
  "temu": 15,
  "zara": 35,
  "h&m": 45,
  "h and m": 45,
  "forever 21": 25,
  "boohoo": 20,
  "asos": 38,
  "amazon essentials": 40,
  "nestle": 35,
  "coca-cola": 30,
  "coca cola": 30,
  "pepsico": 32,
  "pepsi": 32,
  "mcdonald's": 35,
  "mcdonalds": 35
};

const materialsEco = [
  { name: "organic cotton", score: 15 },
  { name: "recycled polyester", score: 12 },
  { name: "recycled nylon", score: 12 },
  { name: "recycled plastic", score: 12 },
  { name: "bamboo", score: 15 },
  { name: "hemp", score: 15 },
  { name: "linen", score: 12 },
  { name: "tencel", score: 12 },
  { name: "lyocell", score: 12 },
  { name: "glass", score: 10 },
  { name: "wood", score: 8 },
  { name: "silicone", score: 5 },
  { name: "cork", score: 12 },
  { name: "beeswax", score: 8 },
  { name: "stainless steel", score: 10 }
];

const materialsBad = [
  { name: "polyester", score: -12 },
  { name: "nylon", score: -10 },
  { name: "acrylic", score: -12 },
  { name: "polyurethane", score: -10 },
  { name: "pvc", score: -20 },
  { name: "polyvinyl chloride", score: -20 },
  { name: "styrofoam", score: -20 },
  { name: "polystyrene", score: -20 },
  { name: "microfiber", score: -8 },
  { name: "synthetic", score: -8 },
  { name: "plastic", score: -15 },
  { name: "leather", score: -5 },
  { name: "disposable", score: -15 },
  { name: "single-use", score: -15 }
];

const certifications = [
  { name: "gots", score: 15 },
  { name: "global organic textile standard", score: 15 },
  { name: "oeko-tex", score: 12 },
  { name: "oekotex", score: 12 },
  { name: "usda organic", score: 12 },
  { name: "fsc certified", score: 12 },
  { name: "fsc certification", score: 12 },
  { name: "fair trade", score: 10 },
  { name: "energy star", score: 10 },
  { name: "leaping bunny", score: 8 },
  { name: "cruelty-free", score: 8 },
  { name: "cruelty free", score: 8 },
  { name: "cradle to cradle", score: 15 },
  { name: "carbon neutral", score: 10 },
  { name: "climate neutral", score: 10 }
];

const packagingEco = [
  { name: "biodegradable", score: 12 },
  { name: "compostable", score: 12 },
  { name: "reusable", score: 10 },
  { name: "zero waste", score: 12 },
  { name: "refillable", score: 10 },
  { name: "recyclable", score: 8 }
];

const packagingBad = [
  { name: "single-use", score: -12 },
  { name: "disposable", score: -12 },
  { name: "plastic bag", score: -8 },
  { name: "plastic wrap", score: -8 },
  { name: "bubble wrap", score: -8 }
];

function findBrandScore(brandName) {
  if (!brandName) return null;
  const normalized = brandName.toLowerCase().trim();
  
  if (brandDb[normalized] !== undefined) {
    return brandDb[normalized];
  }
  
  for (const [key, val] of Object.entries(brandDb)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val;
    }
  }
  
  return null;
}

function detectCategory(name) {
  name = name.toLowerCase();
  
  const categories = {
    "Clothing & Textiles": ["shirt", "t-shirt", "tshirt", "pants", "jeans", "jacket", "socks", "underwear", "shoes", "sneakers", "dress", "clothing", "fabric", "cotton", "wool", "polyester", "nylon", "apparel"],
    "Electronics": ["phone", "smartphone", "laptop", "tablet", "charger", "cable", "computer", "monitor", "tv", "television", "battery", "earphone", "headphone", "speaker", "camera", "electronic", "device"],
    "Household & Kitchen": ["toothbrush", "cup", "plate", "napkin", "detergent", "soap", "cleaner", "sponge", "furniture", "sheet", "towel", "bag", "box", "bottle", "container", "straw", "fork", "spoon", "knife", "tableware", "utensil", "table", "desk", "chair", "bed", "bowl", "pillow"],
    "Cosmetics & Personal Care": ["shampoo", "conditioner", "lotion", "cream", "serum", "makeup", "lipstick", "deodorant", "skincare", "body wash", "sunscreen", "moisturizer", "perfume", "fragrance"],
    "Food & Groceries": ["snack", "coffee", "tea", "organic food", "chocolate", "milk", "juice", "beverage", "cereal", "pasta", "fruit", "vegetable", "snack", "cookie", "candy"]
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }
  
  return "General Goods";
}

function getAlternatives(name, score) {
  if (score >= 75) return [];
  
  name = name.toLowerCase();
  const alternatives = [];
  
  if (name.includes("toothbrush")) {
    alternatives.push({ name: "Bamboo Toothbrush", reason: "Biodegradable handle, reduces plastic waste." });
  }
  if (name.includes("bottle") || name.includes("cup") || name.includes("mug")) {
    alternatives.push({ name: "Stainless Steel Water Bottle / Glass Cup", reason: "Reusable, eliminates single-use plastic bottles." });
  }
  if (name.includes("shirt") || name.includes("t-shirt") || name.includes("pants") || name.includes("jeans") || name.includes("apparel") || name.includes("clothing")) {
    alternatives.push({ name: "Organic Cotton or Hemp Clothing", reason: "Uses significantly less water and avoids microplastics." });
  }
  if (name.includes("bag") || name.includes("tote")) {
    alternatives.push({ name: "Reusable Cotton Canvas Tote Bag", reason: "Replaces thousands of single-use plastic shopping bags." });
  }
  if (name.includes("detergent") || name.includes("cleaner") || name.includes("soap") || name.includes("body wash")) {
    alternatives.push({ name: "Zero-Waste Laundry Detergent Sheets or Solid Soap Bars", reason: "Avoids large plastic packaging and reduces shipping weight." });
  }
  if (name.includes("straw")) {
    alternatives.push({ name: "Reusable Metal or Bamboo Straws", reason: "Reduces marine plastic pollution." });
  }
  if (name.includes("sponge") || name.includes("scrubber")) {
    alternatives.push({ name: "Natural Loofah / Coconut Fiber Sponge", reason: "100% compostable and doesn't shed microplastics." });
  }
  if (/\bac\b/i.test(name) || name.includes("air conditioner") || name.includes("cooling") || name.includes("cools")) {
    alternatives.push({ name: "5-Star Inverter AC (with R32 refrigerant)", reason: "Reduces power consumption by up to 35% and uses gas with 75% lower GWP." });
  }
  if (name.includes("phone") || name.includes("laptop") || name.includes("tablet") || name.includes("charger") || name.includes("cable") || name.includes("headphone") || name.includes("earphone")) {
    alternatives.push({ name: "Refurbished or Certified Pre-Owned Electronics", reason: "Extends product lifecycle and prevents resource-intensive e-waste." });
    alternatives.push({ name: "EPEAT Certified or Energy Star Electronics", reason: "Verified for energy efficiency and reduced toxics." });
  }
  if (name.includes("shampoo") || name.includes("conditioner") || name.includes("lotion") || name.includes("cream") || name.includes("makeup") || name.includes("cosmetic") || name.includes("deodorant")) {
    alternatives.push({ name: "Solid Shampoo / Solid Conditioner & Deodorant Bars", reason: "Eliminates plastic packaging entirely and uses organic, natural ingredients." });
  }
  if (name.includes("shoe") || name.includes("sneaker") || name.includes("footwear")) {
    alternatives.push({ name: "Recycled Ocean Plastic or Natural Rubber Shoes", reason: "Promotes circular economy and avoids virgin fossil-fuel synthetics." });
  }
  if (name.includes("notebook") || name.includes("paper") || name.includes("diary") || name.includes("book")) {
    alternatives.push({ name: "FSC-Certified 100% Recycled Paper Stationery", reason: "Protects ancient forests and requires less water and energy to produce." });
  }
  if (name.includes("plate") || name.includes("bowl") || name.includes("utensil") || name.includes("fork") || name.includes("spoon") || name.includes("knife")) {
    alternatives.push({ name: "Reusable Bamboo or Stainless Steel Kitchenware", reason: "Replaces disposable plastic or paper single-use tableware." });
  }
  if (name.includes("bulb") || name.includes("light") || name.includes("lamp")) {
    alternatives.push({ name: "Energy-efficient Smart LED Bulbs", reason: "Consumes 80% less energy and lasts up to 25 times longer than incandescent bulbs." });
  }
  if (name.includes("diaper") || name.includes("wipe")) {
    alternatives.push({ name: "Reusable Cloth Diapers or Biodegradable Wipes", reason: "Prevents non-biodegradable waste from sitting in landfills for hundreds of years." });
  }
  if (name.includes("furniture") || name.includes("chair") || name.includes("table") || name.includes("desk") || name.includes("bed")) {
    alternatives.push({ name: "FSC-Certified Solid Wood or Reclaimed Furniture", reason: "Ensures responsible forest management and prevents deforested wood sourcing." });
  }
  if (name.includes("coffee") || name.includes("tea") || name.includes("chocolate")) {
    alternatives.push({ name: "Fair Trade & USDA Organic Certified Food products", reason: "Ensures ethical wages for farmers and restricts chemical fertilizer/pesticide usage." });
  }
  
  if (alternatives.length === 0) {
    alternatives.push({ name: "FSC-certified or Recycled Content Alternatives", reason: "Reduces deforestation and promotes a circular economy." });
    alternatives.push({ name: "Certified Organic / Cruelty-Free options", reason: "Ensures sustainable farming and ethical testing practices." });
  }
  
  return alternatives;
}

function getEcoScore(name, brand, description = "") {
  name = name.toLowerCase();
  brand = brand.toLowerCase();
  const searchContent = (name + " " + description).toLowerCase();

  const category = detectCategory(name);
  let baseScore = findBrandScore(brand);

  if (baseScore === null) {
    switch (category) {
      case "Electronics":
        baseScore = 35;
        break;
      case "Clothing & Textiles":
        baseScore = 40;
        break;
      case "Household & Kitchen":
        baseScore = 40;
        break;
      case "Cosmetics & Personal Care":
        baseScore = 40;
        break;
      case "Food & Groceries":
        baseScore = 50;
        break;
      default:
        baseScore = 40;
    }
  }

  let materialsAdjustment = 0;
  let certificationsBonus = 0;
  let packagingAdjustment = 0;
  
  const detectedEcoMaterials = [];
  const detectedBadMaterials = [];
  const detectedCertifications = [];
  const detectedEcoPackaging = [];
  const detectedBadPackaging = [];

  // Appliance Energy Efficiency Heuristics
  const isAppliance = [/\bac\b/i, /air conditioner/i, /refrigerator/i, /fridge/i, /washing machine/i, /heater/i, /geyser/i, /microwave/i, /oven/i, /dryer/i, /dishwasher/i, /cooler/i].some(pattern => pattern.test(searchContent));

  if (isAppliance) {
    if (searchContent.includes("5 star") || searchContent.includes("5-star") || searchContent.includes("5star")) {
      certificationsBonus += 25;
      detectedCertifications.push("5 star energy rating");
    } else if (searchContent.includes("4 star") || searchContent.includes("4-star") || searchContent.includes("4star")) {
      certificationsBonus += 15;
      detectedCertifications.push("4 star energy rating");
    } else if (searchContent.includes("3 star") || searchContent.includes("3-star") || searchContent.includes("3star")) {
      certificationsBonus += 5;
      detectedCertifications.push("3 star energy rating");
    } else if (searchContent.includes("1 star") || searchContent.includes("1-star") || searchContent.includes("1star") || searchContent.includes("2 star") || searchContent.includes("2-star") || searchContent.includes("2star")) {
      materialsAdjustment -= 15;
      detectedBadMaterials.push("low energy rating (1-2 star)");
    }

    if (searchContent.includes("inverter")) {
      materialsAdjustment += 10;
      detectedEcoMaterials.push("inverter technology");
    } else if (searchContent.includes("non-inverter") || searchContent.includes("fixed speed")) {
      materialsAdjustment -= 10;
      detectedBadMaterials.push("fixed-speed compressor");
    }

    if (searchContent.includes("r32") || searchContent.includes("r-32")) {
      materialsAdjustment += 8;
      detectedEcoMaterials.push("r32 refrigerant (low gwp)");
    } else if (searchContent.includes("r22") || searchContent.includes("r-22")) {
      materialsAdjustment -= 15;
      detectedBadMaterials.push("r22 refrigerant (ozone depleting)");
    }

    if (searchContent.includes("copper")) {
      materialsAdjustment += 5;
      detectedEcoMaterials.push("copper condenser");
    }
  }

  materialsEco.forEach(item => {
    if (searchContent.includes(item.name)) {
      materialsAdjustment += item.score;
      detectedEcoMaterials.push(item.name);
    }
  });

  materialsBad.forEach(item => {
    if (item.name === "polyester" && searchContent.includes("recycled polyester")) return;
    if (item.name === "nylon" && searchContent.includes("recycled nylon")) return;
    if (item.name === "plastic" && searchContent.includes("recycled plastic")) return;
    
    if (searchContent.includes(item.name)) {
      materialsAdjustment += item.score;
      detectedBadMaterials.push(item.name);
    }
  });

  certifications.forEach(item => {
    if (searchContent.includes(item.name)) {
      certificationsBonus += item.score;
      detectedCertifications.push(item.name);
    }
  });

  packagingEco.forEach(item => {
    if (searchContent.includes(item.name)) {
      packagingAdjustment += item.score;
      detectedEcoPackaging.push(item.name);
    }
  });
  packagingBad.forEach(item => {
    if (searchContent.includes(item.name)) {
      packagingAdjustment += item.score;
      detectedBadPackaging.push(item.name);
    }
  });

  // Enforce caps on adjustments to ensure balanced weightings
  materialsAdjustment = Math.max(-40, Math.min(40, materialsAdjustment));
  certificationsBonus = Math.min(30, certificationsBonus);
  packagingAdjustment = Math.max(-20, Math.min(20, packagingAdjustment));

  let score = baseScore + materialsAdjustment + certificationsBonus + packagingAdjustment;

  // Capping logic: if no positive eco-friendly attributes are detected, cap the score at 45
  const hasEcoAttributes = detectedEcoMaterials.length > 0 || detectedCertifications.length > 0 || detectedEcoPackaging.length > 0;
  if (!hasEcoAttributes && score > 45) {
    score = 45;
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;
  
  score = Math.round(score);

  let tip = "";
  if (score >= 80) {
    tip = "Excellent eco-friendly choice! 🌿 This product is made of sustainable materials or comes from a brand committed to the environment.";
  } else if (score >= 60) {
    tip = "A decent green alternative. Consider if there are options with better materials or certifications.";
  } else if (score >= 40) {
    tip = "Moderate environmental footprint. Try checking for plastic-free or organic certified alternatives.";
  } else {
    tip = "High environmental footprint! Avoid if possible. Consider choosing products made of renewable, recycled, or biodegradable materials.";
  }

  const alternatives = getAlternatives(name, score);

  return {
    score,
    tip,
    category,
    breakdown: {
      brandScore: baseScore,
      materialsAdjustment,
      certificationsBonus,
      packagingAdjustment
    },
    detectedKeywords: {
      ecoMaterials: detectedEcoMaterials.slice(0, 5),
      badMaterials: detectedBadMaterials.slice(0, 5),
      certifications: detectedCertifications.slice(0, 5),
      ecoPackaging: detectedEcoPackaging.slice(0, 5),
      badPackaging: detectedBadPackaging.slice(0, 5)
    },
    alternatives
  };
}

async function getEcoScoreAI(name, brand, description = "") {
  if (!genAI) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
You are EcoCart AI, a sustainability analysis assistant.
Analyze the following product details and determine its eco-friendliness score on a scale of 0 to 100.

Product Name: "${name}"
Brand: "${brand}"
Description/Specs: "${description}"

Evaluate based on:
1. Brand sustainability reputation (e.g. Patagonia vs Shein vs Voltas AC energy).
2. Material sustainability (recycled, organic, bamboo, wood vs virgin plastics, polyester, PVC).
3. Certifications (USDA Organic, GOTS, FSC, Energy Star, 5 Star rating).
4. Packaging & disposability (reusable, zero waste vs single-use plastic, disposable).

You MUST return your response ONLY as a valid JSON object matching the following structure (do not include markdown codeblocks or any additional text, only the raw JSON string):
{
  "score": <number from 0 to 100>,
  "tip": "<compelling 1-2 sentence tip/summary explaining the score>",
  "category": "<one of: Clothing & Textiles, Electronics, Household & Kitchen, Cosmetics & Personal Care, Food & Groceries, General Goods>",
  "breakdown": {
    "brandScore": <number from 0 to 100>,
    "materialsAdjustment": <number from -40 to 40>,
    "certificationsBonus": <number from 0 to 30>,
    "packagingAdjustment": <number from -20 to 20>
  },
  "detectedKeywords": {
    "ecoMaterials": ["list", "of", "keywords"],
    "badMaterials": ["list", "of", "keywords"],
    "certifications": ["list", "of", "keywords"],
    "ecoPackaging": ["list", "of", "keywords"],
    "badPackaging": ["list", "of", "keywords"]
  },
  "alternatives": [
    {
      "name": "<greener alternative name>",
      "reason": "<short reason why it is better>"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean JSON response (remove markdown codeblock backticks if present)
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error("Gemini AI scoring failed, falling back to heuristics:", error.message);
    return null;
  }
}

// API endpoint
app.post('/api/analyze', async (req, res) => {
  const { name, brand, description } = req.body;

  if (!name || !brand) {
    return res.status(400).json({ error: "Product name and brand required" });
  }

  // 1. Try Generative AI first if API Key is configured
  if (genAI) {
    const aiResult = await getEcoScoreAI(name, brand, description || "");
    if (aiResult) {
      return res.json(aiResult);
    }
  }

  // 2. Fallback to updated rule-based heuristics
  const result = getEcoScore(name, brand, description || "");
  res.json(result);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`EcoCart backend running on http://localhost:${port}`);
  });
}

module.exports = { app, getEcoScore };
