const express = require('express');
const { db, FieldValue } = require('../config/database');
const admin = require('firebase-admin');
const { requireAdmin, signAdminToken } = require('../utils/adminAuth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
if (!ADMIN_PASSWORD && process.env.NODE_ENV !== 'development') {
  console.warn('[ADMIN] ADMIN_PASSWORD not set - admin login will fail');
}

function slugify(name) {
  return (name || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'default';
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const allowed = ['.mp4', '.webm', '.gif', '.mov'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only video/gif allowed: .mp4, .webm, .gif, .mov'));
    }
  }
});

// POST /admin/login - Admin login (password), returns JWT
router.post('/login', (req, res) => {
  try {
    const { password } = req.body || {};
    if (!ADMIN_PASSWORD) {
      return res.status(503).json({ error: 'Admin not configured' });
    }
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = signAdminToken();
    res.json({ token });
  } catch (error) {
    console.error('[ADMIN LOGIN ERROR]', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/merchant-animations - List all merchant animations (requires admin)
router.get('/merchant-animations', requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection('merchant_animations').get();
    const list = snap.docs.map(doc => {
      const d = doc.data();
      return { id: doc.id, merchant_name: d.merchant_name, animation_url: d.animation_url, updated_at: d.updated_at };
    });
    res.json({ merchant_animations: list });
  } catch (error) {
    console.error('[ADMIN LIST ERROR]', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /admin/merchant-animation/:id - Delete one merchant animation by doc id (slug)
router.delete('/merchant-animation/:id', requireAdmin, async (req, res) => {
  try {
    const slug = (req.params.id || '').trim();
    if (!slug) {
      return res.status(400).json({ error: 'Missing merchant id (slug)' });
    }
    const ref = db.collection('merchant_animations').doc(slug);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Animation not found' });
    }
    await ref.delete();
    res.json({ deleted: slug });
  } catch (error) {
    console.error('[ADMIN DELETE ERROR]', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function saveAnimationToStorage(merchantName, buffer, ext, mimeType) {
  const slug = slugify(merchantName);
  const fileName = `merchant_animations/${slug}/animation${ext}`;
  const bucketName = process.env.STORAGE_BUCKET || 'inink-c76d3.firebasestorage.app';
  const bucket = admin.storage().bucket(bucketName);
  const fileRef = bucket.file(fileName);

  await fileRef.save(buffer, {
    metadata: { contentType: mimeType || 'video/mp4' }
  });

  let animationUrl;
  try {
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
    });
    animationUrl = signedUrl;
  } catch (signErr) {
    console.warn('[ADMIN UPLOAD] getSignedUrl failed:', signErr.message);
    try {
      await fileRef.makePublic();
      animationUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    } catch (makePublicErr) {
      console.warn('[ADMIN UPLOAD] makePublic failed:', makePublicErr.message);
      animationUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }
  }

  await db.collection('merchant_animations').doc(slug).set({
    merchant_name: merchantName,
    animation_url: animationUrl,
    updated_at: FieldValue.serverTimestamp()
  }, { merge: true });

  return { merchant_name: merchantName, slug, animation_url: animationUrl };
}

// POST /admin/merchant-animation - multipart (can fail in Cloud Functions with "Unexpected end of form")
router.post('/merchant-animation', requireAdmin, upload.single('animation'), async (req, res) => {
  try {
    const merchantName = (req.body && req.body.merchant) ? String(req.body.merchant).trim() : '';
    if (!merchantName) {
      return res.status(400).json({ error: 'Missing merchant name' });
    }
    const slug = slugify(merchantName);
    const existing = await db.collection('merchant_animations').doc(slug).get();
    if (existing.exists) {
      return res.status(409).json({
        error: 'Merchant name already exists. Use a different name or delete the existing animation first.',
        code: 'MERCHANT_NAME_EXISTS'
      });
    }
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'Missing animation file' });
    }
    const ext = path.extname(file.originalname) || '.mp4';
    const result = await saveAnimationToStorage(merchantName, file.buffer, ext, file.mimetype);
    res.json(result);
  } catch (error) {
    console.error('[ADMIN UPLOAD ERROR]', error.message);
    console.error('[ADMIN UPLOAD ERROR] stack:', error.stack);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /admin/merchant-animation-base64 - JSON body, avoids multipart issues in Cloud Functions
router.post('/merchant-animation-base64', requireAdmin, async (req, res) => {
  try {
    const { merchant: merchantName, animation_base64: base64, filename } = req.body || {};
    if (!merchantName || !base64) {
      return res.status(400).json({ error: 'Missing merchant name or animation_base64' });
    }
    const name = String(merchantName).trim();
    const slug = slugify(name);
    const existing = await db.collection('merchant_animations').doc(slug).get();
    if (existing.exists) {
      return res.status(409).json({
        error: 'Merchant name already exists. Use a different name or delete the existing animation first.',
        code: 'MERCHANT_NAME_EXISTS'
      });
    }
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Invalid animation_base64' });
    }
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }
    const ext = path.extname(filename || '') || '.mp4';
    const allowed = ['.mp4', '.webm', '.gif', '.mov'];
    const safeExt = allowed.includes(ext.toLowerCase()) ? ext : '.mp4';
    const mimeType = ext === '.gif' ? 'image/gif' : (ext === '.webm' ? 'video/webm' : 'video/mp4');
    const result = await saveAnimationToStorage(name, buffer, safeExt, mimeType);
    res.json(result);
  } catch (error) {
    console.error('[ADMIN UPLOAD BASE64 ERROR]', error.message);
    console.error('[ADMIN UPLOAD BASE64 ERROR] stack:', error.stack);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;
