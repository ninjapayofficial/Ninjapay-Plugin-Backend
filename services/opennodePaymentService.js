// services/opennodePaymentService.js

const axios = require("axios");

/**
 * Creates a payment link using OpenNode.
 * @param {Object} user - User details.
 * @param {Object} provider - Provider details.
 * @param {number} amount - Amount in sats.
 * @param {string} description - Description/memo for the invoice.
 * @param {Object} OpennodeTransaction - Sequelize Transaction model.
 * @returns {Object|null} - Payment link data or null on failure.
 */
async function createPayLink(
  user,
  provider,
  amount,
  description,
  notifyUrl,
  OpennodeTransaction,
) {
  try {
    const url = "https://api.opennode.com/v1/charges";
    const data = {
      amount: amount,
      currency: "BTC", // Specify currency as BTC
      description,
      callback_url: "https://yourdomain.com/webhook/opennode", // Update with your callback URL
      success_url: "https://yourdomain.com/success", // Update with your success URL
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: provider.apiKey,
    };
    const response = await axios.post(url, data, { headers });

    if (response.status === 201 || response.status === 200) {
      const { id, lightning_invoice } = response.data.data;

      // Store the transaction
      await OpennodeTransaction.create({
        userId: user.uid,
        txid: id,
        amount,
        description,
        invoiceKeyUsed: provider.providerInvoiceKey,
        walletId: provider.walletId || null,
      });

      return {
        payment_request: lightning_invoice.payreq,
        payment_hash: id,
      };
    } else {
      console.error("Failed to create OpenNode charge:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error(
      "Error creating OpenNode charge:",
      error.response ? error.response.data : error.message,
    );
    return null;
  }
}

/**
 * Pays an invoice using OpenNode.
 * @param {Object} user - User details.
 * @param {Object} provider - Provider details.
 * @param {string} bolt11 - BOLT11 invoice string.
 * @param {Object} OpennodeTransaction - Sequelize Transaction model.
 * @returns {Object|null} - Payment status data or null on failure.
 */
async function payInvoice(user, provider, bolt11, OpennodeTransaction) {
  try {
    const url = "https://api.opennode.com/v1/withdrawals";
    const data = {
      type: "ln",
      address: bolt11,
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: provider.apiKey,
    };
    const response = await axios.post(url, data, { headers });

    if (response.status === 201 || response.status === 200) {
      const { id } = response.data.data;

      // Store the transaction
      await OpennodeTransaction.create({
        userId: user.uid,
        txid: id,
        amount: null, // Optionally, fetch from invoice details
        description: "Payment made",
        invoiceKeyUsed: provider.providerAdminKey,
        walletId: provider.walletId || null,
      });

      return { payment_hash: id };
    } else {
      console.error("Failed to pay OpenNode invoice:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error(
      "Error paying OpenNode invoice:",
      error.response ? error.response.data : error.message,
    );
    return null;
  }
}

/**
 * Checks the status of a payment using OpenNode.
 * @param {Object} provider - Provider details.
 * @param {string} paymentId - Payment hash or ID.
 * @returns {Object|null} - Payment status data or null on failure.
 */
async function checkPaymentStatus(user, provider, paymentId) {
  try {
    const url = `https://api.opennode.com/v1/charge/${paymentId}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: provider.apiKey,
    };
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      return response.data.data;
    } else {
      console.error(
        "Failed to check OpenNode payment status:",
        response.statusText,
      );
      return null;
    }
  } catch (error) {
    console.error(
      "Error checking OpenNode payment status:",
      error.response ? error.response.data : error.message,
    );
    return null;
  }
}

/**
 * Retrieves the wallet balance using OpenNode.
 * @param {Object} provider - Provider details.
 * @returns {Object|null} - Object containing balance and currency or null on failure.
 */
async function getBalance(provider) {
  try {
    const url = "https://api.opennode.com/v1/account/balance";
    const headers = {
      "Content-Type": "application/json",
      Authorization: provider.readApiKey,
    };
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      // OpenNode returns balance in BTC
      const balance = parseFloat(response.data.data.balance.BTC);
      const balanceBTC = Math.round(balance) / 1e8;
      const withdrawable = Math.round(balance * 0.98) / 1e8; // Assuming 2% needed for routing fee
      // If you prefer to send balance in Satoshis, uncomment the next line
      // const balanceSats = Math.floor(balanceBTC * 100000000);
      // return { balance: balanceSats, currency: 'SAT' };

      // Sending balance in BTC
      return { balance: balanceBTC, currency: "BTC", withdrawable };
    } else {
      console.error("Failed to fetch OpenNode balance:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error(
      "Error fetching OpenNode balance:",
      error.response ? error.response.data : error.message,
    );
    return null;
  }
}

/**
 * Retrieves transaction history using OpenNode.
 * @param {Object} user - User details.
 * @param {Object} provider - Provider details.
 * @param {Object} OpennodeTransaction - Sequelize Transaction model.
 * @returns {Array|null} - Array of transactions with currency or null on failure.
 */
async function getTransactions(user, provider, OpennodeTransaction) {
  try {
    const transactions = await OpennodeTransaction.findAll({
      where: { userId: user.uid },
      order: [["createdAt", "DESC"]],
    });

    // Append currency to each transaction
    return transactions.map((tx) => ({
      ...tx.get({ plain: true }), // Convert Sequelize instance to plain object
      currency: "SAT",
    }));
  } catch (error) {
    console.error("Error fetching OpenNode transactions:", error);
    return null;
  }
}

module.exports = {
  createPayLink,
  payInvoice,
  checkPaymentStatus,
  getBalance,
  getTransactions,
};
