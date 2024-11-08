// pluginManager.js
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const pluginsDir = path.join(__dirname, 'plugins');
const { ESLint } = require('eslint');
const { runPluginMigrations } = require('./migrationManager');
const { rollbackPluginMigrations } = require('./migrationManager');

// Ensure the plugins directory exists
if (!fs.existsSync(pluginsDir)) {
  fs.mkdirSync(pluginsDir);
}

module.exports = {
  installPlugin,
  loadPlugins,
  loadPlugin,
  uninstallPlugin,
};

async function installPlugin(repoUrl, app, sequelize, invoiceKey) {
  try {
    const pluginName = repoUrl.split('/').pop().replace('.git', '');
    const pluginPath = path.join(pluginsDir, pluginName);

    // Clone the plugin repository
    await simpleGit().clone(repoUrl, pluginPath);
    console.log(`Cloned ${pluginName} into plugins directory.`);

    // Perform static code analysis
    await performStaticAnalysis(pluginPath);

    // Install plugin dependencies
    await installDependencies(pluginPath);

    console.log(`Installed dependencies for ${pluginName}.`);

    // Run plugin migrations
    await runPluginMigrations(sequelize, pluginName);

    // Load the plugin into the application
    await loadPlugin(app, sequelize, pluginName, invoiceKey);
  } catch (err) {
    console.error('Error installing plugin:', err);
    throw err;
  }
}


function installDependencies(pluginPath) {
  return new Promise((resolve, reject) => {
    exec('npm install', { cwd: pluginPath }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error installing dependencies: ${stderr}`);
        reject(error);
      } else {
        console.log(`Dependencies installed: ${stdout}`);
        resolve();
      }
    });
  });
}

async function loadPlugin(app, sequelize, pluginName, invoiceKey) {
  try {
    const pluginPath = path.join(pluginsDir, pluginName);
    const pluginMainFile = path.join(pluginPath, 'index.js');

    if (fs.existsSync(pluginMainFile)) {
      delete require.cache[require.resolve(pluginMainFile)];

      // Run plugin migrations
      await runPluginMigrations(sequelize, pluginName);

      const plugin = require(pluginMainFile);
      if (typeof plugin.init === 'function') {
        // Pass 'app' if not using routers per plugin
        // Pass 'pluginName' if using routers per plugin
        // await plugin.init(app, sequelize, invoiceKey, pluginName);
        await plugin.init(app, sequelize, invoiceKey); // No longer passing pluginName
        console.log(`Loaded plugin: ${pluginName}`);
      } else {
        console.warn(`Plugin ${pluginName} does not export an init function.`);
      }
    } else {
      console.warn(`No index.js found in ${pluginName}.`);
    }
  } catch (error) {
    console.error(`Error loading plugin ${pluginName}:`, error);
  }
}

async function loadPlugins(app, sequelize, invoiceKey) {
  const pluginFolders = fs.readdirSync(pluginsDir);
  for (const folder of pluginFolders) {
    await loadPlugin(app, sequelize, folder, invoiceKey);
  }
}



// async function uninstallPlugin(pluginName) {
//   const pluginPath = path.join(pluginsDir, pluginName);

//   if (fs.existsSync(pluginPath)) {
//     // // Run down migrations
//     // await rollbackPluginMigrations(sequelize, pluginName);
//     // Remove the plugin directory
//     fs.rmSync(pluginPath, { recursive: true, force: true });
//     console.log(`Uninstalled plugin: ${pluginName}`);

//     // Remove plugin routes (optional)
//     // Note: Express does not provide a straightforward way to remove routes.
//     // You may need to implement a solution to reload the app without the plugin.

//   } else {
//     console.error(`Plugin ${pluginName} is not installed.`);
//     throw new Error(`Plugin ${pluginName} is not installed.`);
//   }
// }


// pluginManager.js

async function uninstallPlugin(pluginName, sequelize) {
  const pluginPath = path.join(pluginsDir, pluginName);

  if (fs.existsSync(pluginPath)) {
    
    // // Run down migrations
    // await rollbackPluginMigrations(sequelize, pluginName);

    // Remove the plugin directory
    fs.rmSync(pluginPath, { recursive: true, force: true });
    console.log(`Uninstalled plugin: ${pluginName}`);

//     // Remove plugin routes (optional)
//     // Note: Express does not provide a straightforward way to remove routes.
//     // You may need to implement a solution to reload the app without the plugin.

  } else {
    console.error(`Plugin ${pluginName} is not installed.`);
    throw new Error(`Plugin ${pluginName} is not installed.`);
  }
}






function reloadPlugins(app, sequelize) {
  // Clear all existing routes (not trivial in Express)
  // For simplicity, we'll restart the server after uninstalling a plugin.

  // Reload all plugins
  loadPlugins(app, sequelize);
}

module.exports.reloadPlugins = reloadPlugins;


// Security
async function performStaticAnalysis(pluginPath) {
  const eslint = new ESLint({});

  // Analyze all .js files in the plugin directory
  const results = await eslint.lintFiles([`${pluginPath}/**/*.js`]);

  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);

  // Check if there are any errors with severity 2
  const hasErrors = results.some(result => result.errorCount > 0);

  if (hasErrors) {
    console.error(`Static analysis failed:\n${resultText}`);
    throw new Error('Static analysis failed.');
  } else {
    console.log('Static analysis passed.');
  }
}

