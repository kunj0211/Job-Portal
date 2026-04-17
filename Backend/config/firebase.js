const admin = require('firebase-admin');

// Using environment variables for better security
try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') // Handle newline escaping in env strings
    : undefined;

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
     throw new Error("Missing Firebase admin credentials in environment variables.");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    })
  });
  
  console.log('Firebase Admin SDK initialized successfully from environment variables.');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  console.log('Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in .env');
}

module.exports = admin;
