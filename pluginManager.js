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
  loadPlugin, // Export the new function
};

async function installPlugin(repoUrl) {
  try {
    const pluginName = repoUrl.split('/').pop().replace('.git', '');
    const pluginPath = path.join(pluginsDir, pluginName);

    // Clone the plugin repository
    await simpleGit().clone(repoUrl, pluginPath);
    console.log(`Cloned ${pluginName} into plugins directory.`);

    // Install plugin dependencies
    await installDependencies(pluginPath);

    console.log(`Installed dependencies for ${pluginName}.`);
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

function loadPlugins(app) {
  fs.readdirSync(pluginsDir).forEach((folder) => {
    const pluginPath = path.join(pluginsDir, folder);
    const pluginMainFile = path.join(pluginPath, 'index.js');

    if (fs.existsSync(pluginMainFile)) {
      const plugin = require(pluginMainFile);
      if (typeof plugin.init === 'function') {
        plugin.init(app);
        console.log(`Loaded plugin: ${folder}`);
      } else {
        console.warn(`Plugin ${folder} does not export an init function.`);
      }
    } else {
      console.warn(`No index.js found in ${folder}.`);
    }
  });
}

function loadPlugin(app, pluginName) {
    const pluginPath = path.join(pluginsDir, pluginName);
    const pluginMainFile = path.join(pluginPath, 'index.js');
  
    if (fs.existsSync(pluginMainFile)) {
      // Clear the require cache to ensure the latest version is loaded
      delete require.cache[require.resolve(pluginMainFile)];
  
      const plugin = require(pluginMainFile);
      if (typeof plugin.init === 'function') {
        plugin.init(app);
        console.log(`Loaded plugin: ${pluginName}`);
      } else {
        console.warn(`Plugin ${pluginName} does not export an init function.`);
      }
    } else {
      console.warn(`No index.js found in ${pluginName}.`);
    }
  }
