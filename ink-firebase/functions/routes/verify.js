const express = require('express');
const { db, FieldValue } = require('../config/database');
const { signData } = require('../utils/crypto');
const { sendWebhook } = require('../utils/webhook');
const { calculateDistance, getGpsVerdict } = require('../utils/gps');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      nfc_token,
      delivery_gps,
      device_info,
      phone_last4,
      delivery_type
    } = req.body;

    if (!nfc_token || !delivery_gps) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tokenQuery = await db.collection('proofs')
      .where('nfc_token', '==', nfc_token)
      .limit(1)
      .get();

    if (tokenQuery.empty) {
      return res.status(404).json({ error: 'Invalid token' });
    }

    const proofDoc = tokenQuery.docs[0];
    const proof = proofDoc.data();
    const proofId = proofDoc.id;

    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    if (proof.delivery_timestamp) {
      if (isDevelopment) {
        console.log('[VERIFY] Already verified, returning existing proof info');
        console.log('[VERIFY] Proof ID:', proofId);
      }
      return res.json({
        proof_id: proofId,
        verification_status: 'verified',
        signature: proof.signature || '',
        verify_url: `https://in.ink/verify/${proofId}`,
        already_verified: true,
        gps_verdict: proof.gps_verdict || 'pass',
        phone_verified: proof.phone_verified || false
      });
    }

    // 写入标签后 2 分钟内不允许 tap 交付，避免误触立即触发交付
    const enrollmentTime = proof.enrollment_timestamp?.toDate?.() || proof.created_at?.toDate?.();
    if (enrollmentTime) {
      const elapsedMs = Date.now() - enrollmentTime.getTime();
      const minWaitMs = 2 * 60 * 1000;
      if (elapsedMs < minWaitMs) {
        const waitSeconds = Math.ceil((minWaitMs - elapsedMs) / 1000);
        if (isDevelopment) {
          console.log('[VERIFY] Tap too soon after enroll, elapsed ms:', elapsedMs);
        }
        return res.status(400).json({
          error: 'Please wait at least 2 minutes after enrollment before confirming delivery',
          code: 'TOO_SOON_AFTER_ENROLL',
          wait_seconds: waitSeconds
        });
      }
    }

    if (isDevelopment) {
      console.log('[VERIFY] Found proof record');
      console.log('[VERIFY] Proof ID:', proofId);
      console.log('[VERIFY] Order ID:', proof.order_id);
    }

    // Calculate GPS distance if shipping address GPS is available
    let distance = 0;
    let gpsVerdict = 'pass';
    let phoneVerified = false;

    if (proof.shipping_address_gps && proof.shipping_address_gps.lat && proof.shipping_address_gps.lng) {
      distance = calculateDistance(
        delivery_gps.lat,
        delivery_gps.lng,
        proof.shipping_address_gps.lat,
        proof.shipping_address_gps.lng
      );
      gpsVerdict = getGpsVerdict(distance);

      if (isDevelopment) {
        console.log('[VERIFY] GPS distance calculated:', Math.round(distance), 'meters');
        console.log('[VERIFY] GPS verdict:', gpsVerdict);
      }

      // Phone verification disabled: NFC tap no longer requires phone last 4 digits
      // (Previously: required when distance > 100m and customer_phone_last4 was set)
      // if (distance > 100 && proof.customer_phone_last4) { ... }
    } else {
      if (isDevelopment) {
        console.log('[VERIFY] No shipping address GPS available, skipping distance check');
      }
    }

    const deliverySignatureData = {
      proof_id: proofId,
      order_id: proof.order_id,
      delivery_gps,
      timestamp: new Date().toISOString()
    };

    if (isDevelopment) {
      console.log('[VERIFY] Preparing delivery signature data');
      console.log('[VERIFY] Signature data:', JSON.stringify(deliverySignatureData, null, 2));
    }

    const newSignature = signData(deliverySignatureData);
    
    if (isDevelopment) {
      console.log('[VERIFY] Delivery signature generated');
    }

    if (isDevelopment) {
      console.log('[VERIFY] Updating Firestore document...');
    }
    
    await db.collection('proofs').doc(proofId).update({
      delivery_timestamp: FieldValue.serverTimestamp(),
      delivery_gps: delivery_gps,
      device_info: device_info || 'Unknown',
      gps_verdict: gpsVerdict,
      phone_verified: phoneVerified,
      signature: newSignature,
      updated_at: FieldValue.serverTimestamp()
    });
    
    if (isDevelopment) {
      console.log('[VERIFY] Firestore document updated successfully');
      console.log('[VERIFY] GPS verdict:', gpsVerdict);
      console.log('[VERIFY] Phone verified:', phoneVerified);
    }

    const webhookPayload = {
      order_id: proof.order_id,
      status: 'verified',
      delivery_gps,
      proof_ref: proofId,
      timestamp: new Date().toISOString(),
      verify_url: `https://in.ink/verify/${proofId}`
    };

    if (isDevelopment) {
      console.log('[VERIFY] Sending webhook to Shopify');
      console.log('[VERIFY] Webhook payload:', JSON.stringify(webhookPayload, null, 2));
    }

    sendWebhook(webhookPayload).then(result => {
      if (result.skipped) {
        if (isDevelopment) {
          console.log('[VERIFY] Webhook skipped (SHOPIFY_WEBHOOK_URL not configured)');
        }
      } else if (result.success) {
        console.log(`[VERIFY] Webhook sent successfully (attempt ${result.attempt}/${3})`);
      } else {
        console.error('[VERIFY] Webhook failed after all retries:', result.error);
      }
    }).catch(err => {
      console.error('[VERIFY ERROR] Unexpected webhook error:', err.message);
      if (isDevelopment) {
        console.error('[VERIFY ERROR] Webhook error stack:', err.stack);
      }
    });

    res.json({
      proof_id: proofId,
      verification_status: 'verified',
      signature: newSignature,
      verify_url: `https://in.ink/verify/${proofId}`,
      gps_verdict: gpsVerdict,
      phone_verified: phoneVerified,
      distance_meters: Math.round(distance)
    });

  } catch (error) {
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    console.error('[VERIFY ERROR]', new Date().toISOString());
    console.error('[VERIFY ERROR] Message:', error.message);
    if (isDevelopment) {
      console.error('[VERIFY ERROR] Stack:', error.stack);
      if (error.code) {
        console.error('[VERIFY ERROR] Error code:', error.code);
      }
      console.error('[VERIFY ERROR] Request body:', JSON.stringify(req.body, null, 2));
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
