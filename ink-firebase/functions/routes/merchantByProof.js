const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

// GET /merchant-by-proof/:proofId - Get merchant name by proof ID (for loading animation on record pages)
router.get('/:proofId', async (req, res) => {
  try {
    const { proofId } = req.params;
    if (!proofId) {
      return res.status(400).json({ error: 'Missing proofId' });
    }

    const proofDoc = await db.collection('proofs').doc(proofId).get();
    if (!proofDoc.exists) {
      return res.status(404).json({ error: 'Proof not found' });
    }

    const proof = proofDoc.data();
    const merchant = proof.merchant || '';

    res.json({ merchant });
  } catch (error) {
    console.error('[MERCHANT-BY-PROOF ERROR]', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
