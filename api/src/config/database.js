const { Sequelize } = require('sequelize');
const { initializeDatabase, checkPostgreSQLServer } = require('./dbInit');
require('dotenv').config();

// Database configuration
const config = {
  development: {
    database: process.env.DB_NAME || 'ward_management_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    database: process.env.DB_NAME_TEST || 'ward_management_test',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
  },
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize sequelize instance with automatic database creation
let sequelize = null;

/**
 * Get or create the Sequelize instance with automatic database initialization
 */
async function getSequelizeInstance() {
  if (!sequelize) {
    try {
      sequelize = await initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize database:', error.message);
      throw error;
    }
  }
  return sequelize;
}

// Create a proxy to maintain backward compatibility
const sequelizeProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'authenticate' || prop === 'sync' || prop === 'close' || prop === 'query') {
      return async (...args) => {
        const instance = await getSequelizeInstance();
        return instance[prop](...args);
      };
    }
    if (prop === 'define' || prop === 'model' || prop === 'models') {
      return (...args) => {
        if (!sequelize) {
          throw new Error('Database not initialized. Call getSequelizeInstance() first.');
        }
        return sequelize[prop](...args);
      };
    }
    return target[prop];
  }
});

// Test the connection with automatic database creation
const testConnection = async () => {
  try {
    // First check if PostgreSQL server is running
    const serverRunning = await checkPostgreSQLServer();
    if (!serverRunning) {
      return false;
    }

    // Initialize database and test connection
    const instance = await getSequelizeInstance();
    await instance.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
};

module.exports = { 
  sequelize: sequelizeProxy, 
  Sequelize,
  testConnection,
  config,
  getSequelizeInstance
};