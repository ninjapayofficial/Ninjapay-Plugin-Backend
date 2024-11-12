// middleware/authMiddleware.js

const admin = require('../firebase');
const db = admin.firestore();

const SESSION_COOKIE_NAME = 'session';

async function authMiddleware(req, res, next) {
  let uid;
  let userData;

  try {
    const sessionCookie = req.cookies[SESSION_COOKIE_NAME] || '';

    // Check for provider keys in headers
    const providerInvoiceKey = req.headers['x-provider-invoice-key'];
    const providerAdminKey = req.headers['x-provider-admin-key'];

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

      // Attach user data to req.user
      req.user = {
        uid,
        walletId: userData.walletId,
        invoiceKey: userData.invoiceKey,
        adminKey: userData.adminKey,
      };

      next();
    } else if (providerInvoiceKey || providerAdminKey) {
      // Authenticate using provider keys

      let providerKey = providerInvoiceKey || providerAdminKey;

      // Query the providerKeys collection to find the user
      const providerKeysRef = db.collection('providerKeys');
      const providerKeyDoc = await providerKeysRef.doc(providerKey).get();

      if (!providerKeyDoc.exists) {
        return res.status(401).send('Invalid provider keys.');
      }

      const providerKeyData = providerKeyDoc.data();
      uid = providerKeyData.userId;
      const fundingProvider = providerKeyData.providerData;

      // Fetch user data from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(401).send('User data not found.');
      }

      userData = userDoc.data();

      // Attach user data to req.user
      req.user = {
        uid,
        walletId: userData.walletId,
        invoiceKey: userData.invoiceKey,
        adminKey: userData.adminKey,
      };

      // Attach the provider to req.provider
      req.provider = fundingProvider;

      next();
    } else {
      // No authentication provided
      return res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(401).send('Unauthorized');
  }
}

module.exports = authMiddleware;
