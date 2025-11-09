const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    event_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Unique event identification number'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    event_type: {
      type: DataTypes.ENUM(
        'birthday', 'anniversary', 'festival', 'public_holiday',
        'health_camp', 'vaccination_drive', 'awareness_program', 
        'meeting', 'workshop', 'training', 'cultural_event',
        'sports_event', 'cleaning_drive', 'tree_plantation',
        'blood_donation', 'medical_checkup', 'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isAfterStartDate(value) {
          if (value && value < this.start_date) {
            throw new Error('End date must be after start date');
          }
        }
      }
    },
    is_all_day: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    venue_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    organizer: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s-()]+$/i
      }
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    target_audience: {
      type: DataTypes.ENUM(
        'all_residents', 'senior_citizens', 'children', 'women',
        'youth', 'students', 'working_professionals', 'specific_households',
        'health_workers', 'volunteers', 'other'
      ),
      allowNull: false,
      defaultValue: 'all_residents'
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    current_participants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    is_registration_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    registration_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    registration_fee: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled', 'postponed'),
      allowNull: false,
      defaultValue: 'draft'
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private', 'ward_only'),
      allowNull: false,
      defaultValue: 'public'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ward_secretariat_ids: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of ward secretariat IDs (UUIDs) this event is for'
    },
    notification_channels: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: ['sms'],
      comment: 'Array of notification channels: sms, email, whatsapp'
    },
    send_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notification_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notification_sent_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reminder_notifications: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of reminder schedules: {days_before: 7, sent: false}'
    },
    auto_send_reminders: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    event_image: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL or path to event image/poster'
    },
    event_documents: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of document attachments'
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'What participants need to bring or requirements'
    },
    benefits: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Benefits or outcomes of attending the event'
    },
    agenda: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Event agenda or schedule'
    },
    feedback_collected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    feedback_questions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Feedback questions to ask participants'
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    actual_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    sponsors: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of event sponsors'
    },
    success_metrics: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Metrics to measure event success'
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurrence_pattern: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Recurrence pattern: {type: weekly/monthly/yearly, interval: 1, days: [mon,tue]}'
    },
    parent_event_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id'
      },
      comment: 'Parent event if this is a recurring event instance'
    },
    weather_dependency: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether event is weather dependent'
    },
    backup_plan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Backup plan if weather is bad'
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Tags for easier searching and categorization'
    },
    external_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'External website or registration URL'
    },
    qr_code: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'QR code for easy event sharing'
    },
    additional_info: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional event information in JSON format'
    }
  }, {
    tableName: 'events',
    timestamps: true,
    paranoid: true, // Soft delete
    deletedAt: 'deleted_at',
    indexes: [
      {
        unique: true,
        fields: ['event_id']
      },
      {
        fields: ['event_type']
      },
      {
        fields: ['start_date']
      },
      {
        fields: ['end_date']
      },
      {
        fields: ['status']
      },
      {
        fields: ['visibility']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['target_audience']
      },
      {
        fields: ['is_registration_required']
      },
      {
        fields: ['notification_sent']
      },
      {
        fields: ['is_recurring']
      },
      {
        fields: ['parent_event_id']
      }
    ],
    hooks: {
      beforeCreate: (event) => {
        // Auto-generate event_id if not provided
        if (!event.event_id) {
          const timestamp = Date.now().toString().slice(-6);
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          event.event_id = `EVT${timestamp}${random}`;
        }
      }
    }
  });

  // Instance methods
  Event.prototype.isUpcoming = function() {
    return new Date(this.start_date) > new Date();
  };

  Event.prototype.isOngoing = function() {
    const now = new Date();
    const start = new Date(this.start_date);
    const end = this.end_date ? new Date(this.end_date) : start;
    return now >= start && now <= end;
  };

  Event.prototype.isPast = function() {
    const end = this.end_date ? new Date(this.end_date) : new Date(this.start_date);
    return new Date() > end;
  };

  Event.prototype.getDuration = function() {
    if (!this.end_date) return null;
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60)); // Duration in hours
  };

  Event.prototype.getAvailableSpots = function() {
    if (!this.max_participants) return null;
    return this.max_participants - this.current_participants;
  };

  Event.prototype.isRegistrationOpen = function() {
    if (!this.is_registration_required) return false;
    if (this.registration_deadline && new Date() > new Date(this.registration_deadline)) {
      return false;
    }
    if (this.max_participants && this.current_participants >= this.max_participants) {
      return false;
    }
    return true;
  };

  Event.prototype.addParticipant = async function() {
    if (this.max_participants && this.current_participants >= this.max_participants) {
      throw new Error('Event is full');
    }
    this.current_participants += 1;
    await this.save();
  };

  Event.prototype.removeParticipant = async function() {
    if (this.current_participants > 0) {
      this.current_participants -= 1;
      await this.save();
    }
  };

  Event.prototype.markNotificationSent = async function() {
    this.notification_sent = true;
    this.notification_sent_date = new Date();
    await this.save();
  };

  // Class methods
  Event.findUpcoming = function(days = 30) {
    const { Op } = sequelize.Sequelize;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.findAll({
      where: {
        start_date: {
          [Op.between]: [startDate, endDate]
        },
        status: { [Op.in]: ['published', 'ongoing'] }
      },
      order: [['start_date', 'ASC']]
    });
  };

  Event.findByType = function(eventType) {
    return this.findAll({
      where: { event_type: eventType },
      order: [['start_date', 'DESC']]
    });
  };

  Event.findByStatus = function(status) {
    return this.findAll({
      where: { status },
      order: [['start_date', 'DESC']]
    });
  };

  Event.findByWardSecretariat = function(wardSecretariatId) {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        [Op.or]: [
          { ward_secretariat_ids: { [Op.contains]: [wardSecretariatId] } },
          { target_audience: 'all_residents' }
        ]
      },
      order: [['start_date', 'ASC']]
    });
  };

  Event.findBirthdays = function(startDate, endDate) {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        event_type: 'birthday',
        start_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['start_date', 'ASC']]
    });
  };

  Event.findAnniversaries = function(startDate, endDate) {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        event_type: 'anniversary',
        start_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['start_date', 'ASC']]
    });
  };

  Event.findPendingNotifications = function() {
    return this.findAll({
      where: {
        send_notifications: true,
        notification_sent: false,
        status: 'published'
      }
    });
  };

  Event.findRecurringEvents = function() {
    return this.findAll({
      where: {
        is_recurring: true,
        parent_event_id: null // Only parent events
      }
    });
  };

  // Associations
  Event.associate = function(models) {
    // Event belongs to creator (user)
    Event.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    // Event belongs to parent event (for recurring events)
    Event.belongsTo(models.Event, {
      foreignKey: 'parent_event_id',
      as: 'parent_event'
    });

    // Event has many child events (for recurring events)
    Event.hasMany(models.Event, {
      foreignKey: 'parent_event_id',
      as: 'recurring_instances'
    });

    // Event has many notification logs
    Event.hasMany(models.NotificationLog, {
      foreignKey: 'event_id',
      as: 'notifications'
    });
  };

  return Event;
};