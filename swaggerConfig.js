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
  // Add additional reusable schemas as needed
};

// Define Swagger options with dynamic route inclusion
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Ninjapay API",
      version: "1.0.0",
      description: "API documentation for Ninjapay platform",
      contact: {
        name: "Ninjapay Team",
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
