const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
// In emulator, use default credentials
// In production, Firebase automatically uses service account
if (!admin.apps.length) {
  // For emulator, we can use default initialization
  // For production, Firebase Functions automatically initializes with service account
  try {
    admin.initializeApp();
  } catch (error) {
    // Already initialized, ignore
    console.log('Firebase Admin already initialized');
  }
}

// Import Express app
const app = require('./app');

// Export Express app as Firebase Function
// Use us-central1 region (default)
exports.api = functions.region('us-central1').https.onRequest(app);

