

---

## **1. Ninjapay Plugin Backend - README.md**

```markdown
# Ninjapay Plugin Backend

Ninjapay is a modular plugin-based backend system that allows developers to extend its functionality by creating custom plugins. This repository serves as the main application, providing the core infrastructure for plugin management, authentication, and database interactions.

---

## **Table of Contents**

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Plugin Management](#plugin-management)
  - [Installing Plugins](#installing-plugins)
  - [Removing Plugins](#removing-plugins)
  - [Developing Plugins](#developing-plugins)
    - [Plugin Structure](#plugin-structure)
    - [Sequelize Version Compatibility](#sequelize-version-compatibility)
    - [Security Considerations](#security-considerations)
- [Authentication](#authentication)
- [Database Migrations](#database-migrations)
- [API Documentation](#api-documentation)
- [License](#license)
- [Contributing](#contributing)
- [Support](#support)

---

## **Features**

- **Plugin-Based Architecture**: Easily extend the application's functionality by adding or developing plugins.
- **User Authentication**: Secure user authentication using Firebase Auth and session cookies.
- **Database Integration**: Uses PostgreSQL with Sequelize ORM for database operations.
- **Dynamic Plugin Loading**: Install, load, and unload plugins at runtime without restarting the server.
- **RESTful API**: Exposes APIs for plugin management and interactions.
- **Swagger UI**: Provides API documentation via Swagger UI.

---

## **Getting Started**

### **Prerequisites**

- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher
- **PostgreSQL**: Version 10.x or higher
- **Firebase Account**: For authentication and Firestore
- **Git**: For cloning repositories

### **Installation**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/ninjapay-plugin-backend.git
   cd ninjapay-plugin-backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Install Global Packages**

   Install Sequelize CLI and other global dependencies if required.

   ```bash
   npm install -g sequelize-cli
   ```

### **Configuration**

1. **Environment Variables**

   Create a `.env` file in the root directory and add the following variables:

   ```ini
   PORT=3000
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_DIALECT=postgres
   DB_SSL=false
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   ```

   Ensure you replace the placeholders with your actual database and Firebase credentials.

2. **Firebase Setup**

   - Navigate to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project or use an existing one.
   - Enable **Email/Password** authentication in the **Authentication** section.
   - Create a new **Web App** to obtain your Firebase configuration.

3. **Firebase Service Account Key**

   - Generate a private key file for your service account.
   - Set the `FIREBASE_PRIVATE_KEY` in your `.env` file (ensure newlines are properly formatted).

---

## **Running the Application**

Start the server using:

```bash
npm start
```

The application will run on the port specified in your `.env` file (default is `3000`).

---

## **Plugin Management**

### **Installing Plugins**

Plugins can be installed dynamically via the application interface or API.

#### **Via Application Interface**

1. **Access the Plugin Manager**

   Navigate to `http://localhost:3000/` to access the plugin manager interface.

2. **Install a Plugin**

   - Enter the Git repository URL of the plugin.
   - Click on **Install Plugin**.

#### **Via API**

Make a `POST` request to `/install-plugin` with the repository URL.

```bash
curl -X POST http://localhost:3000/install-plugin \
  -H 'Content-Type: application/json' \
  -d '{"repoUrl": "https://github.com/username/plugin-repo.git"}'
```

### **Removing Plugins**

Plugins can be removed via the application interface or API.

#### **Via Application Interface**

- Click on the **Remove** button next to the plugin you wish to uninstall.

#### **Via API**

Make a `POST` request to `/remove-plugin` with the plugin name.

```bash
curl -X POST http://localhost:3000/remove-plugin \
  -H 'Content-Type: application/json' \
  -d '{"pluginName": "plugin-folder-name"}'
```

### **Developing Plugins**

Developers can create custom plugins to extend the application's functionality.

#### **Plugin Structure**

Your plugin repository should have the following structure:

```
plugin-name/
├── index.js
├── package.json
├── migrations/
│   └── <timestamp>-your-migration-file.js
├── views/
│   └── index.html
└── ... other files
```

- **`index.js`**: The main entry point of the plugin.
- **`migrations/`**: Database migration files for the plugin.
- **`views/`**: Frontend files served by the plugin.

#### **Sequelize Version Compatibility**

- **Important**: Your plugin must use the **same version of Sequelize** as the main application to avoid conflicts.
- **Current Sequelize Version**: Check the `package.json` of the main application for the exact version.

#### **Plugin Initialization**

Your `index.js` should export an `init` function:

```javascript
module.exports = {
  init: async function (router, sequelize) {
    // Your plugin code here
  },
};
```

- **Parameters**:
  - `router`: An Express router instance to define routes.
  - `sequelize`: The Sequelize instance for database operations.

#### **Security Considerations**

- **Static Code Analysis**: Plugins undergo static code analysis using ESLint before installation.
- **Dependencies**: Avoid using outdated or vulnerable dependencies.
- **Authentication**: Use the provided `authMiddleware` for route protection.

---

## **Authentication**

- Uses **Firebase Authentication** with **Email/Password** sign-in.
- Session management is handled via **secure HTTP-only cookies**.
- **Routes**:
  - `/signup`: User registration page.
  - `/login`: User login page.
  - `/auth/sessionLogin`: Endpoint to create a session cookie.
  - `/auth/sessionLogout`: Endpoint to clear the session.

---

## **Database Migrations**

- Uses **Umzug** for migration management.
- **Core Migrations**: Located in `migrations/`.
- **Plugin Migrations**: Each plugin can have its own migrations in `plugins/plugin-name/migrations/`.

---

## **API Documentation**

- API documentation is available via **Swagger UI**.
- Access it at `http://localhost:3000/api-docs`.

---

## **License**

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## **Contributing**

Contributions are welcome! Please open issues and pull requests for any features or fixes.

---

## **Support**

If you have any questions or need assistance, please open an issue on GitHub.

---


