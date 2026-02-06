const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
// In emulator, use default credentials
// In production, Firebase automatically uses service account
if (!admin.apps.length) {
  // For emulator, we can use default initialization
  // For production, Firebase Functions automatically initializes with service account
  try {
    admin.initializeApp({
      storageBucket: process.env.STORAGE_BUCKET || 'inink-c76d3.firebasestorage.app'
    });
  } catch (error) {
    if (error.code !== 'app/duplicate-app') {
      console.log('Firebase Admin init:', error.message);
    }
  }
}

// Import Express app
const app = require('./app');

// Export Express app as Firebase Function
// Use us-central1 region (default)
exports.api = functions.region('us-central1').https.onRequest(app);

