// middleware/authMiddleware.js
const admin = require('../firebase');
const db = admin.firestore(); // If using Firestore

const SESSION_COOKIE_NAME = 'session';

async function authMiddleware(req, res, next) {
  const sessionCookie = req.cookies[SESSION_COOKIE_NAME] || '';
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    // Fetch additional user data
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(401).send('User data not found.');
    }

    const userData = userDoc.data();

    // Attach user data to req.user
    req.user = {
      uid,
      walletId: userData.walletId,
      invoiceKey: userData.invoiceKey,
      adminKey: userData.adminKey,
    };

    next();
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    res.redirect('/login');
  }
}

module.exports = authMiddleware;
