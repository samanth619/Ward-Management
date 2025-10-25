'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'staff', 'read_only'),
        allowNull: false,
        defaultValue: 'staff'
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      profile_picture: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      employee_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      designation: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      join_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique indexes
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['employee_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};