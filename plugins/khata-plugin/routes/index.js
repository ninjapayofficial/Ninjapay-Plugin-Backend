// plugins/khata-plugin/src/routes/index.js

const express = require("express");
const router = express.Router();

module.exports = (models) => {
  const { KhataCompany, KhataParty, KhataTransaction } = models;

  // Middleware to check authentication and set req.user
  const authMiddleware = require("../../../middleware/authMiddleware");

  // Route to add a company
  router.post("/addCompany", authMiddleware, async (req, res) => {
    const userId = req.user.uid;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Company name is required" });
    }

    try {
      const company = await KhataCompany.create({ userId, name });
      res.status(201).json(company);
    } catch (error) {
      console.error("Error adding company:", error);
      res.status(500).json({ error: "Failed to add company" });
    }
  });

  // Route to add a party (customer or supplier)
  router.post("/addParty", authMiddleware, async (req, res) => {
    const {
      companyId,
      type,
      name,
      phoneNumber,
      gstin,
      billingAddress,
      shippingAddress,
      reminderDate,
    } = req.body;

    if (!companyId || !type || !name) {
      return res
        .status(400)
        .json({ error: "Company ID, type, and name are required" });
    }

    try {
      const party = await KhataParty.create({
        companyId,
        type,
        name,
        phoneNumber,
        gstin,
        billingAddress,
        shippingAddress,
        reminderDate,
      });
      res.status(201).json(party);
    } catch (error) {
      console.error("Error adding party:", error);
      res.status(500).json({ error: "Failed to add party" });
    }
  });

  // Route to add a transaction
  router.post("/addTransaction", authMiddleware, async (req, res) => {
    const { partyId, amount, description, entryDate, billImageUrl } = req.body;

    if (!partyId || !amount) {
      return res
        .status(400)
        .json({ error: "Party ID and amount are required" });
    }

    try {
      // Fetch the last transaction to get the current balance
      const lastTransaction = await KhataTransaction.findOne({
        where: { partyId },
        order: [["createdAt", "DESC"]],
      });

      let previousBalance = lastTransaction
        ? parseFloat(lastTransaction.balanceAfter)
        : 0;
      let newBalance = previousBalance + parseFloat(amount);

      // Create the new transaction
      const transaction = await KhataTransaction.create({
        partyId,
        amount,
        description,
        entryDate,
        billImageUrl,
        balanceAfter: newBalance,
      });

      // Update the party's current balance
      await KhataParty.update(
        { currentBalance: newBalance },
        { where: { id: partyId } },
      );

      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error adding transaction:", error);
      res.status(500).json({ error: "Failed to add transaction" });
    }
  });

  // Route to get all parties for a company
  router.get("/getParties/:companyId", authMiddleware, async (req, res) => {
    const { companyId } = req.params;

    try {
      const parties = await KhataParty.findAll({ where: { companyId } });
      res.status(200).json(parties);
    } catch (error) {
      console.error("Error fetching parties:", error);
      res.status(500).json({ error: "Failed to fetch parties" });
    }
  });

  // Route to get transactions for a party
  router.get("/getTransactions/:partyId", authMiddleware, async (req, res) => {
    const { partyId } = req.params;

    try {
      const transactions = await KhataTransaction.findAll({
        where: { partyId },
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Route to get companies for the user
  router.get("/getCompanies", authMiddleware, async (req, res) => {
    const userId = req.user.uid;

    try {
      const companies = await KhataCompany.findAll({ where: { userId } });
      res.status(200).json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  // Additional routes can be added here

  return router;
};
