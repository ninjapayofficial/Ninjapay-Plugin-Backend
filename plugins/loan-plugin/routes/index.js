// plugins/loan-plugin/routes/index.js

const express = require("express");
const router = express.Router();
const { calculateInterest, calculateDaysRemaining } = require(
  "../utils/calculateInterest",
);
const { Op } = require("sequelize");

module.exports = (models) => {
  const { LoanCompany, LoanClient, LoanTransaction, LoanInterestStatus } =
    models;

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

  // Route to edit a transaction
  router.put("/editTransaction/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const {
      transactionType,
      amount,
      givenDate,
      interestPercent,
      interestDueDate,
      description,
      txid,
      status,
    } = req.body;

    try {
      const transaction = await LoanTransaction.findByPk(id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Adjust the client's balance based on the old transaction
      const client = await LoanClient.findByPk(transaction.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Revert the previous transaction effect
      if (transaction.transactionType === "amount_given") {
        client.currentBalance -= parseFloat(transaction.amount);
      } else if (transaction.transactionType === "amount_received") {
        client.currentBalance += parseFloat(transaction.amount);
      }

      // Apply the new transaction effect
      if (transactionType === "amount_given") {
        client.currentBalance += parseFloat(amount);
      } else if (transactionType === "amount_received") {
        client.currentBalance -= parseFloat(amount);
      }

      // Update the transaction
      await transaction.update({
        transactionType,
        amount,
        givenDate,
        interestPercent,
        interestDueDate,
        description,
        txid,
        status,
        balanceAfter: client.currentBalance,
      });

      // Save the updated client balance
      await client.save();

      res.status(200).json(transaction);
    } catch (error) {
      console.error("Error editing transaction:", error);
      res.status(500).json({ error: "Failed to edit transaction" });
    }
  });

  // Route to delete a transaction
  router.delete("/deleteTransaction/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
      const transaction = await LoanTransaction.findByPk(id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Adjust the client's balance based on the transaction
      const client = await LoanClient.findByPk(transaction.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      if (transaction.transactionType === "amount_given") {
        client.currentBalance -= parseFloat(transaction.amount);
      } else if (transaction.transactionType === "amount_received") {
        client.currentBalance += parseFloat(transaction.amount);
      }

      // Delete the transaction
      await transaction.destroy();

      // Save the updated client balance
      await client.save();

      res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // Route to fetch single transaction details
  router.get("/getTransaction/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
      const transaction = await LoanTransaction.findByPk(id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.status(200).json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: "Failed to fetch transaction" });
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
  router.get(
    "/getTransactions/:clientId/:year/:month",
    authMiddleware,
    async (req, res) => {
      const { clientId, year, month } = req.params;

      try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const transactions = await LoanTransaction.findAll({
          where: {
            clientId,
            givenDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          order: [["givenDate", "DESC"]],
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
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
      }
    },
  );

  // Route to get interest summary for a client for a specific month and year
  router.get(
    "/getInterestSummary/:clientId/:year/:month",
    authMiddleware,
    async (req, res) => {
      const { clientId, year, month } = req.params;

      try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Get all 'amount_given' transactions within the month
        const givenTransactions = await LoanTransaction.findAll({
          where: {
            clientId,
            transactionType: "amount_given",
            givenDate: {
              // [Op.lte]: endDate,
              [Op.between]: [startDate, endDate],
            },
          },
        });

        // Calculate total interest due from amount_given
        let totalInterestGiven = 0;

        givenTransactions.forEach((transaction) => {
          const interest = calculateInterest(transaction, endDate);
          totalInterestGiven += interest;
        });

        // Get all 'amount_received' transactions within the month
        const receivedTransactions = await LoanTransaction.findAll({
          where: {
            clientId,
            transactionType: "amount_received",
            givenDate: {
              [Op.between]: [startDate, endDate],
            },
          },
        });

        // Calculate total interest received from amount_received
        let totalInterestReceived = 0;
        receivedTransactions.forEach((transaction) => {
          const interest = calculateInterest(transaction, endDate);
          totalInterestReceived += interest;
        });

        // Net interest due
        const netInterestDue = totalInterestGiven + totalInterestReceived; // received interests are negative

        // Calculate total amount given and received
        const totalAmountGiven = givenTransactions.reduce(
          (acc, tx) => acc + parseFloat(tx.amount),
          0,
        );
        const totalAmountReceived = receivedTransactions.reduce(
          (acc, tx) => acc + parseFloat(tx.amount),
          0,
        );

        // Net loan
        const netLoan = totalAmountGiven - totalAmountReceived;

        // Fetch or initialize status for the month
        let interestStatus = await LoanInterestStatus.findOne({
          where: { clientId, year, month },
        });

        let status = interestStatus ? interestStatus.status : "pending";

        res.status(200).json({
          totalInterestGiven: totalInterestGiven.toFixed(2),
          totalInterestReceived: Math.abs(totalInterestReceived).toFixed(2),
          netInterestDue: netInterestDue.toFixed(2),
          totalAmountGiven: totalAmountGiven.toFixed(2),
          totalAmountReceived: totalAmountReceived.toFixed(2),
          netLoan: netLoan.toFixed(2),
          status,
        });
      } catch (error) {
        console.error("Error fetching interest summary:", error);
        res.status(500).json({ error: "Failed to fetch interest summary" });
      }
    },
  );

  // Route to update interest status and handle "Add to Next Month"
  router.post("/updateInterestStatus", authMiddleware, async (req, res) => {
    const { clientId, year, month, status } = req.body;

    if (!clientId || !year || !month || !status) {
      return res
        .status(400)
        .json({ error: "Client ID, year, month, and status are required" });
    }

    try {
      // Fetch the interest summary to get net loan and net interest
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const givenTransactions = await LoanTransaction.findAll({
        where: {
          clientId,
          transactionType: "amount_given",
          givenDate: {
            [Op.lte]: endDate,
          },
        },
      });

      let totalInterestGiven = 0;

      givenTransactions.forEach((transaction) => {
        const interest = calculateInterest(transaction, endDate);
        totalInterestGiven += interest;
      });

      const receivedTransactions = await LoanTransaction.findAll({
        where: {
          clientId,
          transactionType: "amount_received",
          givenDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      let totalInterestReceived = 0;
      receivedTransactions.forEach((transaction) => {
        const interest = calculateInterest(transaction, endDate);
        totalInterestReceived += interest;
      });

      const netInterestDue = totalInterestGiven + totalInterestReceived; // received interests are negative

      const totalAmountGiven = givenTransactions.reduce(
        (acc, tx) => acc + parseFloat(tx.amount),
        0,
      );
      const totalAmountReceived = receivedTransactions.reduce(
        (acc, tx) => acc + parseFloat(tx.amount),
        0,
      );

      const netLoan = totalAmountGiven - totalAmountReceived;

      // Update or create the status for the month
      let interestStatus = await LoanInterestStatus.findOne({
        where: { clientId, year, month },
      });

      if (interestStatus) {
        await interestStatus.update({ status });
      } else {
        interestStatus = await LoanInterestStatus.create({
          clientId,
          year,
          month,
          status,
        });
      }

      // Handle 'added_to_next_month'
      if (status === "added_to_next_month") {
        // Calculate next month and year
        let nextMonth = parseInt(month) + 1;
        let nextYear = parseInt(year);
        if (nextMonth > 12) {
          nextMonth = 1;
          nextYear += 1;
        }

        const nextMonthStartDate = new Date(nextYear, nextMonth - 1, 1);
        const nextMonthEndDate = new Date(nextYear, nextMonth, 0, 23, 59, 59);

        // Create Net Loan Transaction
        await LoanTransaction.create({
          clientId,
          transactionType: "amount_given",
          amount: netLoan,
          givenDate: nextMonthStartDate,
          interestPercent: 0, // Assuming no interest on carryover
          interestDueDate: nextMonthEndDate,
          description: "Net loan carried over to next month",
          txid: `carryover-loan-${Date.now()}`,
          status: "pending",
          balanceAfter: netLoan, // Adjust as per your balance logic
        });

        // Create Net Interest Transaction
        await LoanTransaction.create({
          clientId,
          transactionType: "amount_given",
          amount: netInterestDue,
          givenDate: nextMonthStartDate,
          interestPercent: 0, // Assuming no interest on carryover
          interestDueDate: nextMonthEndDate,
          description: "Net interest carried over from previous month",
          txid: `carryover-interest-${Date.now()}`,
          status: "pending",
          balanceAfter: netInterestDue, // Adjust as per your balance logic
        });
      }

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

  return router;
};
