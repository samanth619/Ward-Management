'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('resident_bank_details', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      resident_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'residents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bank_account_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      bank_ifsc_code: {
        type: Sequelize.STRING(11),
        allowNull: true
      },
      bank_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      bank_branch: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      account_holder_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      account_type: {
        type: Sequelize.ENUM('savings', 'current', 'fixed_deposit', 'recurring_deposit', 'overdraft'),
        allowNull: true,
        defaultValue: 'savings'
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verification_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      verification_method: {
        type: Sequelize.ENUM('penny_drop', 'passbook', 'cheque', 'statement', 'manual'),
        allowNull: true
      },
      is_primary_account: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      joint_account_holders: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      upi_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      mobile_banking_registered: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      internet_banking_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    });

    // Add indexes
    await queryInterface.addIndex('resident_bank_details', ['resident_id']);
    await queryInterface.addIndex('resident_bank_details', ['bank_account_number']);
    await queryInterface.addIndex('resident_bank_details', ['bank_ifsc_code']);
    await queryInterface.addIndex('resident_bank_details', ['is_verified']);
    await queryInterface.addIndex('resident_bank_details', ['is_primary_account']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('resident_bank_details');
  }
};