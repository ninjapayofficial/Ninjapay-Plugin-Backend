// middleware/authMiddleware.js
const admin = require('../firebase');
const db = admin.firestore();

const SESSION_COOKIE_NAME = 'session';

async function authMiddleware(req, res, next) {
  const sessionCookie = req.cookies[SESSION_COOKIE_NAME] || '';
  let uid;
  let userData;

  try {
    if (sessionCookie) {
      // Authenticate using the session cookie
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      uid = decodedClaims.uid;

      // Fetch user data from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(401).send('User data not found.');
      }

      userData = userDoc.data();
    } else if (req.headers['x-invoice-key']) {
      // Authenticate using the invoice key
      const invoiceKey = req.headers['x-invoice-key'];

      // Query Firestore for a user with the matching invoice key
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('invoiceKey', '==', invoiceKey).limit(1).get();

      if (snapshot.empty) {
        return res.status(401).send('Invalid invoice key.');
      }

      // Since we limited to 1 result, we can safely get the first document
      const userDoc = snapshot.docs[0];
      uid = userDoc.id;
      userData = userDoc.data();
    } else {
      // No authentication provided
      return res.status(401).send('Unauthorized');
    }

    // Attach user data to req.user
    req.user = {
      uid,
      walletId: userData.walletId,
      invoiceKey: userData.invoiceKey,
      adminKey: userData.adminKey,
    };

    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(401).send('Unauthorized');
  }
}

module.exports = authMiddleware;
