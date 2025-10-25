const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ResidentEmergencyContact = sequelize.define('ResidentEmergencyContact', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    resident_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'residents',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    contact_type: {
      type: DataTypes.ENUM('primary', 'secondary', 'medical', 'local_guardian'),
      allowNull: false,
      defaultValue: 'primary'
    },
    contact_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    relationship: {
      type: DataTypes.ENUM(
        'spouse', 'father', 'mother', 'son', 'daughter', 'brother', 'sister',
        'grandfather', 'grandmother', 'uncle', 'aunt', 'nephew', 'niece',
        'cousin', 'friend', 'neighbor', 'colleague', 'guardian', 'other'
      ),
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        is: /^[+]?[0-9\s\-\(\)]{10,15}$/ // Phone number validation
      }
    },
    alternative_phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^[+]?[0-9\s\-\(\)]{10,15}$/
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        is: /^[0-9]{6}$/ // Indian pincode format
      }
    },
    occupation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    workplace: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    is_local_resident: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the contact lives in the same ward/area'
    },
    is_available_24x7: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this contact is available round the clock'
    },
    medical_authorization: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this contact is authorized for medical decisions'
    },
    can_pick_up_documents: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this contact can collect documents on behalf'
    },
    priority_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      },
      comment: 'Priority order for contacting (1 = highest priority)'
    },
    last_contacted_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_contacted_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    contact_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes about contacting this person'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether contact details have been verified'
    },
    verification_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verification_method: {
      type: DataTypes.ENUM('phone_call', 'sms', 'in_person', 'document'),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    deactivation_reason: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'resident_emergency_contacts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['resident_id']
      },
      {
        fields: ['phone_number']
      },
      {
        fields: ['contact_type']
      },
      {
        fields: ['priority_order']
      },
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['resident_id', 'contact_type', 'priority_order'],
        where: {
          is_active: true
        },
        name: 'unique_resident_contact_priority'
      }
    ],
    hooks: {
      beforeCreate: async (contact, options) => {
        // Auto-generate audit trail entry
        if (sequelize.models.AuditTrail) {
          await sequelize.models.AuditTrail.create({
            table_name: 'resident_emergency_contacts',
            record_id: contact.id,
            action: 'CREATE',
            changes: JSON.stringify(contact.dataValues),
            user_id: contact.created_by,
            ip_address: options.ip_address,
            user_agent: options.user_agent
          });
        }
      },
      beforeUpdate: async (contact, options) => {
        if (sequelize.models.AuditTrail && contact.changed()) {
          await sequelize.models.AuditTrail.create({
            table_name: 'resident_emergency_contacts',
            record_id: contact.id,
            action: 'UPDATE',
            changes: JSON.stringify(contact.changed()),
            previous_values: JSON.stringify(contact._previousDataValues),
            new_values: JSON.stringify(contact.dataValues),
            user_id: contact.updated_by,
            ip_address: options.ip_address,
            user_agent: options.user_agent
          });
        }
      },
      beforeDestroy: async (contact, options) => {
        if (sequelize.models.AuditTrail) {
          await sequelize.models.AuditTrail.create({
            table_name: 'resident_emergency_contacts',
            record_id: contact.id,
            action: 'DELETE',
            previous_values: JSON.stringify(contact.dataValues),
            user_id: options.user_id,
            ip_address: options.ip_address,
            user_agent: options.user_agent
          });
        }
      }
    }
  });

  // Associations
  ResidentEmergencyContact.associate = function(models) {
    // Emergency contact belongs to a resident
    ResidentEmergencyContact.belongsTo(models.Resident, {
      foreignKey: 'resident_id',
      as: 'resident'
    });

    // Emergency contact created/updated by user
    ResidentEmergencyContact.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    ResidentEmergencyContact.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });

    // Emergency contact last contacted by user
    ResidentEmergencyContact.belongsTo(models.User, {
      foreignKey: 'last_contacted_by',
      as: 'last_contacted_user'
    });
  };

  return ResidentEmergencyContact;
};