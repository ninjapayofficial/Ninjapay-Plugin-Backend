// // services/paymentService.js

// const lnbitsPaymentService = require('./lnbitsPaymentService');
// const opennodePaymentService = require('./opennodePaymentService');

// /**
//  * Creates a payment link using the specified provider.
//  * @param {Object} user - User details.
//  * @param {Object} provider - Provider details.
//  * @param {number} amount - Amount in sats.
//  * @param {string} description - Description/memo for the invoice.
//  * @param {Object} models - Sequelize models.
//  * @returns {Object|null} - Payment link data or null on failure.
//  */
// async function createPayLink(user, provider, amount, description, models) {
//   try {
//     if (provider.provider === 'lnbits') {
//       return await lnbitsPaymentService.createPayLink(
//         user,
//         provider,
//         amount,
//         description,
//         models.LbtcTransaction
//       );
//     } else if (provider.provider === 'opennode') {
//       return await opennodePaymentService.createPayLink(
//         user,
//         provider,
//         amount,
//         description,
//         models.OpennodeTransaction
//       );
//     } else {
//       console.error('Unsupported provider:', provider.provider);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error creating pay link:', error);
//     return null;
//   }
// }

// /**
//  * Pays an invoice using the specified provider.
//  * @param {Object} user - User details.
//  * @param {Object} provider - Provider details.
//  * @param {string} bolt11 - BOLT11 invoice string.
//  * @param {Object} models - Sequelize models.
//  * @returns {Object|null} - Payment status data or null on failure.
//  */
// async function payInvoice(user, provider, bolt11, models) {
//   try {
//     if (provider.provider === 'lnbits') {
//       return await lnbitsPaymentService.payInvoice(
//         user,
//         provider,
//         bolt11,
//         models.LbtcTransaction
//       );
//     } else if (provider.provider === 'opennode') {
//       return await opennodePaymentService.payInvoice(
//         user,
//         provider,
//         bolt11,
//         models.OpennodeTransaction
//       );
//     } else {
//       console.error('Unsupported provider:', provider.provider);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error paying invoice:', error);
//     return null;
//   }
// }

// /**
//  * Checks the status of a payment using the specified provider.
//  * @param {Object} provider - Provider details.
//  * @param {string} paymentId - Payment hash or ID.
//  * @returns {Object|null} - Payment status data or null on failure.
//  */
// async function checkPaymentStatus(provider, paymentId) {
//   try {
//     if (provider.provider === 'lnbits') {
//       return await lnbitsPaymentService.checkPaymentStatus(provider, paymentId);
//     } else if (provider.provider === 'opennode') {
//       return await opennodePaymentService.checkPaymentStatus(provider, paymentId);
//     } else {
//       console.error('Unsupported provider:', provider.provider);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error checking payment status:', error);
//     return null;
//   }
// }

// /**
//  * Retrieves the wallet balance using the specified provider.
//  * @param {Object} provider - Provider details.
//  * @returns {number|null} - Balance in sats or null on failure.
//  */
// async function getBalance(provider) {
//   try {
//     if (provider.provider === 'lnbits') {
//       return await lnbitsPaymentService.getBalance(provider);
//     } else if (provider.provider === 'opennode') {
//       return await opennodePaymentService.getBalance(provider);
//     } else {
//       console.error('Unsupported provider:', provider.provider);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching balance:', error);
//     return null;
//   }
// }

// /**
//  * Retrieves transaction history using the specified provider.
//  * @param {Object} user - User details.
//  * @param {Object} provider - Provider details.
//  * @param {Object} models - Sequelize models.
//  * @returns {Array|null} - Array of transactions or null on failure.
//  */
// async function getTransactions(user, provider, models) {
//   try {
//     if (provider.provider === 'lnbits') {
//       return await lnbitsPaymentService.getTransactions(
//         user,
//         provider,
//         models.LbtcTransaction
//       );
//     } else if (provider.provider === 'opennode') {
//       return await opennodePaymentService.getTransactions(
//         user,
//         provider,
//         models.OpennodeTransaction
//       );
//     } else {
//       console.error('Unsupported provider:', provider.provider);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching transactions:', error);
//     return null;
//   }
// }

// module.exports = {
//   createPayLink,
//   payInvoice,
//   checkPaymentStatus,
//   getBalance,
//   getTransactions,
// };
