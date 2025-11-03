const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ResidentBankDetails = sequelize.define(
    "ResidentBankDetails",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      resident_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // One bank detail record per resident
        references: {
          model: "residents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      bank_account_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          len: [9, 20], // Indian bank account numbers are typically 9-20 digits
        },
      },
      bank_ifsc_code: {
        type: DataTypes.STRING(11),
        allowNull: true,
        validate: {
          is: /^[A-Z]{4}0[A-Z0-9]{6}$/, // Indian IFSC format
        },
      },
      bank_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      bank_branch: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      account_holder_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Name as per bank records",
      },
      account_type: {
        type: DataTypes.ENUM(
          "savings",
          "current",
          "fixed_deposit",
          "recurring_deposit",
          "overdraft"
        ),
        allowNull: true,
        defaultValue: "savings",
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether bank details have been verified",
      },
      verification_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      verification_method: {
        type: DataTypes.ENUM(
          "penny_drop",
          "passbook",
          "cheque",
          "statement",
          "manual"
        ),
        allowNull: true,
      },
      is_primary_account: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Primary account for benefit transfers",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      upi_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          isEmail: true, // UPI format validation
        },
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "resident_bank_details",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["resident_id"],
        },
        {
          fields: ["bank_account_number"],
          where: {
            bank_account_number: { [sequelize.Sequelize.Op.ne]: null },
          },
        },
        {
          fields: ["bank_ifsc_code"],
        },
        {
          fields: ["is_verified"],
        },
        {
          fields: ["is_primary_account"],
        },
      ],
      hooks: {
        beforeCreate: async (bankDetails, options) => {
          // Auto-generate audit trail entry
          if (sequelize.models.AuditTrail) {
            try {
              await sequelize.models.AuditTrail.create({
                entity_type: "resident",
                entity_id: bankDetails.resident_id,
                action: "create",
                new_values: bankDetails.dataValues,
                user_id: bankDetails.created_by || null,
                ip_address: options.ip_address || null,
                user_agent: options.user_agent || null,
              });
            } catch (auditError) {
              // Silently fail audit trail creation to not break seeding
              // console.error("Audit trail creation failed:", auditError.message);
            }
          }
        },
        beforeUpdate: async (bankDetails, options) => {
          if (sequelize.models.AuditTrail && bankDetails.changed()) {
            try {
              await sequelize.models.AuditTrail.create({
                entity_type: "resident",
                entity_id: bankDetails.resident_id,
                action: "update",
                old_values: bankDetails._previousDataValues,
                new_values: bankDetails.dataValues,
                changed_fields: Object.keys(bankDetails.changed()),
                user_id: bankDetails.updated_by || null,
                ip_address: options.ip_address || null,
                user_agent: options.user_agent || null,
              });
            } catch (auditError) {
              // Silently fail audit trail creation to not break seeding
              // console.error("Audit trail creation failed:", auditError.message);
            }
          }
        },
        beforeDestroy: async (bankDetails, options) => {
          if (sequelize.models.AuditTrail) {
            try {
              await sequelize.models.AuditTrail.create({
                entity_type: "resident",
                entity_id: bankDetails.resident_id,
                action: "delete",
                old_values: bankDetails.dataValues,
                user_id: options.user_id || null,
                ip_address: options.ip_address || null,
                user_agent: options.user_agent || null,
              });
            } catch (auditError) {
              // Silently fail audit trail creation to not break seeding
              // console.error("Audit trail creation failed:", auditError.message);
            }
          }
        },
      },
    }
  );

  // Associations
  ResidentBankDetails.associate = function (models) {
    // Bank details belong to a resident
    ResidentBankDetails.belongsTo(models.Resident, {
      foreignKey: "resident_id",
      as: "resident",
    });

    // Bank details created/updated by user
    ResidentBankDetails.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });

    ResidentBankDetails.belongsTo(models.User, {
      foreignKey: "updated_by",
      as: "updater",
    });
  };

  return ResidentBankDetails;
};
