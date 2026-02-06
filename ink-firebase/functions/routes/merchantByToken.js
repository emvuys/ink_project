const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

// GET /merchant-by-token?nfc_token=xxx - Get merchant name by NFC token (for loading animation)
router.get('/', async (req, res) => {
  try {
    const { nfc_token } = req.query;
    if (!nfc_token) {
      return res.status(400).json({ error: 'Missing nfc_token' });
    }

    const tokenQuery = await db.collection('proofs')
      .where('nfc_token', '==', nfc_token)
      .limit(1)
      .get();

    if (tokenQuery.empty) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const proof = tokenQuery.docs[0].data();
    const merchant = proof.merchant || '';

    res.json({ merchant });
  } catch (error) {
    console.error('[MERCHANT-BY-TOKEN ERROR]', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
