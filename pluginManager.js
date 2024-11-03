// pluginManager.js
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const pluginsDir = path.join(__dirname, 'plugins');

// Ensure the plugins directory exists
if (!fs.existsSync(pluginsDir)) {
  fs.mkdirSync(pluginsDir);
}

module.exports = {
  installPlugin,
  loadPlugins,
  loadPlugin,
  uninstallPlugin, // Export the uninstallPlugin function
}

async function installPlugin(repoUrl, app, sequelize) {
  try {
    const pluginName = repoUrl.split('/').pop().replace('.git', '');
    const pluginPath = path.join(pluginsDir, pluginName);

    // Clone the plugin repository
    await simpleGit().clone(repoUrl, pluginPath);
    console.log(`Cloned ${pluginName} into plugins directory.`);

    // Install plugin dependencies
    await installDependencies(pluginPath);

    console.log(`Installed dependencies for ${pluginName}.`);

    // Load the plugin into the application
    loadPlugin(app, sequelize, pluginName);
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

function loadPlugin(app, sequelize, pluginName) {
  try {
    const pluginPath = path.join(pluginsDir, pluginName);
    const pluginMainFile = path.join(pluginPath, 'index.js'); // Looks for index.js in plugin root

    if (fs.existsSync(pluginMainFile)) {
      delete require.cache[require.resolve(pluginMainFile)];

      const plugin = require(pluginMainFile);
      if (typeof plugin.init === 'function') {
        plugin.init(app, sequelize);
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

function loadPlugins(app, sequelize) {
  fs.readdirSync(pluginsDir).forEach((folder) => {
    loadPlugin(app, sequelize, folder);
  });
}

function uninstallPlugin(pluginName) {
  const pluginPath = path.join(pluginsDir, pluginName);

  if (fs.existsSync(pluginPath)) {
    // Remove the plugin directory
    fs.rmSync(pluginPath, { recursive: true, force: true });
    console.log(`Uninstalled plugin: ${pluginName}`);

    // Remove plugin routes (optional)
    // Note: Express does not provide a straightforward way to remove routes.
    // You may need to implement a solution to reload the app without the plugin.

  } else {
    console.error(`Plugin ${pluginName} is not installed.`);
    throw new Error(`Plugin ${pluginName} is not installed.`);
  }
}

module.exports.uninstallPlugin = uninstallPlugin;



function reloadPlugins(app, sequelize) {
  // Clear all existing routes (not trivial in Express)
  // For simplicity, we'll restart the server after uninstalling a plugin.

  // Reload all plugins
  loadPlugins(app, sequelize);
}

module.exports.reloadPlugins = reloadPlugins;


