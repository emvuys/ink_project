const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

function slugify(name) {
  return (name || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'default';
}

// GET /merchant-animation/:merchantName - Get animation URL for merchant (public)
router.get('/:merchantName', async (req, res) => {
  try {
    const { merchantName } = req.params;
    const slug = slugify(decodeURIComponent(merchantName));

    const doc = await db.collection('merchant_animations').doc(slug).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Animation not found', animation_url: null });
    }

    const data = doc.data();
    res.json({ animation_url: data.animation_url || null, merchant_name: data.merchant_name });
  } catch (error) {
    console.error('[MERCHANT-ANIMATION GET ERROR]', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
