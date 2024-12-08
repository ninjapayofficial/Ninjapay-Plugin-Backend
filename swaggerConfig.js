// swaggerConfig.js

const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const fs = require("fs");

/**
 * Function to dynamically retrieve all plugin route paths.
 * It scans the /plugins directory and includes all .js files under each plugin's /routes folder.
 */
const getPluginRoutePaths = () => {
  // eslint-disable-next-line no-undef
  const pluginsDir = path.join(__dirname, "plugins");
  let pluginRoutePaths = [];

  if (fs.existsSync(pluginsDir)) {
    const plugins = fs.readdirSync(pluginsDir).filter((file) => {
      return fs.statSync(path.join(pluginsDir, file)).isDirectory();
    });

    plugins.forEach((plugin) => {
      const routesPath = path.join(pluginsDir, plugin, "routes", "**", "*.js");
      pluginRoutePaths.push(routesPath);
    });
  }

  return pluginRoutePaths;
};

// Define reusable schemas to promote consistency across the documentation
const reusableSchemas = {
  ErrorResponse: {
    type: "object",
    properties: {
      error: {
        type: "string",
        description: "Error message detailing what went wrong.",
      },
    },
  },
  KhataCompany: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "Unique identifier for the Khata company.",
      },
      userId: {
        type: "integer",
        description: "ID of the user who owns the company.",
      },
      name: {
        type: "string",
        description: "Name of the Khata company.",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the company was created.",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the company was last updated.",
      },
    },
  },
  KhataParty: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "Unique identifier for the Khata party.",
      },
      companyId: {
        type: "integer",
        description: "ID of the associated Khata company.",
      },
      type: {
        type: "string",
        enum: ["customer", "supplier"],
        description: "Type of party (customer or supplier).",
      },
      name: {
        type: "string",
        description: "Name of the party.",
      },
      phoneNumber: {
        type: "string",
        description: "Party's phone number.",
      },
      gstin: {
        type: "string",
        description: "GST Identification Number.",
      },
      billingAddress: {
        type: "string",
        description: "Billing address of the party.",
      },
      shippingAddress: {
        type: "string",
        description: "Shipping address of the party.",
      },
      reminderDate: {
        type: "string",
        format: "date",
        description: "Reminder date for payments.",
      },
      currentBalance: {
        type: "number",
        description: "Current balance of the party.",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the party was created.",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the party was last updated.",
      },
    },
  },
  KhataTransaction: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "Unique identifier for the Khata transaction.",
      },
      partyId: {
        type: "integer",
        description: "ID of the associated Khata party.",
      },
      amount: {
        type: "number",
        description: "Transaction amount.",
      },
      description: {
        type: "string",
        description: "Description of the transaction.",
      },
      entryDate: {
        type: "string",
        format: "date-time",
        description: "Date of the transaction entry.",
      },
      billImageUrl: {
        type: "string",
        format: "uri",
        description: "URL of the bill image.",
      },
      balanceAfter: {
        type: "number",
        description: "Balance after the transaction.",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the transaction was created.",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the transaction was last updated.",
      },
    },
  },
  LoanCompany: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "Unique identifier for the loan company.",
      },
      userId: {
        type: "integer",
        description: "ID of the user who owns the company.",
      },
      name: {
        type: "string",
        description: "Name of the loan company.",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the company was created.",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the company was last updated.",
      },
    },
  },
  // loan plugin schema
  LoanClient: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "Unique identifier for the loan client.",
      },
      companyId: {
        type: "integer",
        description: "ID of the associated loan company.",
      },
      name: {
        type: "string",
        description: "Name of the client.",
      },
      phoneNumber: {
        type: "string",
        description: "Client's phone number.",
      },
      email: {
        type: "string",
        format: "email",
        description: "Client's email address.",
      },
      address: {
        type: "string",
        description: "Client's physical address.",
      },
      currentBalance: {
        type: "number",
        description: "Current loan balance for the client.",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the client was created.",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the client was last updated.",
      },
    },
  },
  LoanTransaction: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "Unique identifier for the loan transaction.",
      },
      clientId: {
        type: "integer",
        description: "ID of the associated loan client.",
      },
      transactionType: {
        type: "string",
        enum: ["amount_given", "amount_received"],
        description: "Type of transaction.",
      },
      amount: {
        type: "number",
        description: "Transaction amount.",
      },
      givenDate: {
        type: "string",
        format: "date-time",
        description: "Date when the transaction was given.",
      },
      interestPercent: {
        type: "number",
        description: "Interest percentage for the transaction.",
      },
      interestDueDate: {
        type: "string",
        format: "date-time",
        description: "Due date for the interest.",
      },
      description: {
        type: "string",
        description: "Description of the transaction.",
      },
      txid: {
        type: "string",
        description: "Transaction ID.",
      },
      status: {
        type: "string",
        description: "Status of the transaction.",
      },
      balanceAfter: {
        type: "number",
        description: "Balance after the transaction.",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the transaction was created.",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the transaction was last updated.",
      },
    },
  },
  LoanInterestStatus: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "Unique identifier for the interest status.",
      },
      clientId: {
        type: "integer",
        description: "ID of the associated loan client.",
      },
      year: {
        type: "integer",
        description: "Year of the interest status.",
      },
      month: {
        type: "integer",
        description: "Month of the interest status.",
      },
      status: {
        type: "string",
        description: "Status of the interest.",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the interest status was created.",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the interest status was last updated.",
      },
    },
  },
  // Add additional reusable schemas as needed
};

// Define Swagger options with dynamic route inclusion
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "NinjaPay API",
      version: "1.0.0",
      description: "API documentation for NinjaPay platform",
      contact: {
        name: "NinjaPay Team",
        email: "dev@ninjapay.me",
      },
    },
    servers: [
      {
        url: "http://localhost:3000", // Replace with your server URL
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: reusableSchemas,
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Payments",
        description: "Payment processing endpoints",
      },
      {
        name: "LoanPlugin",
        description: "Endpoints for managing loan companies, clients, and transactions",
      },
      {
        name: "KhataPlugin",
        description: "Endpoints for managing Khata companies, parties, and transactions",
      },
      // Add additional tags as needed
    ],
  },
  apis: [
    // eslint-disable-next-line no-undef
    path.join(__dirname, "routes", "**", "*.js"), // Main application routes
    ...getPluginRoutePaths(), // Plugin routes
  ],
};

// Generate Swagger specifications
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpecs;
