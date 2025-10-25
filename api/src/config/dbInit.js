const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Database initialization utility
 * This module handles automatic database creation if it doesn't exist
 */

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    database: process.env.DB_NAME || 'ward_management_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  },
  test: {
    database: process.env.DB_NAME_TEST || 'ward_management_test',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  },
  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  }
};

const dbConfig = config[env];

/**
 * Create database if it doesn't exist
 * This function connects to PostgreSQL server and creates the database
 */
async function createDatabaseIfNotExists() {
  // Connect to PostgreSQL server (using 'postgres' database)
  const systemSequelize = new Sequelize('postgres', dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false // Suppress logs for system operations
  });

  try {
    console.log(`🔍 Checking if database '${dbConfig.database}' exists...`);
    
    // Test connection to PostgreSQL server
    await systemSequelize.authenticate();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const [results] = await systemSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`
    );

    if (results.length === 0) {
      // Database doesn't exist, create it
      console.log(`📁 Database '${dbConfig.database}' does not exist. Creating...`);
      
      await systemSequelize.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log(`✅ Database '${dbConfig.database}' created successfully`);
    } else {
      console.log(`✅ Database '${dbConfig.database}' already exists`);
    }

  } catch (error) {
    console.error('❌ Error during database creation:', error.message);
    throw error;
  } finally {
    // Close the system connection
    await systemSequelize.close();
  }
}

/**
 * Initialize database with automatic creation
 * Returns a configured Sequelize instance for the application database
 */
async function initializeDatabase() {
  try {
    // Step 1: Create database if it doesn't exist
    await createDatabaseIfNotExists();

    // Step 2: Create Sequelize instance for our application database
    const sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: env === 'development' ? console.log : false,
        pool: {
          max: env === 'production' ? 20 : 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true
        },
        dialectOptions: env === 'production' ? {
          ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        } : {}
      }
    );

    // Step 3: Test connection to application database
    await sequelize.authenticate();
    console.log(`✅ Connected to application database '${dbConfig.database}'`);

    return sequelize;

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

/**
 * Drop database (useful for testing)
 */
async function dropDatabase() {
  const systemSequelize = new Sequelize('postgres', dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false
  });

  try {
    await systemSequelize.authenticate();
    
    // Terminate existing connections to the database
    await systemSequelize.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${dbConfig.database}'
        AND pid <> pg_backend_pid()
    `);

    // Drop the database
    await systemSequelize.query(`DROP DATABASE IF EXISTS "${dbConfig.database}"`);
    console.log(`✅ Database '${dbConfig.database}' dropped successfully`);

  } catch (error) {
    console.error('❌ Error dropping database:', error.message);
    throw error;
  } finally {
    await systemSequelize.close();
  }
}

/**
 * Check if PostgreSQL server is running
 */
async function checkPostgreSQLServer() {
  const systemSequelize = new Sequelize('postgres', dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false
  });

  try {
    await systemSequelize.authenticate();
    console.log('✅ PostgreSQL server is running and accessible');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL server is not accessible:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔧 Please ensure PostgreSQL is installed and running:');
      console.error('   - macOS: brew services start postgresql');
      console.error('   - Ubuntu: sudo service postgresql start');
      console.error('   - Windows: Start PostgreSQL service from Services');
    } else if (error.code === '28P01') {
      console.error('🔐 Authentication failed. Please check your database credentials in .env file');
    }
    
    return false;
  } finally {
    await systemSequelize.close();
  }
}

module.exports = {
  initializeDatabase,
  createDatabaseIfNotExists,
  dropDatabase,
  checkPostgreSQLServer,
  config: dbConfig
};