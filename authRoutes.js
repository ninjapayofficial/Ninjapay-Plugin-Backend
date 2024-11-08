// authRoutes.js
const express = require('express');
const router = express.Router();
const admin = require('./firebase'); // Import Firebase Admin
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());
app.use(express.json());

function generateWalletId() {
    return uuidv4(); // Generates a unique UUID
  }
  
  function generateInvoiceKey() {
    return 'ik_' + uuidv4(); // Prefix to distinguish keys
  }
  
  function generateAdminKey() {
    return 'ak_' + uuidv4();
  }
  

app.post('/sessionLogin', (req, res) => {
  const idToken = req.body.idToken;
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // Session expires in 5 days

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then((sessionCookie) => {
      // Set cookie with session cookie
      const options = { maxAge: expiresIn, httpOnly: true, secure: true };// Set secure: true in production with HTTPS
      res.cookie(SESSION_COOKIE_NAME, sessionCookie, options);
      res.status(200).send({ status: 'success' });
    })
    .catch((error) => {
      console.error('Error creating session cookie:', error);
      res.status(401).send('UNAUTHORIZED REQUEST!');
    });
});

app.post('/sessionLogout', (req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME);
    res.status(200).send({ status: 'success' });
  });
  

// Endpoint for user signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Generate walletId, invoiceKey, adminKey
    const walletId = generateWalletId();
    const invoiceKey = generateInvoiceKey();
    const adminKey = generateAdminKey();

    // Save additional user data to Firestore or your database
    // For this example, we'll use Firestore
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      walletId,
      invoiceKey,
      adminKey,
    });

    res.status(201).json({ uid: userRecord.uid });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user.');
  }
});

// Endpoint for user login
router.post('/login', async (req, res) => {
  // Firebase Auth is typically handled on the client side
  // For server-side verification, you can accept ID tokens
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    res.json({ uid });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).send('Invalid token.');
  }
});

module.exports = router;




