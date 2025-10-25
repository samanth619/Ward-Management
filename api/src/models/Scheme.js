const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Scheme = sequelize.define('Scheme', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    scheme_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Unique scheme identification code'
    },
    scheme_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    scheme_name_local: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Scheme name in local language (Telugu/Hindi)'
    },
    scheme_type: {
      type: DataTypes.ENUM(
        'social_security', 'employment', 'housing', 'education', 
        'health', 'financial_inclusion', 'agriculture', 'pension',
        'insurance', 'skill_development', 'women_empowerment',
        'disability_support', 'senior_citizen', 'child_welfare',
        'food_security', 'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    implementing_department: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Government department implementing the scheme'
    },
    government_level: {
      type: DataTypes.ENUM('central', 'state', 'district', 'local'),
      allowNull: false,
      comment: 'Level of government running the scheme'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    benefits: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Benefits provided under the scheme'
    },
    eligibility_criteria: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: 'Eligibility criteria in structured format'
    },
    required_documents: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of required documents'
    },
    application_process: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'How to apply for the scheme'
    },
    target_beneficiaries: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Target groups: women, senior_citizens, farmers, etc.'
    },
    income_criteria: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Income limits for eligibility'
    },
    age_criteria: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Age limits for eligibility'
    },
    gender_specific: {
      type: DataTypes.ENUM('all', 'male', 'female', 'transgender'),
      defaultValue: 'all'
    },
    caste_criteria: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Caste-based eligibility if applicable'
    },
    disability_specific: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    bpl_only: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Only for Below Poverty Line families'
    },
    financial_benefit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Financial benefit amount if applicable'
    },
    benefit_frequency: {
      type: DataTypes.ENUM('one_time', 'monthly', 'quarterly', 'annual', 'as_needed'),
      allowNull: true
    },
    scheme_status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'closed'),
      defaultValue: 'active'
    },
    launch_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'End date if scheme has a time limit'
    },
    application_deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Last date for applications'
    },
    budget_allocated: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    contact_office: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    website_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    application_portal: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Online application portal URL'
    },
    is_online_application: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    processing_time: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Expected processing time for applications'
    },
    renewal_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    renewal_frequency: {
      type: DataTypes.ENUM('annual', 'biannual', 'as_needed'),
      allowNull: true
    },
    priority_level: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    success_metrics: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Metrics to measure scheme success'
    },
    common_issues: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Common issues faced by applicants'
    },
    faq: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Frequently asked questions'
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Tags for easier searching'
    },
    additional_info: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional scheme information'
    }
  }, {
    tableName: 'schemes',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['scheme_code']
      },
      {
        fields: ['scheme_type']
      },
      {
        fields: ['implementing_department']
      },
      {
        fields: ['government_level']
      },
      {
        fields: ['scheme_status']
      },
      {
        fields: ['target_beneficiaries']
      },
      {
        fields: ['bpl_only']
      },
      {
        fields: ['gender_specific']
      },
      {
        fields: ['disability_specific']
      },
      {
        fields: ['launch_date']
      },
      {
        fields: ['application_deadline']
      }
    ]
  });

  // Instance methods
  Scheme.prototype.isActive = function() {
    const now = new Date();
    return this.scheme_status === 'active' && 
           (!this.end_date || new Date(this.end_date) > now) &&
           (!this.application_deadline || new Date(this.application_deadline) > now);
  };

  Scheme.prototype.isEligible = function(resident, household) {
    // Basic eligibility check logic
    const criteria = this.eligibility_criteria;
    
    // Age criteria
    if (this.age_criteria) {
      const age = resident.age;
      if (this.age_criteria.min && age < this.age_criteria.min) return false;
      if (this.age_criteria.max && age > this.age_criteria.max) return false;
    }
    
    // Gender criteria
    if (this.gender_specific !== 'all' && resident.gender !== this.gender_specific) {
      return false;
    }
    
    // BPL criteria
    if (this.bpl_only && !household.is_bpl) {
      return false;
    }
    
    // Income criteria
    if (this.income_criteria && this.income_criteria.max) {
      const monthlyIncome = resident.monthly_income || 0;
      if (monthlyIncome > this.income_criteria.max) return false;
    }
    
    return true;
  };

  Scheme.prototype.getDaysUntilDeadline = function() {
    if (!this.application_deadline) return null;
    const deadline = new Date(this.application_deadline);
    const now = new Date();
    const diffTime = deadline - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Class methods
  Scheme.findActiveSchemes = function() {
    const { Op } = sequelize.Sequelize;
    const today = new Date();
    
    return this.findAll({
      where: {
        scheme_status: 'active',
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gt]: today } }
        ],
        [Op.or]: [
          { application_deadline: null },
          { application_deadline: { [Op.gt]: today } }
        ]
      },
      order: [['priority_level', 'DESC'], ['scheme_name', 'ASC']]
    });
  };

  Scheme.findByType = function(schemeType) {
    return this.findAll({
      where: { 
        scheme_type: schemeType,
        scheme_status: 'active'
      },
      order: [['scheme_name', 'ASC']]
    });
  };

  Scheme.findByDepartment = function(department) {
    return this.findAll({
      where: { 
        implementing_department: department,
        scheme_status: 'active'
      },
      order: [['scheme_name', 'ASC']]
    });
  };

  Scheme.findEligibleSchemes = function(resident, household) {
    // This would typically be done with a more complex query
    // For now, we'll fetch all active schemes and filter in application logic
    return this.findActiveSchemes();
  };

  Scheme.findByTarget = function(targetGroup) {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        target_beneficiaries: { [Op.contains]: [targetGroup] },
        scheme_status: 'active'
      }
    });
  };

  Scheme.findExpiringSchemes = function(days = 30) {
    const { Op } = sequelize.Sequelize;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return this.findAll({
      where: {
        scheme_status: 'active',
        application_deadline: {
          [Op.between]: [new Date(), endDate]
        }
      },
      order: [['application_deadline', 'ASC']]
    });
  };

  // Associations
  Scheme.associate = function(models) {
    // Scheme has many enrollments
    Scheme.hasMany(models.SchemeEnrollment, {
      foreignKey: 'scheme_id',
      as: 'enrollments'
    });

    // Many-to-many relationship with residents (through SchemeEnrollment)
    Scheme.belongsToMany(models.Resident, {
      through: models.SchemeEnrollment,
      foreignKey: 'scheme_id',
      otherKey: 'resident_id',
      as: 'enrolled_residents'
    });
  };

  return Scheme;
};