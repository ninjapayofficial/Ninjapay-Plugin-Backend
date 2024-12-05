// const admin = require("firebase-admin");
// const { sequelize, models } = require("./models");

// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });

// async function migrateUsers() {
//   try {
//     const users = [];
//     let nextPageToken;
//     do {
//       const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
//       listUsersResult.users.forEach((userRecord) => {
//         users.push({
//           id: userRecord.uid,
//           email: userRecord.email || null,
//           //   isAdmin: false, // Set default or determine based on your logic
//           // Add other fields as necessary
//         });
//       });
//       nextPageToken = listUsersResult.pageToken;
//     } while (nextPageToken);

//     // Bulk insert into Users table
//     await models.User.bulkCreate(users, { ignoreDuplicates: true });
//     console.log("Migration completed successfully.");
//   } catch (error) {
//     console.error("Error migrating users:", error);
//   } finally {
//     await sequelize.close();
//   }
// }

// migrateUsers();
