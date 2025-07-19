const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Fake scoring logic based on product name & brand
function getEcoScore(name, brand) {
  name = name.toLowerCase();
  brand = brand.toLowerCase();

  let score = 50; // base score

  const ecoKeywords = ["organic", "bamboo", "eco", "biodegradable", "recycled"];
  const badKeywords = ["plastic", "synthetic", "chemical", "disposable"];

  ecoKeywords.forEach(keyword => {
    if (name.includes(keyword) || brand.includes(keyword)) score += 10;
  });

  badKeywords.forEach(keyword => {
    if (name.includes(keyword) || brand.includes(keyword)) score -= 10;
  });

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  let tip = score > 75
    ? "Great choice! 🌿"
    : score > 50
    ? "Consider greener options."
    : "Not eco-friendly. Try alternatives!";

  return { score, tip };
}

// API endpoint
app.post('/api/analyze', (req, res) => {
  const { name, brand } = req.body;

  if (!name || !brand) {
    return res.status(400).json({ error: "Product name and brand required" });
  }

  const result = getEcoScore(name, brand);
  res.json(result);
});

app.listen(port, () => {
  console.log(`EcoCart backend running on http://localhost:${port}`);
});
