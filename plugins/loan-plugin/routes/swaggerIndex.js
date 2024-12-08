/* eslint-disable no-unused-vars */
// plugins/loan-plugin/routes/index.js

const express = require("express");
const router = express.Router();

// Middleware to check authentication
const authMiddleware = require("../../../middleware/authMiddleware");

module.exports = (models) => {
  const { LoanCompany, LoanClient, LoanTransaction, LoanInterestStatus } = models;

  /**
   * @swagger
   * tags:
   *   name: LoanPlugin
   *   description: Endpoints for managing loan companies, clients, transactions, and interest statuses
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     ErrorResponse:
   *       type: object
   *       properties:
   *         error:
   *           type: string
   *           description: Error message detailing what went wrong.
   *
   *     LoanCompany:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           description: Unique identifier for the loan company.
   *         userId:
   *           type: integer
   *           description: ID of the user who owns the company.
   *         name:
   *           type: string
   *           description: Name of the loan company.
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the company was created.
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the company was last updated.
   *
   *     LoanClient:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           description: Unique identifier for the loan client.
   *         companyId:
   *           type: integer
   *           description: ID of the associated loan company.
   *         name:
   *           type: string
   *           description: Name of the client.
   *         phoneNumber:
   *           type: string
   *           description: Client's phone number.
   *         email:
   *           type: string
   *           format: email
   *           description: Client's email address.
   *         address:
   *           type: string
   *           description: Client's physical address.
   *         currentBalance:
   *           type: number
   *           description: Current loan balance for the client.
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the client was created.
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the client was last updated.
   *
   *     LoanTransaction:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           description: Unique identifier for the loan transaction.
   *         clientId:
   *           type: integer
   *           description: ID of the associated loan client.
   *         transactionType:
   *           type: string
   *           enum: ["amount_given", "amount_received"]
   *           description: Type of transaction.
   *         amount:
   *           type: number
   *           description: Transaction amount.
   *         givenDate:
   *           type: string
   *           format: date-time
   *           description: Date when the transaction was given.
   *         interestPercent:
   *           type: number
   *           description: Interest percentage for the transaction.
   *         interestDueDate:
   *           type: string
   *           format: date-time
   *           description: Due date for the interest.
   *         description:
   *           type: string
   *           description: Description of the transaction.
   *         txid:
   *           type: string
   *           description: Transaction ID.
   *         status:
   *           type: string
   *           description: Status of the transaction.
   *         balanceAfter:
   *           type: number
   *           description: Balance after the transaction.
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the transaction was created.
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the transaction was last updated.
   *
   *     LoanInterestStatus:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           description: Unique identifier for the interest status.
   *         clientId:
   *           type: integer
   *           description: ID of the associated loan client.
   *         year:
   *           type: integer
   *           description: Year of the interest status.
   *         month:
   *           type: integer
   *           description: Month of the interest status.
   *         status:
   *           type: string
   *           description: Status of the interest.
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the interest status was created.
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the interest status was last updated.
   */

  /**
   * @swagger
   * /plugins/loan-plugin/addCompany:
   *   post:
   *     summary: Add a new loan company
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 description: Name of the loan company
   *     responses:
   *       201:
   *         description: Loan company created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoanCompany'
   *       400:
   *         description: Bad request - Company name is required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error - Failed to add company
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/addCompany", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/loan-plugin/addClient:
   *   post:
   *     summary: Add a new loan client
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - companyId
   *               - name
   *             properties:
   *               companyId:
   *                 type: integer
   *                 description: ID of the loan company
   *               name:
   *                 type: string
   *                 description: Name of the client
   *               phoneNumber:
   *                 type: string
   *                 description: Client's phone number
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Client's email address
   *               address:
   *                 type: string
   *                 description: Client's physical address
   *     responses:
   *       201:
   *         description: Loan client created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoanClient'
   *       400:
   *         description: Bad request - Company ID and client name are required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error - Failed to add client
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/addClient", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/loan-plugin/addTransaction:
   *   post:
   *     summary: Add a new loan transaction
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - clientId
   *               - transactionType
   *               - amount
   *             properties:
   *               clientId:
   *                 type: integer
   *                 description: ID of the loan client
   *               transactionType:
   *                 type: string
   *                 enum: ["amount_given", "amount_received"]
   *                 description: Type of transaction
   *               amount:
   *                 type: number
   *                 description: Transaction amount
   *               givenDate:
   *                 type: string
   *                 format: date-time
   *                 description: Date when the transaction was given
   *               interestPercent:
   *                 type: number
   *                 description: Interest percentage for the transaction
   *               interestDueDate:
   *                 type: string
   *                 format: date-time
   *                 description: Due date for the interest
   *               description:
   *                 type: string
   *                 description: Description of the transaction
   *               txid:
   *                 type: string
   *                 description: Transaction ID
   *               status:
   *                 type: string
   *                 description: Status of the transaction
   *     responses:
   *       201:
   *         description: Loan transaction created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoanTransaction'
   *       400:
   *         description: Bad request - Missing required fields or invalid transaction type
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error - Failed to add transaction
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/addTransaction", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/loan-plugin/editTransaction/{id}:
   *   put:
   *     summary: Edit an existing loan transaction
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the transaction to edit
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               transactionType:
   *                 type: string
   *                 enum: ["amount_given", "amount_received"]
   *                 description: Type of transaction
   *               amount:
   *                 type: number
   *                 description: Transaction amount
   *               givenDate:
   *                 type: string
   *                 format: date-time
   *                 description: Date when the transaction was given
   *               interestPercent:
   *                 type: number
   *                 description: Interest percentage for the transaction
   *               interestDueDate:
   *                 type: string
   *                 format: date-time
   *                 description: Due date for the interest
   *               description:
   *                 type: string
   *                 description: Description of the transaction
   *               txid:
   *                 type: string
   *                 description: Transaction ID
   *               status:
   *                 type: string
   *                 description: Status of the transaction
   *     responses:
   *       200:
   *         description: Loan transaction updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoanTransaction'
   *       400:
   *         description: Bad request - Invalid transaction type or missing fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Transaction not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error - Failed to edit transaction
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.put("/editTransaction/:id", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/loan-plugin/deleteTransaction/{id}:
   *   delete:
   *     summary: Delete an existing loan transaction
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the transaction to delete
   *     responses:
   *       200:
   *         description: Loan transaction deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Success message
   *       404:
   *         description: Transaction not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error - Failed to delete transaction
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.delete("/deleteTransaction/:id", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/loan-plugin/getTransaction/{id}:
   *   get:
   *     summary: Retrieve details of a specific loan transaction
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the transaction to retrieve
   *     responses:
   *       200:
   *         description: Loan transaction details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoanTransaction'
   *       404:
   *         description: Transaction not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error - Failed to fetch transaction
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/getTransaction/:id", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/loan-plugin/getClients/{companyId}:
   *   get:
   *     summary: Retrieve all clients for a specific loan company
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: companyId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the loan company
   *     responses:
   *       200:
   *         description: List of loan clients retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/LoanClient'
   *       500:
   *         description: Server error - Failed to fetch clients
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/getClients/:companyId", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/loan-plugin/getTransactions/{clientId}/{year}/{month}:
   *   get:
   *     summary: Retrieve transactions for a client, filtered by month and year
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: clientId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the loan client
   *       - in: path
   *         name: year
   *         required: true
   *         schema:
   *           type: integer
   *         description: Year to filter transactions
   *       - in: path
   *         name: month
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *         description: Month to filter transactions
   *     responses:
   *       200:
   *         description: List of loan transactions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   transaction:
   *                     $ref: '#/components/schemas/LoanTransaction'
   *                   interest:
   *                     type: number
   *                     description: Calculated interest for the transaction
   *                   daysRemaining:
   *                     type: integer
   *                     description: Days remaining until interest due date
   *       500:
   *         description: Server error - Failed to fetch transactions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get(
    "/getTransactions/:clientId/:year/:month",
    authMiddleware,
    async (req, res) => {
      // Implementation code omitted
    }
  );

  /**
   * @swagger
   * /plugins/loan-plugin/getInterestSummary/{clientId}/{year}/{month}:
   *   get:
   *     summary: Retrieve interest summary for a client for a specific month and year
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: clientId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the loan client
   *       - in: path
   *         name: year
   *         required: true
   *         schema:
   *           type: integer
   *         description: Year of the interest summary
   *       - in: path
   *         name: month
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *         description: Month of the interest summary
   *     responses:
   *       200:
   *         description: Interest summary retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalInterestGiven:
   *                   type: number
   *                   description: Total interest given in the month
   *                 totalInterestReceived:
   *                   type: number
   *                   description: Total interest received in the month
   *                 netInterestDue:
   *                   type: number
   *                   description: Net interest due for the month
   *                 totalAmountGiven:
   *                   type: number
   *                   description: Total amount given in the month
   *                 totalAmountReceived:
   *                   type: number
   *                   description: Total amount received in the month
   *                 netLoan:
   *                   type: number
   *                   description: Net loan amount for the month
   *                 status:
   *                   type: string
   *                   description: Status of the interest for the month
   *       500:
   *         description: Server error - Failed to fetch interest summary
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get(
    "/getInterestSummary/:clientId/:year/:month",
    authMiddleware,
    async (req, res) => {
      // Implementation code omitted
    }
  );

  /**
   * @swagger
   * /plugins/loan-plugin/updateInterestStatus:
   *   post:
   *     summary: Update interest status and handle carryover to next month
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - clientId
   *               - year
   *               - month
   *               - status
   *             properties:
   *               clientId:
   *                 type: integer
   *                 description: ID of the loan client
   *               year:
   *                 type: integer
   *                 description: Year of the interest status update
   *               month:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 12
   *                 description: Month of the interest status update
   *               status:
   *                 type: string
   *                 description: New status of the interest
   *     responses:
   *       200:
   *         description: Interest status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Success message
   *       400:
   *         description: Bad request - Missing required fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error - Failed to update interest status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/updateInterestStatus", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/loan-plugin/getCompanies:
   *   get:
   *     summary: Retrieve all loan companies for the authenticated user
   *     tags: [LoanPlugin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of loan companies retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/LoanCompany'
   *       500:
   *         description: Server error - Failed to fetch companies
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/getCompanies", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  // Additional routes can be added here with similar Swagger annotations

  return router;
};
