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
        len: [2, 100],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'read_only'),
      allowNull: false,
      defaultValue: 'staff',
      validate: {
        isIn: [['admin', 'staff', 'read_only']]
      }
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s-()]+$/i // Basic phone number validation
      }
    },
    ward_number: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Ward number this user is responsible for'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    email_verification_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL or path to profile picture'
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'User preferences and settings'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Soft delete
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['ward_number']
      },
      {
        fields: ['is_active']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.email_verification_token;
    delete values.password_reset_token;
    return values;
  };

  User.prototype.updateLastLogin = async function() {
    this.last_login = new Date();
    await this.save();
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() }
    });
  };

  User.findActiveUsers = function() {
    return this.findAll({
      where: { is_active: true }
    });
  };

  User.findByRole = function(role) {
    return this.findAll({
      where: { role }
    });
  };

  // Associations will be defined in the index file
  User.associate = function(models) {
    // User has many conversations
    User.hasMany(models.Conversation, {
      foreignKey: 'staff_id',
      as: 'conversations'
    });

    // User has many events (created by)
    User.hasMany(models.Event, {
      foreignKey: 'created_by',
      as: 'created_events'
    });

    // User has many audit trail entries
    User.hasMany(models.AuditTrail, {
      foreignKey: 'updated_by',
      as: 'audit_entries'
    });
  };

  return User;
};