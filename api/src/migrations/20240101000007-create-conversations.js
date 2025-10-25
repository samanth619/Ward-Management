'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversations', {
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
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      conversation_type: {
        type: Sequelize.ENUM('inquiry', 'complaint', 'application', 'follow_up', 'survey', 'emergency'),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'pending', 'resolved', 'closed'),
        defaultValue: 'open'
      },
      channel: {
        type: Sequelize.ENUM('in_person', 'phone', 'email', 'whatsapp', 'sms', 'online'),
        allowNull: false
      },
      conversation_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('health', 'education', 'employment', 'housing', 'pension', 'welfare', 'documents', 'grievance', 'others'),
        allowNull: true
      },
      sub_category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      resolution: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resolution_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      follow_up_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      follow_up_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      follow_up_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      satisfaction_rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Rating from 1-5'
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'File attachments related to conversation'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tags for categorization'
      },
      escalation_level: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Number of escalations'
      },
      escalated_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      escalation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estimated_resolution_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Estimated resolution time in hours'
      },
      actual_resolution_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Actual resolution time in hours'
      },
      communication_log: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Log of all communications'
      },
      reference_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      related_schemes: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Related government schemes discussed'
      },
      action_items: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Action items and their status'
      },
      is_confidential: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.addIndex('conversations', ['resident_id']);
    await queryInterface.addIndex('conversations', ['user_id']);
    await queryInterface.addIndex('conversations', ['conversation_type']);
    await queryInterface.addIndex('conversations', ['status']);
    await queryInterface.addIndex('conversations', ['priority']);
    await queryInterface.addIndex('conversations', ['conversation_date']);
    await queryInterface.addIndex('conversations', ['reference_number']);
    await queryInterface.addIndex('conversations', ['category']);
    await queryInterface.addIndex('conversations', ['assigned_to']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conversations');
  }
};