// // /* eslint-disable no-undef */
// // routes/authRoutes.js

// const express = require("express");
// const router = express.Router();
// const admin = require("../firebase"); // Import Firebase Admin
// const authMiddleware = require("../middleware/authMiddleware");
// const crypto = require("crypto"); // For generating random keys
// // const { models } = require("../models"); // Import models
// // // const UserLogin = require("../models/UserLogin");
// // // const User = require("../models/User");

// const SESSION_COOKIE_NAME = "session";

// // Function to generate provider-specific keys
// function generateProviderInvoiceKey() {
//   return "p_ik_" + Math.random().toString(36).substr(2, 9);
// }

// function generateProviderAdminKey() {
//   return "p_ak_" + Math.random().toString(36).substr(2, 9);
// }

// // Function to generate a unique webhook secret
// function generateWebhookSecret() {
//   return "wh_sec_" + crypto.randomBytes(16).toString("hex");
// }

// // Endpoint to create session login
// router.post("/sessionLogin", async (req, res ) => {
//   const idToken = req.body.idToken;
//   const expiresIn = 60 * 60 * 24 * 5 * 1000; // Session expires in 5 days

//   try {

//     // Verify the ID token
//     const decodedIdToken = await admin.auth().verifyIdToken(idToken);
//     console.log(decodedIdToken);

//     const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

//     // Set cookie with session cookie
//     const options = { maxAge: expiresIn, httpOnly: true, secure: false }; // Set secure: true in production with HTTPS
//     res.cookie(SESSION_COOKIE_NAME, sessionCookie, options);

//     // Record the login event
//     // const userId = decodedIdToken.uid;
//     // console.log(userId);
//     // const userAgent = req.headers['user-agent'];
//     // const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     // await UserLogin.create({
//     //   userId,
//     //   userAgent,
//     //   ipAddress,
//     //   loginTime: new Date(),
//     // });
//     // const _userLoginData = {
//     //   userId,
//     //   userAgent: "web",
//     //   ipAddress: "https://localhose:3000",
//     //   loginTime: new Date(),
//     // }
//     // await UserLogin.create(_userLoginData);

//     res.status(200).send({ status: 'success' });
//     console.log(decodedIdToken);
//   } catch (error) {
//     console.error('Error during session login:', error);
//     res.status(401).send('UNAUTHORIZED REQUEST!');
//   }
// });

// // Endpoint to logout
// router.post("/sessionLogout", (req, res) => {
//   res.clearCookie(SESSION_COOKIE_NAME);
//   res.status(200).send({ status: "success" });
// });

// // Endpoint for user signup
// router.post("/signup", async (req, res ) => {
//   const { email, password } = req.body;
//   try {
//     const userRecord = await admin.auth().createUser({
//       email,
//       password,
//     });

//     // const uid = userRecord.uid;

//     // Save user data to Firestore
//     const db = admin.firestore();
//     await db.collection("users").doc(userRecord.uid).set({
//       // Initialize fields if necessary
//       walletId: "", // Initialize with empty or generate as needed
//       invoiceKey: "", // Initialize empty; can be set when adding a provider
//       adminKey: "", // Initialize empty; can be set when adding a provider
//       fundingProviders: [], // Initialize as empty array
//     });

//     // // Save user data to the database
//     // await User.create({
//     //   id: uid,
//     //   email: email,
//     //   isAdmin: true, // Set to true if this user should be an admin or false
//     // });

//     res.status(201).json({ uid: userRecord.uid });
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).send("Error creating user.");
//   }
// });

// // Endpoint for user login (Not typically needed on the server)
// router.post("/login", async (req, res) => {
//   // Firebase Auth is typically handled on the client side
//   // For server-side verification, you can accept ID tokens
//   const { idToken } = req.body;
//   try {
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     const uid = decodedToken.uid;

//     res.json({ uid });
//   } catch (error) {
//     console.error("Error verifying ID token:", error);
//     res.status(401).send("Invalid token.");
//   }
//   // Since login is handled on the client, this can be left empty or removed
// });

// // Logout and redirect to login
// router.post("/logout", (req, res) => {
//   res.clearCookie("session");
//   res.redirect("/login");
// });

// // Route to handle adding funding provider
// router.post("/addFundingProvider", authMiddleware, async (req, res) => {
//   const uid = req.user.uid;
//   const { provider } = req.body;

//   // console.log('Received provider:', provider);
//   // console.log('Request body:', req.body);

//   try {
//     const db = admin.firestore();
//     const userRef = db.collection("users").doc(uid);

//     // Prepare funding provider data
//     let fundingProviderData = { provider };

//     if (provider === "lnbits") {
//       const { instanceUrl, invoiceKey, adminKey } = req.body;
//       fundingProviderData.instanceUrl = instanceUrl;
//       fundingProviderData.invoiceKey = invoiceKey; // Store in plaintext but consider encrypting
//       fundingProviderData.adminKey = adminKey; // Store in plaintext but consider encrypting

//       // Generate provider-specific keys for our system
//       fundingProviderData.providerInvoiceKey = generateProviderInvoiceKey();
//       fundingProviderData.providerAdminKey = generateProviderAdminKey();
//       // Generate a unique webhook secret and URL
//       const webhookSecret = generateWebhookSecret();
//       // eslint-disable-next-line no-undef
//       const webhookUrl =
//         // eslint-disable-next-line no-undef
//         `${process.env.BASE_URL}/webhook/${provider}/${webhookSecret}`;
//       fundingProviderData.webhookSecret = webhookSecret;
//       fundingProviderData.webhookUrl = webhookUrl;
//     } else if (provider === "opennode") {
//       const { apiKey, readApiKey } = req.body;

//       console.log("Received apiKey:", apiKey);

//       if (!apiKey) {
//         return res.status(400).send("API Key is required for OpenNode.");
//       }
//       fundingProviderData.apiKey = apiKey; // Store in plaintext but consider encrypting
//       fundingProviderData.readApiKey = readApiKey;

//       // Generate provider-specific keys for our system
//       fundingProviderData.providerInvoiceKey = generateProviderInvoiceKey();
//       fundingProviderData.providerAdminKey = generateProviderAdminKey();
//       // Generate a unique webhook secret and URL
//       const webhookSecret = generateWebhookSecret();
//       // eslint-disable-next-line no-undef
//       const webhookUrl =
//         // eslint-disable-next-line no-undef
//         `${process.env.BASE_URL}/webhook/${provider}/${webhookSecret}`;
//       fundingProviderData.webhookSecret = webhookSecret;
//       fundingProviderData.webhookUrl = webhookUrl;
//     } else {
//       return res.status(400).send("Unsupported provider.");
//     }

//     // Save funding provider data under user document
//     await userRef.update({
//       fundingProviders: admin.firestore.FieldValue.arrayUnion(
//         fundingProviderData,
//       ),
//     });

//     // Save providerInvoiceKey and providerAdminKey in 'providerKeys' collection
//     const providerKeysRef = db.collection("providerKeys");

//     await providerKeysRef.doc(fundingProviderData.providerInvoiceKey).set({
//       userId: uid,
//       providerData: fundingProviderData,
//     });

//     await providerKeysRef.doc(fundingProviderData.providerAdminKey).set({
//       userId: uid,
//       providerData: fundingProviderData,
//     });

//     res.status(200).send("Funding provider connected successfully.");
//   } catch (error) {
//     console.error("Error adding funding provider:", error);
//     res.status(500).send("Error adding funding provider.");
//   }
// });

// // Route to get connected funding providers
// router.get("/getFundingProviders", authMiddleware, async (req, res) => {
//   const uid = req.user.uid;
//   try {
//     const db = admin.firestore();
//     const userDoc = await db.collection("users").doc(uid).get();

//     if (!userDoc.exists) {
//       return res.status(404).send("User not found.");
//     }

//     const userData = userDoc.data();
//     const fundingProviders = userData.fundingProviders || [];

//     // Prepare data to send to frontend
//     const providersData = fundingProviders.map((fp) => {
//       return {
//         provider: fp.provider,
//         instanceUrl: fp.instanceUrl || "",
//         providerInvoiceKey: fp.providerInvoiceKey,
//         providerAdminKey: fp.providerAdminKey,
//         // Do not include invoiceKey and adminKey to prevent exposing sensitive information
//       };
//     });

//     res.status(200).json(providersData);
//   } catch (error) {
//     console.error("Error fetching funding providers:", error);
//     res.status(500).send("Error fetching funding providers.");
//   }
// });

// // Route to remove a funding provider
// router.post("/removeFundingProvider", authMiddleware, async (req, res) => {
//   const uid = req.user.uid;
//   const { providerInvoiceKey } = req.body;

//   try {
//     const db = admin.firestore();
//     const userRef = db.collection("users").doc(uid);

//     // Get the user's current funding providers
//     const userDoc = await userRef.get();
//     if (!userDoc.exists) {
//       return res.status(404).send("User not found.");
//     }
//     const userData = userDoc.data();
//     const fundingProviders = userData.fundingProviders || [];

//     // Find the provider to remove
//     const providerToRemove = fundingProviders.find(
//       (fp) => fp.providerInvoiceKey === providerInvoiceKey,
//     );

//     if (!providerToRemove) {
//       return res.status(400).send("Funding provider not found.");
//     }

//     // Remove the provider from the user's fundingProviders array
//     const updatedProviders = fundingProviders.filter(
//       (fp) => fp.providerInvoiceKey !== providerInvoiceKey,
//     );

//     // Update the user's funding providers
//     await userRef.update({
//       fundingProviders: updatedProviders,
//     });

//     // Remove entries from providerKeys collection
//     const providerKeysRef = db.collection("providerKeys");
//     await providerKeysRef.doc(providerToRemove.providerInvoiceKey).delete();
//     await providerKeysRef.doc(providerToRemove.providerAdminKey).delete();

//     res.status(200).send("Funding provider removed successfully.");
//   } catch (error) {
//     console.error("Error removing funding provider:", error);
//     res.status(500).send("Error removing funding provider.");
//   }
// });

// // Route to set the default provider
// router.post("/setDefaultProvider", authMiddleware, async (req, res) => {
//   const uid = req.user.uid;
//   const { provider } = req.body;

//   if (!provider) {
//     return res.status(400).send("Provider is required.");
//   }

//   try {
//     const db = admin.firestore();
//     const userRef = db.collection("users").doc(uid);

//     // Check if the provider exists in the user's fundingProviders
//     const userDoc = await userRef.get();
//     if (!userDoc.exists) {
//       return res.status(404).send("User not found.");
//     }
//     const userData = userDoc.data();
//     const fundingProviders = userData.fundingProviders || [];
//     const providerExists = fundingProviders.some(
//       (fp) => fp.provider === provider,
//     );

//     if (!providerExists) {
//       return res.status(400).send("Provider not connected.");
//     }

//     // Update the default provider
//     await userRef.update({
//       defaultProvider: provider,
//     });

//     res.status(200).send("Default provider set successfully.");
//   } catch (error) {
//     console.error("Error setting default provider:", error);
//     res.status(500).send("Error setting default provider.");
//   }
// });

// // Route to get the default provider
// router.get("/getDefaultProvider", authMiddleware, async (req, res) => {
//   const uid = req.user.uid;
//   try {
//     const db = admin.firestore();
//     const userDoc = await db.collection("users").doc(uid).get();

//     if (!userDoc.exists) {
//       return res.status(404).send("User not found.");
//     }

//     const userData = userDoc.data();
//     const defaultProvider = userData.defaultProvider || null;

//     res.status(200).json({ defaultProvider });
//   } catch (error) {
//     console.error("Error fetching default provider:", error);
//     res.status(500).send("Error fetching default provider.");
//   }
// });

// module.exports = router;
