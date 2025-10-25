'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ward_secretariats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ward_number: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      ward_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      secretariat_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      secretariat_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      area_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      total_population: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      total_households: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      male_population: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      female_population: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      other_population: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      secretary_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      secretary_phone: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      secretary_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      assistant_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      assistant_phone: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      office_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      office_hours: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      services_offered: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of services offered at this secretariat'
      },
      gps_coordinates: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pincode: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      establishment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
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
    await queryInterface.addIndex('ward_secretariats', ['ward_number']);
    await queryInterface.addIndex('ward_secretariats', ['secretariat_code']);
    await queryInterface.addIndex('ward_secretariats', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ward_secretariats');
  }
};