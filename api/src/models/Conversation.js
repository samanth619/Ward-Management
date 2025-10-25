const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    conversation_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Unique conversation identification number'
    },
    resident_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'residents',
        key: 'id'
      },
      comment: 'Resident this conversation is about'
    },
    household_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'households',
        key: 'id'
      },
      comment: 'Household this conversation is about (if not specific to a resident)'
    },
    staff_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Staff member who had the conversation'
    },
    conversation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    conversation_type: {
      type: DataTypes.ENUM('phone_call', 'home_visit', 'office_visit', 'email', 'whatsapp', 'sms', 'public_meeting', 'complaint', 'inquiry', 'follow_up', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    issue_category: {
      type: DataTypes.ENUM(
        'sanitation', 'water_supply', 'electricity', 'roads', 'drainage', 
        'street_lights', 'waste_management', 'health', 'education', 
        'documents', 'schemes', 'grievance', 'suggestion', 'appreciation', 
        'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed', 'escalated', 'pending'),
      allowNull: false,
      defaultValue: 'open'
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 5000]
      }
    },
    action_taken: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Actions taken by staff to address the issue'
    },
    resolution_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes about how the issue was resolved'
    },
    next_follow_up_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When to follow up on this conversation'
    },
    follow_up_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes for the follow-up'
    },
    is_follow_up_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_complaint: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this conversation is a formal complaint'
    },
    complaint_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Official complaint number if this is a complaint'
    },
    estimated_resolution_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_resolution_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    satisfaction_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Resident satisfaction rating (1-5)'
    },
    satisfaction_feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Feedback from resident about the resolution'
    },
    contact_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'How the resident was contacted (phone, visit, etc.)'
    },
    contact_person_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Name of the person contacted (if different from resident)'
    },
    contact_person_relationship: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Relationship to resident'
    },
    contact_person_phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s-()]+$/i
      }
    },
    documents_required: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of documents required to resolve the issue'
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'File attachments related to this conversation'
    },
    department_involved: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Government department involved in resolving this issue'
    },
    escalated_to: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Person or department this was escalated to'
    },
    escalation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    escalation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cost_estimate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Estimated cost to resolve the issue'
    },
    actual_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Actual cost incurred to resolve the issue'
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Tags for easier searching and categorization'
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this conversation can be viewed publicly (for transparency)'
    },
    location_details: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Specific location details related to the issue'
    },
    weather_conditions: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Weather conditions at the time (if relevant)'
    },
    additional_info: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional conversation information in JSON format'
    }
  }, {
    tableName: 'conversations',
    timestamps: true,
    paranoid: true, // Soft delete
    indexes: [
      {
        unique: true,
        fields: ['conversation_id']
      },
      {
        fields: ['resident_id']
      },
      {
        fields: ['household_id']
      },
      {
        fields: ['staff_id']
      },
      {
        fields: ['conversation_date']
      },
      {
        fields: ['conversation_type']
      },
      {
        fields: ['issue_category']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['status']
      },
      {
        fields: ['next_follow_up_date']
      },
      {
        fields: ['is_complaint']
      },
      {
        fields: ['complaint_number']
      },
      {
        fields: ['is_follow_up_required']
      },
      {
        fields: ['department_involved']
      }
    ],
    hooks: {
      beforeCreate: (conversation) => {
        // Auto-generate conversation_id if not provided
        if (!conversation.conversation_id) {
          const timestamp = Date.now().toString().slice(-6);
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          conversation.conversation_id = `CONV${timestamp}${random}`;
        }
        
        // Auto-generate complaint number if this is a complaint
        if (conversation.is_complaint && !conversation.complaint_number) {
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          conversation.complaint_number = `CMP${date}${random}`;
        }
      },
      afterUpdate: (conversation) => {
        // Auto-set resolution date when status changes to resolved/closed
        if (conversation.changed('status') && 
            ['resolved', 'closed'].includes(conversation.status) && 
            !conversation.actual_resolution_date) {
          conversation.actual_resolution_date = new Date();
        }
      }
    }
  });

  // Instance methods
  Conversation.prototype.isOverdue = function() {
    if (!this.next_follow_up_date) return false;
    return new Date() > new Date(this.next_follow_up_date);
  };

  Conversation.prototype.getDaysOpen = function() {
    const startDate = new Date(this.conversation_date);
    const endDate = this.actual_resolution_date ? new Date(this.actual_resolution_date) : new Date();
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  };

  Conversation.prototype.addFollowUp = async function(notes, nextDate) {
    this.follow_up_notes = notes;
    this.next_follow_up_date = nextDate;
    this.is_follow_up_required = true;
    await this.save();
  };

  Conversation.prototype.markResolved = async function(resolutionNotes, satisfactionRating = null) {
    this.status = 'resolved';
    this.resolution_notes = resolutionNotes;
    this.actual_resolution_date = new Date();
    this.is_follow_up_required = false;
    if (satisfactionRating) {
      this.satisfaction_rating = satisfactionRating;
    }
    await this.save();
  };

  // Class methods
  Conversation.findByResident = function(residentId) {
    return this.findAll({
      where: { resident_id: residentId },
      order: [['conversation_date', 'DESC']],
      include: ['staff', 'resident', 'household']
    });
  };

  Conversation.findByHousehold = function(householdId) {
    return this.findAll({
      where: { household_id: householdId },
      order: [['conversation_date', 'DESC']],
      include: ['staff', 'resident', 'household']
    });
  };

  Conversation.findByStaff = function(staffId) {
    return this.findAll({
      where: { staff_id: staffId },
      order: [['conversation_date', 'DESC']],
      include: ['resident', 'household']
    });
  };

  Conversation.findByStatus = function(status) {
    return this.findAll({
      where: { status },
      order: [['conversation_date', 'DESC']],
      include: ['staff', 'resident', 'household']
    });
  };

  Conversation.findByCategory = function(category) {
    return this.findAll({
      where: { issue_category: category },
      order: [['conversation_date', 'DESC']],
      include: ['staff', 'resident', 'household']
    });
  };

  Conversation.findOverdueFollowUps = function() {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        is_follow_up_required: true,
        next_follow_up_date: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['resolved', 'closed'] }
      },
      order: [['next_follow_up_date', 'ASC']],
      include: ['staff', 'resident', 'household']
    });
  };

  Conversation.findComplaints = function() {
    return this.findAll({
      where: { is_complaint: true },
      order: [['conversation_date', 'DESC']],
      include: ['staff', 'resident', 'household']
    });
  };

  Conversation.findByDateRange = function(startDate, endDate) {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        conversation_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['conversation_date', 'DESC']],
      include: ['staff', 'resident', 'household']
    });
  };

  // Associations
  Conversation.associate = function(models) {
    // Conversation belongs to resident
    Conversation.belongsTo(models.Resident, {
      foreignKey: 'resident_id',
      as: 'resident'
    });

    // Conversation belongs to household
    Conversation.belongsTo(models.Household, {
      foreignKey: 'household_id',
      as: 'household'
    });

    // Conversation belongs to staff (user)
    Conversation.belongsTo(models.User, {
      foreignKey: 'staff_id',
      as: 'staff'
    });
  };

  return Conversation;
};