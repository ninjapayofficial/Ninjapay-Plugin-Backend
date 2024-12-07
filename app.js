/* eslint-disable no-undef */
// app.js
const express = require("express");
const { Sequelize } = require("sequelize");
const app = express();
const pluginManager = require("./pluginManager");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const validator = require("validator");
const swaggerSpecs = require("./swaggerConfig");
const swaggerUi = require("swagger-ui-express");
const pluginRoutes = require("./routes/pluginRoutes");
const { runCoreMigrations } = require("./migrationManager");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const authMiddleware = require("./middleware/authMiddleware");
const admin = require("./firebase");
const paymentRoutes = require("./routes/paymentRoutes");

// Database Connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres",
    port: process.env.DB_PORT || 5432,
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  },
);

// Route to serve Firebase config as a JavaScript file
app.get('/firebase-config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');

  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };

  res.send(`
    // firebase-config.js
    const firebaseConfig = ${JSON.stringify(firebaseConfig)};
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
  `);
});

// // Alternatively, you can use the connection URI provided:
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   dialectOptions: {
//     ssl: process.env.DB_SSL === 'true' ? {
//       require: true,
//       rejectUnauthorized: false,
//     } : false,
//   },
// });

// Initialize models
const models = require("./models")(sequelize); // Initialize models
const LbtcTransaction = models.LbtcTransaction;

const authRoutes = require("./routes/authRoutes")(sequelize, models);

// Allow all origins (or specify allowed origins)
app.use(cors());

// Middleware to parse JSON requests and cookies
app.use(express.json());
app.use(cookieParser());

const port = parseInt(process.env.PORT) || process.argv[3] || 3000;

// Serve static files from the main 'views' directory
app.use(express.static(path.join(__dirname, "views")));

// Serve login.html and signup.html routes
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/login.html"));
});

// Route to serve 'signup.html'
app.get("/signup", (req, res) => {
  //   console.log('GET /signup called');
  res.sendFile(path.join(__dirname, "./views/signup.html"));
});

// to serve routes from appRoutes.js
app.use("/auth", authRoutes);

// to serve routes from pluginRoutes.js
app.use("/api", pluginRoutes);

// Set up Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Serve funding.html (ensure the user is authenticated)
app.get("/funding", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "./views/funding.html"));
});

// Serve home.html (ensure the user is authenticated)
app.get("/home", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "./views/home.html"));
});

// to serve routes from paymentRoutes.js
// app.use('/payments', paymentRoutes);
// Mount payment routes, passing the models
const initializedPaymentRoutes = paymentRoutes(models);
app.use("/payments", initializedPaymentRoutes);

// Middleware to serve static files from plugins' 'views' directories
app.use((req, res, next) => {
  const pluginsDir = path.join(__dirname, "plugins");
  const pluginName = req.path.split("/")[1]; // Get the first segment after '/'
  const pluginPath = path.join(pluginsDir, pluginName);

  if (fs.existsSync(pluginPath)) {
    // Check if the plugin has a 'views' directory
    const pluginViewsPath = path.join(pluginPath, "views");
    if (fs.existsSync(pluginViewsPath)) {
      express.static(pluginViewsPath)(req, res, next);
    } else {
      next();
    }
  } else {
    next();
  }
});

// Load the Invoice Key from the .env file
// const invoiceKey = process.env.INVOICE_KEY;

// Wrap the initialization code in an async function
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL");

    // Run core migrations
    await runCoreMigrations(sequelize);

    // Load existing plugins after DB connection
    await pluginManager.loadPlugins(app, sequelize);

    // Start the server
    app.listen(port, () => {
      console.log(`Main Application is running on port '${port}'.`);
    });
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
})();

// Endpoint to install plugins
// app.post('/install-plugin', async (req, res) => {
//   const { repoUrl } = req.body;
//   try {
//     await pluginManager.installPlugin(repoUrl, app, sequelize, invoiceKey);
//     res.send('Plugin installed and loaded successfully!');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Failed to install plugin.');
//   }
// });

app.post("/install-plugin", async (req, res) => {
  let { repoUrl } = req.body;
  if (
    !validator.isURL(repoUrl, {
      protocols: ["http", "https"],
      require_tld: true,
    })
  ) {
    return res.status(400).send("Invalid repository URL.");
  }
  try {
    await pluginManager.installPlugin(repoUrl, app, sequelize);
    res.send("Plugin installed and loaded successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to install plugin.");
  }
});

// Endpoint to list installed plugins
app.get("/plugins", (req, res) => {
  const pluginsDir = path.join(__dirname, "plugins");
  fs.readdir(pluginsDir, (err, files) => {
    if (err) {
      console.error("Error reading plugins directory:", err);
      res.status(500).send("Error reading plugins directory.");
    } else {
      res.json(files);
    }
  });
});

// Endpoint to remove a plugin
app.post("/remove-plugin", async (req, res) => {
  const { pluginName } = req.body;
  if (!pluginName) {
    return res.status(400).send("Plugin name is required.");
  }
  try {
    // Await the asynchronous uninstallPlugin function
    await pluginManager.uninstallPlugin(pluginName, sequelize);
    res.send(`Plugin '${pluginName}' uninstalled successfully.`);
  } catch (error) {
    console.error(`Error uninstalling plugin '${pluginName}':`, error);
    res.status(500).send(`Failed to uninstall plugin '${pluginName}'.`);
  }
});

// // Webhook endpoint to receive payment status updates
// app.post('/webhook/:provider/:userId', async (req, res) => {
//   const { provider, userId } = req.params;

//   // Get user data from Firestore
//   const db = admin.firestore();
//   const userDoc = await db.collection('users').doc(userId).get();

//   if (!userDoc.exists) {
//     return res.status(404).send('User not found');
//   }

//   // eslint-disable-next-line no-unused-vars
//   const userData = userDoc.data();

//   // Process the webhook data according to the provider
//   if (provider === 'lnbits') {
//     // Handle LNbits webhook
//     console.log('Received LNbits webhook:', req.body);
//     // TODO: Process the webhook data as needed
//   }
//   // Handle other providers

//   res.status(200).send('Webhook received');
// });

// Webhook endpoint to receive payment status updates
app.post("/webhook/:provider/:webhookSecret", async (req, res) => {
  const { provider, webhookSecret } = req.params;

  try {
    // Find the provider data using the webhookSecret
    const db = admin.firestore();
    const providerKeysRef = db.collection("providerKeys");
    const providerKeySnapshot = await providerKeysRef
      .where("providerData.webhookSecret", "==", webhookSecret)
      .get();

    if (providerKeySnapshot.empty) {
      console.error("Invalid webhook secret.");
      return res.status(401).send("Unauthorized");
    }

    // Assuming webhookSecret is unique, we can get the user data
    const providerKeyDoc = providerKeySnapshot.docs[0];
    // eslint-disable-next-line no-unused-vars
    const providerData = providerKeyDoc.data().providerData;
    const userId = providerKeyDoc.data().userId;

    // Process the webhook data according to the provider
    if (provider === "lnbits") {
      // Handle LNbits webhook
      console.log("Received LNbits webhook:", req.body);

      // Extract the payment hash or identifier from the webhook payload
      const { payment_hash } = req.body;

      if (!payment_hash) {
        return res.status(400).send("Missing payment hash.");
      }

      // Find the transaction in the database
      const transaction = await LbtcTransaction.findOne({
        where: {
          txid: payment_hash,
          userId,
        },
      });

      if (!transaction) {
        console.error("Transaction not found.");
        return res.status(404).send("Transaction not found.");
      }

      // Update the transaction status based on the webhook data
      const { paid } = req.body; // Adjust based on LNbits webhook payload

      if (paid) {
        transaction.status = "success";
      } else {
        transaction.status = "failed";
      }

      await transaction.save();

      res.status(200).send("Webhook received");
    } else {
      // Handle other providers
      res.status(400).send("Unsupported provider.");
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});
