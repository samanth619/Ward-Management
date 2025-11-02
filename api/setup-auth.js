#!/usr/bin/env node

/**
 * Ward Management System - Setup Script
 * This script helps set up the authentication system and create initial admin user
 */

const bcrypt = require('bcryptjs');
const { getSequelizeInstance } = require('./src/config/database');
const { generateEmailVerificationToken } = require('./src/utils/jwt');
require('dotenv').config();

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const setupAuthSystem = async () => {
  let sequelize;
  try {
    console.log('🚀 Ward Management System - Authentication Setup\n');

    // Initialize database connection
    console.log('📊 Initializing database connection...');
    sequelize = await getSequelizeInstance();
    console.log('✅ Database connection established successfully.\n');

    // Sync database models
    console.log('🔄 Synchronizing database models...');
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized successfully.\n');

    // Get User model after database is initialized
    const models = require('./src/models');
    const { User } = models;

    // Check if admin user exists
    const existingAdmin = await User.findOne({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Created: ${existingAdmin.created_at}\n`);

      const createAnother = await question('Do you want to create another admin user? (y/N): ');
      if (createAnother.toLowerCase() !== 'y' && createAnother.toLowerCase() !== 'yes') {
        console.log('👋 Setup completed. Existing admin user found.\n');
        rl.close();
        return;
      }
    }

    console.log('👤 Creating admin user...\n');

    // Get admin user details
    let name, email, password;

    // Get name
    do {
      name = await question('Enter admin name: ');
      if (!name.trim()) {
        console.log('❌ Name cannot be empty. Please try again.\n');
      }
    } while (!name.trim());

    // Get email
    do {
      email = await question('Enter admin email: ');
      if (!validateEmail(email)) {
        console.log('❌ Please enter a valid email address.\n');
        continue;
      }

      // Check if email already exists
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        console.log('❌ A user with this email already exists. Please try another email.\n');
        email = '';
      }
    } while (!email);

    // Get password
    do {
      password = await question('Enter admin password (min 8 chars, include uppercase, lowercase, number, special char): ');
      if (!validatePassword(password)) {
        console.log('❌ Password must be at least 8 characters and include:');
        console.log('   - At least one uppercase letter (A-Z)');
        console.log('   - At least one lowercase letter (a-z)');
        console.log('   - At least one number (0-9)');
        console.log('   - At least one special character (@$!%*?&)\n');
      }
    } while (!validatePassword(password));

    const confirmPassword = await question('Confirm admin password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match. Exiting setup.\n');
      rl.close();
      return;
    }

    // Create admin user
    console.log('\n🔐 Creating admin user...');

    const adminUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: 'admin',
      is_active: true,
      email_verified: true, // Auto-verify admin
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📧 Admin User Details:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Created: ${adminUser.created_at}\n`);

    // Test JWT token generation
    console.log('🔑 Testing JWT token generation...');
    const { createTokenResponse } = require('./src/utils/jwt');
    const tokens = createTokenResponse(adminUser);
    console.log('✅ JWT tokens generated successfully!\n');

    console.log('🎉 Authentication system setup completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Copy .env.example to .env and configure your environment variables');
    console.log('   2. Ensure JWT_SECRET is set to a secure random string');
    console.log('   3. Start the server with: npm run dev');
    console.log('   4. Test the API endpoints using the documentation in docs/AUTH_API.md\n');

    console.log('🔐 You can now login with:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: [the password you just entered]\n`);

    rl.close();
    if (sequelize) {
      await sequelize.close();
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n💡 Database connection failed. Please check:');
      console.log('   - Database server is running');
      console.log('   - Database credentials in .env file');
      console.log('   - Database exists and is accessible\n');
    } else if (error.name === 'SequelizeValidationError') {
      console.log('\n💡 Validation error:');
      error.errors.forEach(err => {
        console.log(`   - ${err.path}: ${err.message}`);
      });
      console.log('');
    }
    rl.close();
    if (sequelize) {
      await sequelize.close();
    }
    process.exit(1);
  }
};

// Environment check
const checkEnvironment = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASS'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('⚠️  Warning: Missing environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n💡 Please create a .env file based on .env.example\n');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.log('⚠️  Warning: JWT_SECRET should be at least 32 characters long for security.\n');
  }
};

// Main execution
if (require.main === module) {
  console.clear();
  checkEnvironment();
  setupAuthSystem();
}

module.exports = {
  setupAuthSystem,
  checkEnvironment
};