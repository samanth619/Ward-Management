'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('scheme_enrollments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      resident_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'residents',
          key: 'id'
        }
      },
      scheme_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'schemes',
          key: 'id'
        }
      },
      application_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      application_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('applied', 'under_review', 'documents_pending', 'approved', 'rejected', 'on_hold', 'cancelled', 'completed'),
        defaultValue: 'applied'
      },
      applied_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Staff member who helped with application'
      },
      application_mode: {
        type: Sequelize.ENUM('online', 'offline', 'mobile'),
        defaultValue: 'offline'
      },
      documents_submitted: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'List of documents submitted with their status'
      },
      eligibility_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Calculated eligibility score out of 100'
      },
      priority_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Priority ranking score'
      },
      review_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      review_comments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approval_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approval_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Approved benefit amount'
      },
      rejection_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rejection_category: {
        type: Sequelize.ENUM('ineligible', 'incomplete_documents', 'duplicate_application', 'budget_exhausted', 'technical_issues', 'others'),
        allowNull: true
      },
      case_worker_assigned: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      follow_up_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      follow_up_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      follow_up_comments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      enrollment_start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      enrollment_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      benefit_start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      benefit_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_benefit_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last date when benefit was received'
      },
      total_benefits_received: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00,
        comment: 'Total amount of benefits received'
      },
      benefits_frequency: {
        type: Sequelize.ENUM('one_time', 'monthly', 'quarterly', 'annual'),
        allowNull: true
      },
      next_benefit_due: {
        type: Sequelize.DATE,
        allowNull: true
      },
      bank_account_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Account for benefit transfer'
      },
      bank_ifsc: {
        type: Sequelize.STRING(11),
        allowNull: true
      },
      payment_mode: {
        type: Sequelize.ENUM('bank_transfer', 'cash', 'cheque', 'digital_wallet', 'direct_benefit_transfer'),
        allowNull: true
      },
      beneficiary_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Unique beneficiary ID for the scheme'
      },
      card_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Scheme specific card number if applicable'
      },
      renewal_due_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      renewal_status: {
        type: Sequelize.ENUM('not_required', 'pending', 'renewed', 'expired'),
        defaultValue: 'not_required'
      },
      auto_renewal_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      compliance_status: {
        type: Sequelize.ENUM('compliant', 'non_compliant', 'under_review'),
        defaultValue: 'compliant'
      },
      audit_trail: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Detailed audit trail of all actions'
      },
      grievance_filed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      grievance_details: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Grievance information if any'
      },
      satisfaction_rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Beneficiary satisfaction rating 1-5'
      },
      satisfaction_feedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      scheme_exit_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      exit_reason: {
        type: Sequelize.ENUM('completed', 'ineligible', 'non_compliance', 'voluntary_exit', 'death', 'migration'),
        allowNull: true
      },
      verification_visits: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Record of verification visits'
      },
      monitoring_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Monitoring and evaluation data'
      },
      digital_signature: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      qr_code: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'QR code for quick access'
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
    await queryInterface.addIndex('scheme_enrollments', ['resident_id']);
    await queryInterface.addIndex('scheme_enrollments', ['scheme_id']);
    await queryInterface.addIndex('scheme_enrollments', ['application_number']);
    await queryInterface.addIndex('scheme_enrollments', ['status']);
    await queryInterface.addIndex('scheme_enrollments', ['application_date']);
    await queryInterface.addIndex('scheme_enrollments', ['beneficiary_id']);
    await queryInterface.addIndex('scheme_enrollments', ['renewal_due_date']);
    await queryInterface.addIndex('scheme_enrollments', ['compliance_status']);
    await queryInterface.addIndex('scheme_enrollments', ['is_active']);

    // Add composite indexes
    await queryInterface.addIndex('scheme_enrollments', ['resident_id', 'scheme_id'], {
      unique: true,
      name: 'unique_resident_scheme_enrollment'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('scheme_enrollments');
  }
};