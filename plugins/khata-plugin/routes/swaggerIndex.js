/* eslint-disable no-unused-vars */
// plugins/khata-plugin/src/routes/index.js

const express = require("express");
const router = express.Router();

// Middleware to check authentication
const authMiddleware = require("../../../middleware/authMiddleware");

module.exports = (models) => {
  const { KhataCompany, KhataParty, KhataTransaction } = models;

  /**
   * @swagger
   * tags:
   *   name: KhataPlugin
   *   description: Endpoints for managing Khata companies, parties, and transactions
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
   *     KhataCompany:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           description: Unique identifier for the Khata company.
   *         userId:
   *           type: integer
   *           description: ID of the user who owns the company.
   *         name:
   *           type: string
   *           description: Name of the Khata company.
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the company was created.
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the company was last updated.
   *
   *     KhataParty:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           description: Unique identifier for the Khata party.
   *         companyId:
   *           type: integer
   *           description: ID of the associated Khata company.
   *         type:
   *           type: string
   *           enum: ["customer", "supplier"]
   *           description: Type of party (customer or supplier).
   *         name:
   *           type: string
   *           description: Name of the party.
   *         phoneNumber:
   *           type: string
   *           description: Party's phone number.
   *         gstin:
   *           type: string
   *           description: GST Identification Number.
   *         billingAddress:
   *           type: string
   *           description: Billing address of the party.
   *         shippingAddress:
   *           type: string
   *           description: Shipping address of the party.
   *         reminderDate:
   *           type: string
   *           format: date
   *           description: Reminder date for payments.
   *         currentBalance:
   *           type: number
   *           description: Current balance of the party.
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the party was created.
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the party was last updated.
   *
   *     KhataTransaction:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           description: Unique identifier for the Khata transaction.
   *         partyId:
   *           type: integer
   *           description: ID of the associated Khata party.
   *         amount:
   *           type: number
   *           description: Transaction amount.
   *         description:
   *           type: string
   *           description: Description of the transaction.
   *         entryDate:
   *           type: string
   *           format: date-time
   *           description: Date of the transaction entry.
   *         billImageUrl:
   *           type: string
   *           format: uri
   *           description: URL of the bill image.
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
   */

  /**
   * @swagger
   * /plugins/khata-plugin/addCompany:
   *   post:
   *     summary: Add a new Khata company
   *     tags: [KhataPlugin]
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
   *                 description: Name of the Khata company
   *     responses:
   *       201:
   *         description: Khata company created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/KhataCompany'
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
   * /plugins/khata-plugin/addParty:
   *   post:
   *     summary: Add a new Khata party (customer or supplier)
   *     tags: [KhataPlugin]
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
   *               - type
   *               - name
   *             properties:
   *               companyId:
   *                 type: integer
   *                 description: ID of the Khata company
   *               type:
   *                 type: string
   *                 enum: ["customer", "supplier"]
   *                 description: Type of party (customer or supplier)
   *               name:
   *                 type: string
   *                 description: Name of the party
   *               phoneNumber:
   *                 type: string
   *                 description: Party's phone number
   *               gstin:
   *                 type: string
   *                 description: GST Identification Number
   *               billingAddress:
   *                 type: string
   *                 description: Billing address of the party
   *               shippingAddress:
   *                 type: string
   *                 description: Shipping address of the party
   *               reminderDate:
   *                 type: string
   *                 format: date
   *                 description: Reminder date for payments
   *     responses:
   *       201:
   *         description: Khata party created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/KhataParty'
   *       400:
   *         description: Bad request - Company ID, type, and name are required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Server error - Failed to add party
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/addParty", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/khata-plugin/addTransaction:
   *   post:
   *     summary: Add a new Khata transaction
   *     tags: [KhataPlugin]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - partyId
   *               - amount
   *             properties:
   *               partyId:
   *                 type: integer
   *                 description: ID of the Khata party
   *               amount:
   *                 type: number
   *                 description: Transaction amount
   *               description:
   *                 type: string
   *                 description: Description of the transaction
   *               entryDate:
   *                 type: string
   *                 format: date-time
   *                 description: Date of the transaction entry
   *               billImageUrl:
   *                 type: string
   *                 format: uri
   *                 description: URL of the bill image
   *     responses:
   *       201:
   *         description: Khata transaction created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/KhataTransaction'
   *       400:
   *         description: Bad request - Party ID and amount are required
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
   * /plugins/khata-plugin/getParties/{companyId}:
   *   get:
   *     summary: Retrieve all parties for a specific Khata company
   *     tags: [KhataPlugin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: companyId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the Khata company
   *     responses:
   *       200:
   *         description: List of Khata parties retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/KhataParty'
   *       500:
   *         description: Server error - Failed to fetch parties
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/getParties/:companyId", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/khata-plugin/getTransactions/{partyId}:
   *   get:
   *     summary: Retrieve all transactions for a specific Khata party
   *     tags: [KhataPlugin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: partyId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the Khata party
   *     responses:
   *       200:
   *         description: List of Khata transactions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/KhataTransaction'
   *       500:
   *         description: Server error - Failed to fetch transactions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/getTransactions/:partyId", authMiddleware, async (req, res) => {
    // Implementation code omitted
  });

  /**
   * @swagger
   * /plugins/khata-plugin/getCompanies:
   *   get:
   *     summary: Retrieve all Khata companies for the authenticated user
   *     tags: [KhataPlugin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of Khata companies retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/KhataCompany'
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
