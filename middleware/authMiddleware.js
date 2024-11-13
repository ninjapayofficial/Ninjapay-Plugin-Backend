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

    console.log('authMiddleware: Processing request', req.method, req.originalUrl);

    if (sessionCookie) {
      console.log('authMiddleware: Authenticating with session cookie');
      // Authenticate using the session cookie
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      uid = decodedClaims.uid;

      // Fetch user data from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(401).send('User data not found.');
      }

      userData = userDoc.data();

      // Attach user data to req.user (excluding invoiceKey and adminKey)
      req.user = {
        uid,
        walletId: userData.walletId, // Nullable
        // Removed invoiceKey and adminKey
      };

      // Retrieve provider data for 'lnbits'
      // Assuming 'fundingProviders' is an array in userData
      const fundingProviders = userData.fundingProviders || [];
      const lnbitsProvider = fundingProviders.find(provider => provider.provider === 'lnbits');

      if (!lnbitsProvider) {
        console.log('authMiddleware: No lnbits provider found for user');
        return res.status(401).send('LNbits provider not connected.');
      }

      req.provider = {
        provider: 'lnbits',
        instanceUrl: lnbitsProvider.instanceUrl || process.env.LNBITS_INSTANCE_URL || 'https://demo.lnbits.com',
        invoiceKey: lnbitsProvider.invoiceKey, // Use provider-specific keys
        adminKey: lnbitsProvider.adminKey,
      };

      next();
    } else if (providerInvoiceKey || providerAdminKey) {
      console.log('authMiddleware: Authenticating with provider keys');
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
      const fundingProvider = providerKeyData.providerData; // Should include provider details

      // Fetch user data from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(401).send('User data not found.');
      }

      userData = userDoc.data();

      // Attach user data to req.user (excluding invoiceKey and adminKey)
      req.user = {
        uid,
        walletId: userData.walletId, // Nullable
        // Removed invoiceKey and adminKey
      };

      // Attach the provider to req.provider
      req.provider = fundingProvider; // Should include provider: 'lnbits', instanceUrl, providerInvoiceKey, providerAdminKey

      next();
    } else {
      // No authentication provided
      console.log('authMiddleware: No authentication provided');
      return res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(401).send('Unauthorized');
  }
}

module.exports = authMiddleware;
