'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_trails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      table_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      record_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      action: {
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS', 'EXPORT', 'IMPORT'),
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      user_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      user_role: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      old_values: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Previous values before change'
      },
      new_values: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'New values after change'
      },
      changed_fields: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'List of fields that were modified'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      session_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      request_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Unique request identifier'
      },
      route: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'API endpoint accessed'
      },
      method: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'HTTP method used'
      },
      query_parameters: {
        type: Sequelize.JSON,
        allowNull: true
      },
      request_body: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Request payload (sensitive data excluded)'
      },
      response_status: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      execution_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Request execution time in milliseconds'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      stack_trace: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      business_process: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Business process being performed'
      },
      compliance_flag: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Flag for compliance monitoring'
      },
      data_classification: {
        type: Sequelize.ENUM('public', 'internal', 'confidential', 'restricted'),
        defaultValue: 'internal'
      },
      privacy_level: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium'
      },
      retention_period: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Data retention period in days'
      },
      geolocation: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      device_fingerprint: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      risk_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Calculated risk score for the action'
      },
      anomaly_detected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      data_source: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Source system or application'
      },
      correlation_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'For tracking related events'
      },
      parent_audit_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'audit_trails',
          key: 'id'
        },
        comment: 'For hierarchical audit entries'
      },
      workflow_stage: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      approval_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approval_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      security_event: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      alert_triggered: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      notification_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      backup_reference: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Reference to backup before critical changes'
      },
      checksum: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Data integrity checksum'
      },
      additional_metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional context-specific metadata'
      },
      regulatory_flag: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Flag for regulatory compliance tracking'
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
    await queryInterface.addIndex('audit_trails', ['table_name']);
    await queryInterface.addIndex('audit_trails', ['record_id']);
    await queryInterface.addIndex('audit_trails', ['action']);
    await queryInterface.addIndex('audit_trails', ['user_id']);
    await queryInterface.addIndex('audit_trails', ['created_at']);
    await queryInterface.addIndex('audit_trails', ['ip_address']);
    await queryInterface.addIndex('audit_trails', ['session_id']);
    await queryInterface.addIndex('audit_trails', ['request_id']);
    await queryInterface.addIndex('audit_trails', ['business_process']);
    await queryInterface.addIndex('audit_trails', ['compliance_flag']);
    await queryInterface.addIndex('audit_trails', ['security_event']);
    await queryInterface.addIndex('audit_trails', ['correlation_id']);
    await queryInterface.addIndex('audit_trails', ['regulatory_flag']);

    // Add composite indexes
    await queryInterface.addIndex('audit_trails', ['table_name', 'record_id'], {
      name: 'idx_audit_table_record'
    });
    await queryInterface.addIndex('audit_trails', ['user_id', 'created_at'], {
      name: 'idx_audit_user_time'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_trails');
  }
};