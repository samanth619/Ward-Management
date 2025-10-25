'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('households', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      household_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      head_of_household_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      address_line1: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      address_line2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pincode: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      ward_secretariat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ward_secretariats',
          key: 'id'
        }
      },
      phone_primary: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      phone_secondary: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ration_card_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      ration_card_type: {
        type: Sequelize.ENUM('apl', 'bpl', 'aay', 'phh'),
        allowNull: true
      },
      electricity_connection: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      water_connection: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sewerage_connection: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      gas_connection: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      property_tax_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      property_type: {
        type: Sequelize.ENUM('owned', 'rented', 'leased', 'others'),
        allowNull: true
      },
      house_type: {
        type: Sequelize.ENUM('pucca', 'semi_pucca', 'kutcha', 'others'),
        allowNull: true
      },
      total_members: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      income_certificate: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      annual_income: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      verification_status: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
      },
      verification_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      verification_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      verification_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      gps_coordinates: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      photo_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      last_survey_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      surveyed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Add indexes
    await queryInterface.addIndex('households', ['household_id']);
    await queryInterface.addIndex('households', ['ward_secretariat_id']);
    await queryInterface.addIndex('households', ['verification_status']);
    await queryInterface.addIndex('households', ['pincode']);
    await queryInterface.addIndex('households', ['ration_card_number']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('households');
  }
};