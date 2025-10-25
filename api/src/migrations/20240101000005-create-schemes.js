'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schemes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      scheme_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      scheme_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      scheme_type: {
        type: Sequelize.ENUM('central', 'state', 'local', 'private'),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('health', 'education', 'employment', 'housing', 'pension', 'welfare', 'agriculture', 'business', 'insurance', 'others'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      objective: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      target_beneficiaries: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Target groups for the scheme'
      },
      eligibility_criteria: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Detailed eligibility criteria'
      },
      required_documents: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'List of required documents'
      },
      benefit_type: {
        type: Sequelize.ENUM('monetary', 'non_monetary', 'service', 'subsidy', 'loan'),
        allowNull: false
      },
      benefit_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      benefit_details: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Detailed benefit information'
      },
      application_start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      application_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      application_deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      scheme_launch_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      scheme_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_ongoing: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      application_mode: {
        type: Sequelize.ENUM('online', 'offline', 'both'),
        defaultValue: 'both'
      },
      implementing_agency: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      funding_agency: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      budget_allocated: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      budget_utilized: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      max_beneficiaries: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      current_beneficiaries: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      age_limit_min: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      age_limit_max: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      gender_specific: {
        type: Sequelize.ENUM('male', 'female', 'other', 'all'),
        defaultValue: 'all'
      },
      income_limit_min: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      income_limit_max: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      caste_specific: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Specific caste categories eligible'
      },
      priority_categories: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Priority groups like BPL, women, elderly etc'
      },
      geographical_coverage: {
        type: Sequelize.ENUM('national', 'state', 'district', 'block', 'ward'),
        defaultValue: 'ward'
      },
      contact_office: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      contact_person: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      contact_phone: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      website_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      application_portal: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Online application portal URL'
      },
      is_online_application: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      processing_time: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Expected processing time for applications'
      },
      renewal_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      renewal_frequency: {
        type: Sequelize.ENUM('monthly', 'quarterly', 'half_yearly', 'yearly'),
        allowNull: true
      },
      auto_renewal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      scheme_guidelines: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      application_procedure: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      selection_criteria: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      monitoring_mechanism: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      success_metrics: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'KPIs and success measurement criteria'
      },
      grievance_mechanism: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      scheme_notification: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Official notification/gazette reference'
      },
      amendment_history: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'History of scheme amendments'
      },
      related_schemes: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Related or complementary schemes'
      },
      exclusion_criteria: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Conditions that disqualify applicants'
      },
      verification_process: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approval_hierarchy: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Approval workflow and authorities'
      },
      disbursement_mechanism: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      performance_indicators: {
        type: Sequelize.JSON,
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
    await queryInterface.addIndex('schemes', ['scheme_code']);
    await queryInterface.addIndex('schemes', ['scheme_type']);
    await queryInterface.addIndex('schemes', ['category']);
    await queryInterface.addIndex('schemes', ['is_active']);
    await queryInterface.addIndex('schemes', ['is_ongoing']);
    await queryInterface.addIndex('schemes', ['application_start_date']);
    await queryInterface.addIndex('schemes', ['application_end_date']);
    await queryInterface.addIndex('schemes', ['benefit_type']);
    await queryInterface.addIndex('schemes', ['geographical_coverage']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('schemes');
  }
};