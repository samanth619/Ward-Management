const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotificationLog = sequelize.define('NotificationLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    notification_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Unique notification identification number'
    },
    resident_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'residents',
        key: 'id'
      },
      comment: 'Resident who received the notification'
    },
    household_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'households',
        key: 'id'
      },
      comment: 'Household that received the notification (if not specific to a resident)'
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id'
      },
      comment: 'Event this notification is about'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who sent the notification'
    },
    notification_type: {
      type: DataTypes.ENUM(
        'birthday', 'anniversary', 'festival', 'event_reminder',
        'appointment', 'meeting', 'alert', 'information', 'warning',
        'celebration', 'health_camp', 'vaccination', 'survey',
        'feedback_request', 'custom', 'bulk_message', 'urgent',
        'system_maintenance', 'policy_update', 'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    channel: {
      type: DataTypes.ENUM('sms', 'email', 'whatsapp', 'voice_call', 'push_notification', 'in_app'),
      allowNull: false,
      validate: {
        isIn: [['sms', 'email', 'whatsapp', 'voice_call', 'push_notification', 'in_app']]
      }
    },
    recipient_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: 'Phone number where SMS/WhatsApp was sent'
    },
    recipient_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Email address where email was sent'
    },
    recipient_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Name of the recipient'
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Subject line for email notifications'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    template_used: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Template name used for this notification'
    },
    personalization_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Data used to personalize the message'
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'rejected', 'bounced', 'read'),
      allowNull: false,
      defaultValue: 'pending'
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if sending failed'
    },
    error_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Error code from the service provider'
    },
    provider_message_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Message ID from SMS/Email service provider'
    },
    provider_response: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Full response from the service provider'
    },
    cost: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
      comment: 'Cost of sending this notification'
    },
    credits_used: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Number of credits used'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal'
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the notification was scheduled to be sent'
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of retry attempts'
    },
    max_retries: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      comment: 'Maximum number of retry attempts'
    },
    next_retry_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When to retry sending if failed'
    },
    is_bulk: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is part of a bulk notification'
    },
    bulk_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'ID to group bulk notifications together'
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
      comment: 'Language of the notification (en, hi, te, etc.)'
    },
    time_zone: {
      type: DataTypes.STRING(50),
      defaultValue: 'Asia/Kolkata',
      comment: 'Time zone of the recipient'
    },
    device_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Device type for push notifications'
    },
    campaign_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Marketing/Communication campaign ID'
    },
    tracking_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional tracking information'
    },
    unsubscribe_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Token for unsubscribe link'
    },
    is_test: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a test notification'
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'File attachments for email notifications'
    },
    click_tracking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether to track link clicks'
    },
    open_tracking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether to track email opens'
    },
    links_clicked: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of clicked links with timestamps'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional metadata for the notification'
    }
  }, {
    tableName: 'notification_logs',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['notification_id']
      },
      {
        fields: ['resident_id']
      },
      {
        fields: ['household_id']
      },
      {
        fields: ['event_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['notification_type']
      },
      {
        fields: ['channel']
      },
      {
        fields: ['status']
      },
      {
        fields: ['sent_at']
      },
      {
        fields: ['delivered_at']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['scheduled_at']
      },
      {
        fields: ['is_bulk']
      },
      {
        fields: ['bulk_id']
      },
      {
        fields: ['campaign_id']
      },
      {
        fields: ['is_test']
      },
      {
        fields: ['recipient_number']
      },
      {
        fields: ['recipient_email']
      }
    ],
    hooks: {
      beforeCreate: (notification) => {
        // Auto-generate notification_id if not provided
        if (!notification.notification_id) {
          const timestamp = Date.now().toString().slice(-6);
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          notification.notification_id = `NOTIF${timestamp}${random}`;
        }
      },
      afterUpdate: (notification) => {
        // Auto-set timestamps based on status changes
        if (notification.changed('status')) {
          const now = new Date();
          switch (notification.status) {
            case 'sent':
              if (!notification.sent_at) notification.sent_at = now;
              break;
            case 'delivered':
              if (!notification.delivered_at) notification.delivered_at = now;
              break;
            case 'read':
              if (!notification.read_at) notification.read_at = now;
              break;
            case 'failed':
              if (!notification.failed_at) notification.failed_at = now;
              break;
          }
        }
      }
    }
  });

  // Instance methods
  NotificationLog.prototype.markAsSent = async function(providerMessageId = null, providerResponse = null) {
    this.status = 'sent';
    this.sent_at = new Date();
    if (providerMessageId) this.provider_message_id = providerMessageId;
    if (providerResponse) this.provider_response = providerResponse;
    await this.save();
  };

  NotificationLog.prototype.markAsDelivered = async function(deliveredAt = null) {
    this.status = 'delivered';
    this.delivered_at = deliveredAt || new Date();
    await this.save();
  };

  NotificationLog.prototype.markAsRead = async function(readAt = null) {
    this.status = 'read';
    this.read_at = readAt || new Date();
    await this.save();
  };

  NotificationLog.prototype.markAsFailed = async function(errorMessage, errorCode = null) {
    this.status = 'failed';
    this.failed_at = new Date();
    this.error_message = errorMessage;
    if (errorCode) this.error_code = errorCode;
    
    // Schedule retry if under max retries
    if (this.retry_count < this.max_retries) {
      const retryDelay = Math.pow(2, this.retry_count) * 5; // Exponential backoff: 5, 10, 20 minutes
      this.next_retry_at = new Date(Date.now() + retryDelay * 60 * 1000);
      this.retry_count += 1;
    }
    
    await this.save();
  };

  NotificationLog.prototype.addLinkClick = async function(url, clickedAt = null) {
    const clicks = this.links_clicked || [];
    clicks.push({
      url,
      clicked_at: clickedAt || new Date(),
      user_agent: null // Can be added if needed
    });
    this.links_clicked = clicks;
    await this.save();
  };

  NotificationLog.prototype.shouldRetry = function() {
    return this.status === 'failed' && 
           this.retry_count < this.max_retries && 
           this.next_retry_at && 
           new Date() >= new Date(this.next_retry_at);
  };

  // Class methods
  NotificationLog.findByResident = function(residentId) {
    return this.findAll({
      where: { resident_id: residentId },
      order: [['sent_at', 'DESC']],
      include: ['resident', 'event', 'user']
    });
  };

  NotificationLog.findByHousehold = function(householdId) {
    return this.findAll({
      where: { household_id: householdId },
      order: [['sent_at', 'DESC']],
      include: ['household', 'event', 'user']
    });
  };

  NotificationLog.findByEvent = function(eventId) {
    return this.findAll({
      where: { event_id: eventId },
      order: [['sent_at', 'DESC']],
      include: ['resident', 'household', 'user']
    });
  };

  NotificationLog.findByStatus = function(status) {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  };

  NotificationLog.findByChannel = function(channel) {
    return this.findAll({
      where: { channel },
      order: [['sent_at', 'DESC']]
    });
  };

  NotificationLog.findPending = function() {
    return this.findAll({
      where: { status: 'pending' },
      order: [['priority', 'DESC'], ['scheduled_at', 'ASC']]
    });
  };

  NotificationLog.findFailedForRetry = function() {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        status: 'failed',
        retry_count: { [Op.lt]: sequelize.col('max_retries') },
        next_retry_at: { [Op.lte]: new Date() }
      },
      order: [['next_retry_at', 'ASC']]
    });
  };

  NotificationLog.findByBulkId = function(bulkId) {
    return this.findAll({
      where: { bulk_id: bulkId },
      order: [['created_at', 'ASC']]
    });
  };

  NotificationLog.findByCampaign = function(campaignId) {
    return this.findAll({
      where: { campaign_id: campaignId },
      order: [['sent_at', 'DESC']]
    });
  };

  NotificationLog.findByDateRange = function(startDate, endDate) {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        sent_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['sent_at', 'DESC']]
    });
  };

  NotificationLog.getDeliveryStats = async function(startDate, endDate) {
    const { Op } = sequelize.Sequelize;
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.sent_at = { [Op.between]: [startDate, endDate] };
    }

    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        'channel',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'total_cost']
      ],
      group: ['channel', 'status'],
      raw: true
    });

    return stats;
  };

  // Associations
  NotificationLog.associate = function(models) {
    // NotificationLog belongs to resident
    NotificationLog.belongsTo(models.Resident, {
      foreignKey: 'resident_id',
      as: 'resident'
    });

    // NotificationLog belongs to household
    NotificationLog.belongsTo(models.Household, {
      foreignKey: 'household_id',
      as: 'household'
    });

    // NotificationLog belongs to event
    NotificationLog.belongsTo(models.Event, {
      foreignKey: 'event_id',
      as: 'event'
    });

    // NotificationLog belongs to user (sender)
    NotificationLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return NotificationLog;
};