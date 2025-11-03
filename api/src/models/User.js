const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        },
        notEmpty: {
          msg: 'Email cannot be empty'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password cannot be empty'
        },
        len: {
          args: [8, 255],
          msg: 'Password must be at least 8 characters long'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'read_only'),
      allowNull: false,
      defaultValue: 'staff',
      validate: {
        isIn: {
          args: [['admin', 'staff', 'read_only']],
          msg: 'Role must be admin, staff, or read_only'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'Phone number must be valid'
        }
      }
    },
    ward_secretariat_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'ward_secretariats',
        key: 'id'
      },
      comment: 'Reference to ward secretariat for staff users'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    email_verification_token: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile_picture: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
        if (user.email) {
          user.email = user.email.toLowerCase();
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
        if (user.changed('email')) {
          user.email = user.email.toLowerCase();
        }
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // Alias for compatibility
  User.prototype.validatePassword = async function(password) {
    return this.comparePassword(password);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.email_verification_token;
    delete values.password_reset_token;
    return values;
  };

  // Class methods
  User.prototype.getPermissions = function() {
    const permissions = {
      admin: [
        'user:create', 'user:read', 'user:update', 'user:delete',
        'household:create', 'household:read', 'household:update', 'household:delete',
        'resident:create', 'resident:read', 'resident:update', 'resident:delete',
        'scheme:create', 'scheme:read', 'scheme:update', 'scheme:delete',
        'event:create', 'event:read', 'event:update', 'event:delete',
        'conversation:create', 'conversation:read', 'conversation:update', 'conversation:delete',
        'notification:create', 'notification:read', 'notification:update', 'notification:delete',
        'audit:read', 'system:manage'
      ],
      staff: [
        'household:create', 'household:read', 'household:update',
        'resident:create', 'resident:read', 'resident:update',
        'scheme:read', 'scheme:update',
        'event:create', 'event:read', 'event:update',
        'conversation:create', 'conversation:read', 'conversation:update',
        'notification:create', 'notification:read'
      ],
      read_only: [
        'household:read', 'resident:read', 'scheme:read',
        'event:read', 'conversation:read', 'notification:read'
      ]
    };
    return permissions[this.role] || [];
  };

  User.prototype.hasPermission = function(permission) {
    return this.getPermissions().includes(permission);
  };

  // Update last login method
  User.prototype.updateLastLogin = async function() {
    this.last_login = new Date();
    await this.save();
  };

  // Static methods
  User.findByEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() }
    });
  };

  User.findByEmailWithPassword = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() },
      attributes: { include: ['password'] }
    });
  };

  User.findActiveByEmail = function(email) {
    return this.findOne({
      where: { 
        email: email.toLowerCase(),
        is_active: true 
      }
    });
  };

  User.associate = function(models) {
    // User has many conversations as staff
    User.hasMany(models.Conversation, {
      foreignKey: 'staff_id',
      as: 'conversations'
    });

    // User has many events created
    User.hasMany(models.Event, {
      foreignKey: 'created_by',
      as: 'created_events'
    });

    // User has many schemes created
    User.hasMany(models.Scheme, {
      foreignKey: 'created_by',
      as: 'created_schemes'
    });

    // User has many scheme enrollments applied
    User.hasMany(models.SchemeEnrollment, {
      foreignKey: 'applied_by',
      as: 'applied_enrollments'
    });

    // User has many scheme enrollments approved
    User.hasMany(models.SchemeEnrollment, {
      foreignKey: 'approved_by',
      as: 'approved_enrollments'
    });

    // User has many notifications
    User.hasMany(models.NotificationLog, {
      foreignKey: 'user_id',
      as: 'notifications'
    });

    // User has many audit trails
    User.hasMany(models.AuditTrail, {
      foreignKey: 'user_id',
      as: 'audit_entries'
    });

    // User has many ward secretariats updated
    User.hasMany(models.WardSecretariat, {
      foreignKey: 'last_updated_by',
      as: 'updated_ward_secretariats'
    });

    // User has many households verified
    User.hasMany(models.Household, {
      foreignKey: 'verified_by',
      as: 'verified_households'
    });

    // Note: verified_by column doesn't exist in residents table, so association removed

    // Note: verified_by column doesn't exist in resident_kyc table, so association removed

    // User has many conversations resolved
    User.hasMany(models.Conversation, {
      foreignKey: 'resolved_by',
      as: 'resolved_conversations'
    });
  };

  return User;
};