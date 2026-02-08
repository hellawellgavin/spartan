/**
 * Souvenir Spartan – API and static site server.
 * Serves static files (HTML, CSS, JS, assets, data/) from project root.
 * GET /api/products/:category → products (Walmart RapidAPI or mock per .env).
 */

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const express = require('express');
const path = require('path');
const { getProductsByCategory, getProductByCategoryAndId, getSourceDescription } = require('./api/productSource');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '../public');

// CORS so frontend can call API from same origin or different port
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Static site + data (so /data/products/shoes.json works for static fallback)
app.use(express.static(PUBLIC_DIR));

// Product API – single entry point; mock or live based on env
app.get('/api/products/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const payload = await getProductsByCategory(category, page);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ category: req.params.category, products: [], error: 'Failed to load products' });
  }
});

// Single product – same shape for mock or live (Walmart/Amazon)
app.get('/api/product/:category/:id', async (req, res) => {
  try {
    const { category, id } = req.params;
    const product = await getProductByCategoryAndId(category, id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

app.listen(PORT, () => {
  console.log(`Souvenir Spartan: http://localhost:${PORT}`);
  console.log(`  API: GET /api/products/:category (${getSourceDescription()})`);
});
