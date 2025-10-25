const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SchemeEnrollment = sequelize.define('SchemeEnrollment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    enrollment_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Unique enrollment identification number'
    },
    resident_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'residents',
        key: 'id'
      }
    },
    scheme_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schemes',
        key: 'id'
      }
    },
    application_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    application_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Official application number from government system'
    },
    status: {
      type: DataTypes.ENUM(
        'draft', 'submitted', 'under_review', 'verified', 
        'approved', 'rejected', 'on_hold', 'expired',
        'beneficiary', 'closed'
      ),
      allowNull: false,
      defaultValue: 'draft'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    applied_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Staff member who helped with the application'
    },
    documents_submitted: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of documents submitted with application'
    },
    documents_pending: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'List of pending documents'
    },
    verification_status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected', 'needs_correction'),
      defaultValue: 'pending'
    },
    verified_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Name of the verifying officer'
    },
    verification_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verification_remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approval_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejection_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    benefit_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when benefits started'
    },
    benefit_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when benefits end (if applicable)'
    },
    last_benefit_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last date when benefit was received'
    },
    total_benefits_received: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Total amount of benefits received'
    },
    benefits_frequency: {
      type: DataTypes.ENUM('one_time', 'monthly', 'quarterly', 'annual'),
      allowNull: true
    },
    next_benefit_due: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bank_account_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Bank account for receiving benefits'
    },
    bank_ifsc_code: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
    beneficiary_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Official beneficiary ID from government system'
    },
    card_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Scheme card number if applicable'
    },
    renewal_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    next_renewal_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    renewal_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    communication_preference: {
      type: DataTypes.ENUM('sms', 'email', 'whatsapp', 'postal', 'in_person'),
      defaultValue: 'sms'
    },
    language_preference: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
      comment: 'Language preference for communications'
    },
    follow_up_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    next_follow_up_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    case_worker_assigned: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    support_required: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Any special support or assistance required'
    },
    grievances: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of grievances or complaints'
    },
    application_channel: {
      type: DataTypes.ENUM('online', 'offline', 'mobile_app', 'kiosk', 'assisted'),
      defaultValue: 'assisted'
    },
    tracking_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Government tracking number for the application'
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Internal reference number'
    },
    processing_office: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    processing_officer: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    estimated_processing_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated processing time in days'
    },
    actual_processing_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Actual processing time in days'
    },
    satisfaction_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'File attachments related to the enrollment'
    },
    audit_trail: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Audit trail of status changes'
    },
    additional_info: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional enrollment information'
    }
  }, {
    tableName: 'scheme_enrollments',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['enrollment_id']
      },
      {
        fields: ['resident_id']
      },
      {
        fields: ['scheme_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['application_date']
      },
      {
        fields: ['verification_status']
      },
      {
        fields: ['applied_by']
      },
      {
        fields: ['case_worker_assigned']
      },
      {
        fields: ['next_follow_up_date']
      },
      {
        fields: ['next_renewal_date']
      },
      {
        fields: ['application_number']
      },
      {
        fields: ['beneficiary_id']
      },
      {
        name: 'scheme_enrollment_resident_scheme_idx',
        fields: ['resident_id', 'scheme_id']
      }
    ],
    hooks: {
      beforeCreate: (enrollment) => {
        // Auto-generate enrollment_id if not provided
        if (!enrollment.enrollment_id) {
          const timestamp = Date.now().toString().slice(-6);
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          enrollment.enrollment_id = `ENR${timestamp}${random}`;
        }
      },
      afterUpdate: (enrollment) => {
        // Update audit trail on status changes
        if (enrollment.changed('status')) {
          const auditTrail = enrollment.audit_trail || [];
          auditTrail.push({
            status: enrollment.status,
            changed_at: new Date(),
            changed_by: enrollment.dataValues.updatedBy || null,
            remarks: enrollment.dataValues.statusChangeRemark || null
          });
          enrollment.audit_trail = auditTrail;
        }
      }
    }
  });

  // Instance methods
  SchemeEnrollment.prototype.updateStatus = async function(newStatus, remarks = null, updatedBy = null) {
    const oldStatus = this.status;
    this.status = newStatus;
    
    // Set specific dates based on status
    const now = new Date();
    switch (newStatus) {
      case 'approved':
        this.approval_date = now;
        break;
      case 'rejected':
        this.rejection_date = now;
        if (remarks) this.rejection_reason = remarks;
        break;
      case 'verified':
        this.verification_date = now;
        if (remarks) this.verification_remarks = remarks;
        break;
      case 'beneficiary':
        this.benefit_start_date = now;
        break;
    }
    
    // Update audit trail
    const auditTrail = this.audit_trail || [];
    auditTrail.push({
      old_status: oldStatus,
      new_status: newStatus,
      changed_at: now,
      changed_by: updatedBy,
      remarks: remarks
    });
    this.audit_trail = auditTrail;
    
    await this.save();
  };

  SchemeEnrollment.prototype.addBenefitReceived = async function(amount, date = null) {
    this.total_benefits_received = parseFloat(this.total_benefits_received) + parseFloat(amount);
    this.last_benefit_date = date || new Date();
    
    // Calculate next benefit due date based on frequency
    if (this.benefits_frequency && this.benefits_frequency !== 'one_time') {
      const nextDate = new Date(this.last_benefit_date);
      switch (this.benefits_frequency) {
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'annual':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
      this.next_benefit_due = nextDate;
    }
    
    await this.save();
  };

  SchemeEnrollment.prototype.getDaysInStatus = function() {
    const statusChangeDate = this.updated_at || this.created_at;
    const now = new Date();
    return Math.ceil((now - statusChangeDate) / (1000 * 60 * 60 * 24));
  };

  SchemeEnrollment.prototype.isOverdue = function() {
    if (!this.next_follow_up_date) return false;
    return new Date() > new Date(this.next_follow_up_date);
  };

  // Class methods
  SchemeEnrollment.findByResident = function(residentId) {
    return this.findAll({
      where: { resident_id: residentId },
      include: ['scheme'],
      order: [['application_date', 'DESC']]
    });
  };

  SchemeEnrollment.findByScheme = function(schemeId) {
    return this.findAll({
      where: { scheme_id: schemeId },
      include: ['resident'],
      order: [['application_date', 'DESC']]
    });
  };

  SchemeEnrollment.findByStatus = function(status) {
    return this.findAll({
      where: { status },
      include: ['resident', 'scheme'],
      order: [['application_date', 'DESC']]
    });
  };

  SchemeEnrollment.findPendingApplications = function() {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        status: { [Op.in]: ['submitted', 'under_review', 'verified'] }
      },
      include: ['resident', 'scheme'],
      order: [['application_date', 'ASC']]
    });
  };

  SchemeEnrollment.findOverdueFollowUps = function() {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        follow_up_required: true,
        next_follow_up_date: { [Op.lt]: new Date() }
      },
      include: ['resident', 'scheme'],
      order: [['next_follow_up_date', 'ASC']]
    });
  };

  SchemeEnrollment.findDueRenewals = function(days = 30) {
    const { Op } = sequelize.Sequelize;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return this.findAll({
      where: {
        renewal_required: true,
        next_renewal_date: {
          [Op.between]: [new Date(), endDate]
        }
      },
      include: ['resident', 'scheme'],
      order: [['next_renewal_date', 'ASC']]
    });
  };

  // Associations
  SchemeEnrollment.associate = function(models) {
    // SchemeEnrollment belongs to resident
    SchemeEnrollment.belongsTo(models.Resident, {
      foreignKey: 'resident_id',
      as: 'resident'
    });

    // SchemeEnrollment belongs to scheme
    SchemeEnrollment.belongsTo(models.Scheme, {
      foreignKey: 'scheme_id',
      as: 'scheme'
    });

    // SchemeEnrollment belongs to user (applied by)
    SchemeEnrollment.belongsTo(models.User, {
      foreignKey: 'applied_by',
      as: 'applicant_staff'
    });

    // SchemeEnrollment belongs to user (case worker)
    SchemeEnrollment.belongsTo(models.User, {
      foreignKey: 'case_worker_assigned',
      as: 'case_worker'
    });
  };

  return SchemeEnrollment;
};