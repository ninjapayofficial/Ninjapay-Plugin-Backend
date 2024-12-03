// plugins/loan-plugin/routes/index.js

const express = require("express");
const router = express.Router();
const { calculateInterest, calculateDaysRemaining } = require('../utils/calculateInterest');
const { Op } = require("sequelize");

module.exports = (models) => {
  const { LoanCompany, LoanClient, LoanTransaction, LoanInterestStatus } = models;

  // Middleware to check authentication
  const authMiddleware = require("../../../middleware/authMiddleware");

  // Route to add a company
  router.post("/addCompany", authMiddleware, async (req, res) => {
    const userId = req.user.uid;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Company name is required" });
    }

    try {
      const company = await LoanCompany.create({ userId, name });
      res.status(201).json(company);
    } catch (error) {
      console.error("Error adding company:", error);
      res.status(500).json({ error: "Failed to add company" });
    }
  });

  // Route to add a client
  router.post("/addClient", authMiddleware, async (req, res) => {
    const { companyId, name, phoneNumber, email, address } = req.body;

    if (!companyId || !name) {
      return res
        .status(400)
        .json({ error: "Company ID and client name are required" });
    }

    try {
      const client = await LoanClient.create({
        companyId,
        name,
        phoneNumber,
        email,
        address,
      });
      res.status(201).json(client);
    } catch (error) {
      console.error("Error adding client:", error);
      res.status(500).json({ error: "Failed to add client" });
    }
  });

  // Route to add a transaction
  router.post("/addTransaction", authMiddleware, async (req, res) => {
    const {
      clientId,
      transactionType,
      amount,
      givenDate,
      interestPercent,
      interestDueDate,
      description,
      txid,
      status,
    } = req.body;

    if (!clientId || !transactionType || !amount) {
      return res.status(400).json({
        error: "Client ID, transaction type, and amount are required",
      });
    }

    try {
      // Fetch the last transaction to get the current balance
      const lastTransaction = await LoanTransaction.findOne({
        where: { clientId },
        order: [["createdAt", "DESC"]],
      });

      let previousBalance = lastTransaction
        ? parseFloat(lastTransaction.balanceAfter)
        : 0;
      let newBalance;

      if (transactionType === "amount_given") {
        newBalance = previousBalance + parseFloat(amount);
      } else if (transactionType === "amount_received") {
        newBalance = previousBalance - parseFloat(amount);
      } else {
        return res.status(400).json({ error: "Invalid transaction type" });
      }

      // Create the new transaction
      const transaction = await LoanTransaction.create({
        clientId,
        transactionType,
        amount,
        givenDate,
        interestPercent,
        interestDueDate,
        description,
        txid,
        status,
        balanceAfter: newBalance,
      });

      // Update the client's current balance
      await LoanClient.update(
        { currentBalance: newBalance },
        { where: { id: clientId } },
      );

      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error adding transaction:", error);
      res.status(500).json({ error: "Failed to add transaction" });
    }
  });

  // Route to get clients for a company
  router.get("/getClients/:companyId", authMiddleware, async (req, res) => {
    const { companyId } = req.params;

    try {
      const clients = await LoanClient.findAll({ where: { companyId } });
      res.status(200).json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // Route to get transactions for a client, filtered by month and year
  // Import the new function

// ...

// Update the getTransactions route
router.get(
  '/getTransactions/:clientId/:year/:month',
  authMiddleware,
  async (req, res) => {
    const { clientId, year, month } = req.params;

    try {
      // eslint-disable-next-line no-unused-vars
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const transactions = await LoanTransaction.findAll({
        where: {
          clientId,
          givenDate: {
            [Op.lte]: endDate, // Include all transactions up to endDate
          },
        },
        order: [['givenDate', 'DESC']],
      });

      // For each transaction, calculate interest and days remaining
      const transactionsWithDetails = transactions.map((transaction) => {
        const interest = calculateInterest(transaction, endDate);
        const daysRemaining = calculateDaysRemaining(transaction, endDate);
        return {
          ...transaction.toJSON(),
          interest: interest.toFixed(2),
          daysRemaining,
        };
      });

      res.status(200).json(transactionsWithDetails);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  },
);


  // Route to get interest summary for a client for a specific month and year
  router.get(
    '/getInterestSummary/:clientId/:year/:month',
    authMiddleware,
    async (req, res) => {
      const { clientId, year, month } = req.params;
  
      try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
  
        // Get all 'amount_given' transactions before the end of the month
        const givenTransactions = await LoanTransaction.findAll({
          where: {
            clientId,
            transactionType: 'amount_given',
            givenDate: {
              [Op.lte]: endDate,
            },
          },
        });
  
        // Calculate total interest due
        let totalInterestDue = 0;
  
        givenTransactions.forEach((transaction) => {
          const interest = calculateInterest(transaction, endDate);
          totalInterestDue += interest;
        });
  
        // Get all 'amount_received' transactions within the month
        const receivedTransactions = await LoanTransaction.findAll({
          where: {
            clientId,
            transactionType: 'amount_received',
            givenDate: {
              [Op.between]: [startDate, endDate],
            },
          },
        });
  
        // Calculate total amount received
        let totalAmountReceived = 0;
        receivedTransactions.forEach((transaction) => {
          totalAmountReceived += parseFloat(transaction.amount);
        });
  
        // Net interest due
        const netInterestDue = totalInterestDue - totalAmountReceived;
  
        // Fetch or initialize status for the month
        let interestStatus = await LoanInterestStatus.findOne({
          where: { clientId, year, month },
        });
  
        let status = interestStatus ? interestStatus.status : 'pending';
  
        res.status(200).json({
          totalInterestDue: totalInterestDue.toFixed(2),
          totalAmountReceived: totalAmountReceived.toFixed(2),
          netInterestDue: netInterestDue.toFixed(2),
          status,
        });
      } catch (error) {
        console.error('Error fetching interest summary:', error);
        res.status(500).json({ error: 'Failed to fetch interest summary' });
      }
    },
  );
  

  // Route to update interest status
  router.post("/updateInterestStatus", authMiddleware, async (req, res) => {
    const { clientId, year, month, status } = req.body;

    if (!clientId || !year || !month || !status) {
      return res
        .status(400)
        .json({ error: "Client ID, year, month, and status are required" });
    }

    try {
      // Update or create the status for the month
      // Assuming you have a LoanInterestStatus model

      // Handle 'added to next month'
      if (status === "added_to_next_month") {
        // Get the net interest due for the month
        // (You might need to calculate it again or pass it in the request)
        const netInterestDue = 777;

        // Create a new 'amount_given' transaction on the first of the next month
        const nextMonth = parseInt(month) + 1;
        const nextYear = nextMonth > 12 ? parseInt(year) + 1 : year;
        const adjustedMonth = nextMonth > 12 ? 1 : nextMonth;
        const nextMonthDate = new Date(nextYear, adjustedMonth - 1, 1);

        await LoanTransaction.create({
          clientId,
          transactionType: "amount_given",
          amount: netInterestDue, // The interest amount to carry over
          givenDate: nextMonthDate,
          interestPercent: 0, // Assuming no additional interest
          description: "Interest carried over from previous month",
          status: "pending",
        });
      }

      // Update the status in the database
      // ...

      res.status(200).json({ message: "Interest status updated successfully" });
    } catch (error) {
      console.error("Error updating interest status:", error);
      res.status(500).json({ error: "Failed to update interest status" });
    }
  });

  // Route to get companies for the user
  router.get("/getCompanies", authMiddleware, async (req, res) => {
    const userId = req.user.uid;

    try {
      const companies = await LoanCompany.findAll({ where: { userId } });
      res.status(200).json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  // Additional routes to handle status updates and calculations can be added here

  return router;
};
