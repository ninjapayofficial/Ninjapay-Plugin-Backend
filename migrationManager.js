// migrationManager.js

const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const fs = require('fs');


async function runCoreMigrations(sequelize) {
  const umzug = new Umzug({
    migrations: {
      glob: path.join(__dirname, 'migrations/*.js'),
    },
    context: sequelize, // Pass the Sequelize instance
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  await umzug.up();
  console.log('Core migrations have been run.');
}

async function runPluginMigrations(sequelize, pluginName) {
  const pluginMigrationsPath = path.join(__dirname, 'plugins', pluginName, 'migrations');

  if (fs.existsSync(pluginMigrationsPath)) {
    const umzug = new Umzug({
      migrations: {
        glob: path.join(pluginMigrationsPath, '*.js'),
      },
      context: sequelize, // Pass the Sequelize instance
      storage: new SequelizeStorage({
        sequelize,
        modelName: `SequelizeMeta_${pluginName}`, // Use modelName instead of tableName
      }),
      logger: console,
    });

    await umzug.up();
    console.log(`Migrations for plugin '${pluginName}' have been run.`);
  } else {
    console.log(`No migrations found for plugin '${pluginName}'.`);
  }
}



  

async function rollbackPluginMigrations(sequelize, pluginName) {
    const pluginMigrationsPath = path.join(__dirname, 'plugins', pluginName, 'migrations');
  
    if (fs.existsSync(pluginMigrationsPath)) {
      const umzug = new Umzug({
        migrations: {
          glob: path.join(pluginMigrationsPath, '*.js'),
        },
        context: sequelize, // Pass the Sequelize instance
        storage: new SequelizeStorage({
          sequelize,
          modelName: `SequelizeMeta_${pluginName}`,
        }),
        logger: console,
      });
  
      // Run down migrations
      await umzug.down({ to: 0 });
      console.log(`Rolled back migrations for plugin '${pluginName}'.`);
    } else {
      console.log(`No migrations found for plugin '${pluginName}'.`);
    }
  }
  
  module.exports = {
    runCoreMigrations,
    runPluginMigrations,
    rollbackPluginMigrations,
  };
  


