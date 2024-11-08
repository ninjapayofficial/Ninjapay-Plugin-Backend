// firebase.js
const admin = require('firebase-admin');

const serviceAccount = require('./ninjapay-plugin-backend-dev-firebase-adminsdk-oiyn8-3f93833a6b.json'); // Replace with the path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
