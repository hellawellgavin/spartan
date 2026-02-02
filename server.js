/**
 * Souvenir Spartan – API and static site server.
 * - Serves static files (HTML, CSS, JS, assets, data/) from project root.
 * - GET /api/products/:category → products for that category (mock or live Amazon).
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const { getProductsByCategory } = require('./api/productSource');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname);

// CORS so frontend can call API from same origin or different port
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Static site + data (so /data/products/shoes.json works for static fallback)
app.use(express.static(ROOT));

// Product API – single entry point; mock or live based on env
app.get('/api/products/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const payload = await getProductsByCategory(category);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ category: req.params.category, products: [], error: 'Failed to load products' });
  }
});

app.listen(PORT, () => {
  console.log(`Souvenir Spartan: http://localhost:${PORT}`);
  console.log(`  API: GET /api/products/:category (source: ${process.env.PRODUCT_SOURCE || 'mock'})`);
});
