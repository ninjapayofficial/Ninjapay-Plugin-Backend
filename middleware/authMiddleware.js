// middleware/authMiddleware.js

const admin = require("../firebase");
const db = admin.firestore();

const SESSION_COOKIE_NAME = "session";

async function authMiddleware(req, res, next) {
  let uid;
  let userData;

  // // If the request is for Next.js static files, skip auth
  // // If you mount your Next.js at /plugins/terminal-plugin, 
  // // the path might be /plugins/terminal-plugin/_next/static/... 
  // // or the originalUrl might contain that. 
  // // So skip if it matches:
  // if (req.originalUrl.startsWith('/plugins/terminal-plugin/_next/static')) {
  //   return next();  // let Next.js serve static assets freely
  // }

  try {
    const sessionCookie = req.cookies[SESSION_COOKIE_NAME] || "";
    // Check for provider keys in headers
    const providerInvoiceKey = req.headers["x-provider-invoice-key"];
    const providerAdminKey = req.headers["x-provider-admin-key"];

    console.log(
      "authMiddleware: Processing request",
      req.method,
      req.originalUrl,
    );

    if (sessionCookie) {
      console.log("authMiddleware: Authenticating with session cookie");
      // Authenticate using the session cookie
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);
      uid = decodedClaims.uid;

      // Fetch user data from Firestore
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(401).send("User data not found.");
      }

      userData = userDoc.data();

      // Attach user data to req.user
      req.user = {
        uid,
        walletId: userData.walletId, // Nullable
        isAdmin: userData.isAdmin || false, // Include isAdmin
        email: userData.email, // Include email
      };

      // Retrieve the default provider
      const fundingProviders = userData.fundingProviders || [];
      let provider;

      if (userData.defaultProvider) {
        // Find the default provider
        provider = fundingProviders.find(
          (fp) => fp.provider === userData.defaultProvider,
        );
      }

      if (!provider) {
        // Fall back to the first provider if default is not set or not found
        provider = fundingProviders[0];
      }

      if (provider) {
        req.provider = {
          ...provider,
          // Include any additional fields or transformations if needed
        };
      } else {
        req.provider = null; // No providers connected
      }

      next();
    } else if (providerInvoiceKey || providerAdminKey) {
      console.log("authMiddleware: Authenticating with provider keys");
      // Authenticate using provider keys

      let providerKey = providerInvoiceKey || providerAdminKey;

      // Query the providerKeys collection to find the user
      const providerKeysRef = db.collection("providerKeys");
      const providerKeyDoc = await providerKeysRef.doc(providerKey).get();

      if (!providerKeyDoc.exists) {
        return res.status(401).send("Invalid provider keys.");
      }

      const providerKeyData = providerKeyDoc.data();
      uid = providerKeyData.userId;
      const fundingProvider = providerKeyData.providerData; // Should include provider details

      // Fetch user data from Firestore
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(401).send("User data not found.");
      }

      userData = userDoc.data();

      // Attach user data to req.user
      req.user = {
        uid,
        walletId: userData.walletId, // Nullable
      };

      // Attach the provider to req.provider
      req.provider = fundingProvider; // Should include provider details

      next();
    } else {
      // No authentication provided
      console.log("authMiddleware: No authentication provided");
      return res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(401).send("Unauthorized");
  }
}

module.exports = authMiddleware;
