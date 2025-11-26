const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

// Firebase Admin is already initialized in index.js
// Just export the Firestore instance
const db = admin.firestore();

// Test Firestore connection
async function testConnection() {
  try {
    // Try to write a test document to verify Firestore is accessible
    const testRef = db.collection('_health').doc('test');
    await testRef.set({
      timestamp: new Date().toISOString(),
      message: 'Connection test'
    });
    console.log('✓ Firestore connected and writable');
    
    // Clean up test document
    await testRef.delete();
    return true;
  } catch (error) {
    // Check error code
    if (error.code === 5) {
      // NOT_FOUND - Firestore might not be enabled or project doesn't exist
      console.error('✗ Firestore database not found');
      console.error('Please ensure:');
      console.error('1. Firestore Database is enabled in Firebase Console');
      console.error('2. You are using the correct Firebase project');
      console.error('3. Service account has Firestore permissions');
      throw error;
    } else if (error.code === 7) {
      // PERMISSION_DENIED - Security rules or permissions issue
      console.error('✗ Firestore permission denied');
      console.error('Please check Firestore security rules and service account permissions');
      throw error;
    } else {
      console.error('✗ Firestore connection failed:', error.message);
      console.error('Error code:', error.code);
      throw error;
    }
  }
}

module.exports = { db, testConnection, FieldValue };

