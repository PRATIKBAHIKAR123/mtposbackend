require('dotenv').config();
const { cert, initializeApp } = require('firebase-admin/app');

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // If dotenv already replaced \n, it will be real newlines
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  console.log('Project ID:', projectId);
  console.log('Client Email:', clientEmail);
  console.log('Key looks like:', privateKey.substring(0, 30));

  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    })
  });
  console.log('Successfully initialized!');
} catch (error) {
  console.error('Failed to initialize:', error.message);
  if (error.opensslErrorStack) {
    console.error('OpenSSL Stack:', error.opensslErrorStack);
  }
}
