
---

## **. Lightning BTC Plugin - README.md**

```markdown
# Lightning BTC Plugin

<!-- Suggested code may be subject to a license. Learn more: ~LicenseLog:4175428709. -->
The Lightning BTC Plugin is a sample plugin for the Ninjapay Plugin Backend. It provides Lnbits integration for Lightning Network Bitcoin payment functionalities, including creating invoices, paying invoices, and viewing transaction history.

---

## **Table of Contents**

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Plugin Structure](#plugin-structure)
- [Routes and Endpoints](#routes-and-endpoints)
- [Database Migrations](#database-migrations)
- [Developing Your Own Plugin](#developing-your-own-plugin)
- [License](#license)
- [Contributing](#contributing)
- [Support](#support)

---

## **Overview**

This plugin serves as a reference implementation for building custom plugins for the Ninjapay Plugin Backend. It demonstrates how to integrate with external APIs, manage database migrations, and secure routes.

---

## **Features**

- **Create Lightning Invoices**: Generate payment requests for receiving Bitcoin payments.
- **Pay Lightning Invoices**: Pay invoices using the user's wallet.
- **View Transaction History**: Track incoming and outgoing payments.
- **Wallet Balance**: Check the current balance of the user's wallet.

---

## **Getting Started**

### **Installation**

Install the plugin via the Ninjapay Plugin Manager interface:

1. **Navigate to the Plugin Manager**

   Access `http://localhost:3000/` in your browser.

2. **Install the Plugin**

   - Enter the repository URL:

     ```plaintext
     https://github.com/yourusername/lightning-btc-plugin.git
     ```

   - Click **Install Plugin**.

### **Configuration**

- **LNbits Integration**

  - The plugin uses [LNbits](https://lnbits.com/) for Lightning Network interactions.
  - Update the API endpoints in `src/index.js` if you wish to use a different LNbits instance.

---

## **Plugin Structure**

```
lightning-btc-plugin/
├── index.js
├── package.json
├── migrations/
│   └── <timestamp>-create-transaction-table.js
├── views/
│   └── index.html
└── ... other files
```

- **`index.js`**: Main plugin file where routes and logic are defined.
- **`migrations/`**: Contains database migration files specific to the plugin.
- **`views/`**: Frontend files served by the plugin.

---

## **Routes and Endpoints**

- **Base URL**: `/plugins/lightning-btc-plugin`

### **Endpoints**

- `GET /`:
  - Serves the plugin's main interface.

- `POST /create-invoice`:
  - Creates a new Lightning invoice.
  - **Request Body**:
    - `amount` (number): Amount in satoshis.
    - `memo` (string, optional): Description for the invoice.

- `POST /pay-invoice`:
  - Pays a Lightning invoice.
  - **Request Body**:
    - `bolt11` (string): The BOLT11 invoice string.

- `GET /transactions`:
  - Retrieves the transaction history for the authenticated user.

- `GET /balance`:
  - Retrieves the current wallet balance.

### **Authentication**

- All routes are protected by the `authMiddleware` to ensure only authenticated users can access them.

---

## **Database Migrations**

- Migration files are located in the `migrations/` directory.
- Migrations are run automatically when the plugin is loaded.
- **Important**: Ensure that your migration files are named uniquely to avoid conflicts.

---

## **Developing Your Own Plugin**

Use this plugin as a reference for building your own custom plugins.

### **Key Points**

- **Maintain Sequelize Version Compatibility**:
  - Use the same version of Sequelize as specified in the main application's `package.json`.
  - This ensures consistency and avoids potential conflicts.

- **Plugin Initialization Function**:
  - Export an `init` function from your `index.js`:

    ```javascript
    module.exports = {
      init: async function (router, sequelize) {
        // Your plugin code here
      },
    };
    ```

- **Route Definitions**:
  - Use the provided `router` to define your routes.
  - Apply the `authMiddleware` if route protection is needed.

- **Database Access**:
  - Use the provided `sequelize` instance for database operations.
  - Define your models and migrations carefully to avoid conflicts.

- **Static Assets and Views**:
  - Place your frontend files in the `views/` directory.
  - Serve them using `router.get()`.

---

## **License**

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## **Contributing**

Contributions are welcome! Feel free to fork the repository and submit pull requests.

---

## **Support**

If you have any questions or encounter issues, please open an issue on GitHub.

---

```

---
