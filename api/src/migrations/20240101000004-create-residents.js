'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('residents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      household_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'households',
          key: 'id'
        }
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      middle_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      relation_to_head: {
        type: Sequelize.ENUM('head', 'spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'other'),
        allowNull: false
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      marital_status: {
        type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
        allowNull: true
      },
      education_level: {
        type: Sequelize.ENUM('illiterate', 'primary', 'secondary', 'higher_secondary', 'graduate', 'post_graduate', 'professional'),
        allowNull: true
      },
      occupation: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      monthly_income: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      aadhaar_number: {
        type: Sequelize.STRING(12),
        allowNull: true,
        unique: true
      },
      voter_id: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      pan_number: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      driving_license: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      passport_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      bank_account_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      bank_ifsc: {
        type: Sequelize.STRING(11),
        allowNull: true
      },
      bank_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      mobile_number: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      blood_group: {
        type: Sequelize.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        allowNull: true
      },
      chronic_conditions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of chronic health conditions'
      },
      disabilities: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of disability information'
      },
      is_senior_citizen: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      emergency_contact_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      emergency_contact_phone: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      emergency_contact_relation: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      photo_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      fingerprint_data: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      biometric_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      kyc_status: {
        type: Sequelize.ENUM('pending', 'partial', 'complete', 'rejected'),
        defaultValue: 'pending'
      },
      kyc_completion_date: {
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
      data_entry_source: {
        type: Sequelize.ENUM('manual', 'survey', 'online', 'mobile_app'),
        defaultValue: 'manual'
      },
      mother_tongue: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      religion: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      caste_category: {
        type: Sequelize.ENUM('general', 'obc', 'sc', 'st', 'others'),
        allowNull: true
      },
      minority_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      bpl_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      priority_household: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_deceased: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      need_employment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether the resident needs employment assistance'
      },
      employment_type_needed: {
        type: Sequelize.ENUM('skilled', 'unskilled', 'professional', 'business'),
        allowNull: true
      },
      skills: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of skills possessed by the resident'
      },
      arogyasri_card_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Telangana State Health Insurance Card Number'
      },
      health_insurance_details: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Other health insurance information'
      },
      is_shg_member: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether the resident is part of Self Help Group'
      },
      shg_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Name of the Self Help Group'
      },
      shg_role: {
        type: Sequelize.ENUM('member', 'leader', 'treasurer', 'secretary'),
        allowNull: true
      },
      shg_joining_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      qualification_details: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Detailed educational qualifications and certifications'
      },
      training_received: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Skills training and professional development received'
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
    await queryInterface.addIndex('residents', ['household_id']);
    await queryInterface.addIndex('residents', ['aadhaar_number']);
    await queryInterface.addIndex('residents', ['voter_id']);
    await queryInterface.addIndex('residents', ['pan_number']);
    await queryInterface.addIndex('residents', ['mobile_number']);
    await queryInterface.addIndex('residents', ['is_senior_citizen']);
    await queryInterface.addIndex('residents', ['kyc_status']);
    await queryInterface.addIndex('residents', ['is_active']);
    await queryInterface.addIndex('residents', ['date_of_birth']);
    await queryInterface.addIndex('residents', ['gender']);
    await queryInterface.addIndex('residents', ['need_employment']);
    await queryInterface.addIndex('residents', ['arogyasri_card_number']);
    await queryInterface.addIndex('residents', ['is_shg_member']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('residents');
  }
};