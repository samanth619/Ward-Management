'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notification_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      resident_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'residents',
          key: 'id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      notification_type: {
        type: Sequelize.ENUM('scheme_alert', 'document_reminder', 'appointment', 'event_notification', 'emergency_alert', 'birthday', 'renewal_reminder', 'payment_due', 'general_announcement'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      channel: {
        type: Sequelize.ENUM('sms', 'email', 'whatsapp', 'push_notification', 'voice_call', 'in_app'),
        allowNull: false
      },
      recipient_contact: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Phone/email based on channel'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'delivered', 'failed', 'read'),
        defaultValue: 'pending'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      failed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      failure_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      max_retries: {
        type: Sequelize.INTEGER,
        defaultValue: 3
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'For scheduled notifications'
      },
      template_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Notification template identifier'
      },
      template_variables: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Variables used in template'
      },
      reference_type: {
        type: Sequelize.ENUM('scheme', 'event', 'conversation', 'household', 'user', 'system'),
        allowNull: true
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of referenced entity'
      },
      batch_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'For bulk notifications'
      },
      cost: {
        type: Sequelize.DECIMAL(8, 4),
        allowNull: true,
        comment: 'Cost of notification (for SMS/calls)'
      },
      provider: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Service provider used'
      },
      provider_response: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Response from service provider'
      },
      tracking_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Provider specific tracking ID'
      },
      language: {
        type: Sequelize.STRING(10),
        defaultValue: 'en',
        comment: 'Language of notification'
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'File attachments (for email)'
      },
      callback_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Webhook URL for delivery confirmation'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional metadata'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiry time for notification'
      },
      is_bulk: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      bulk_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Number of recipients in bulk send'
      },
      campaign_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Marketing campaign identifier'
      },
      opt_out_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      opt_out_link: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      personalization_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Personal data used for customization'
      },
      a_b_test_variant: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'A/B testing variant'
      },
      geolocation: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Location based targeting'
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Device information for push notifications'
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
    await queryInterface.addIndex('notification_logs', ['resident_id']);
    await queryInterface.addIndex('notification_logs', ['user_id']);
    await queryInterface.addIndex('notification_logs', ['notification_type']);
    await queryInterface.addIndex('notification_logs', ['channel']);
    await queryInterface.addIndex('notification_logs', ['status']);
    await queryInterface.addIndex('notification_logs', ['priority']);
    await queryInterface.addIndex('notification_logs', ['sent_at']);
    await queryInterface.addIndex('notification_logs', ['batch_id']);
    await queryInterface.addIndex('notification_logs', ['reference_type', 'reference_id']);
    await queryInterface.addIndex('notification_logs', ['scheduled_at']);
    await queryInterface.addIndex('notification_logs', ['tracking_id']);
    await queryInterface.addIndex('notification_logs', ['campaign_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notification_logs');
  }
};