const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ResidentKYC = sequelize.define(
    "ResidentKYC",
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
        unique: true, // One KYC record per resident
        references: {
          model: "residents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // Aadhaar Details
      aadhaar_number: {
        type: DataTypes.STRING(12),
        allowNull: true,
        unique: true,
        validate: {
          len: [12, 12],
          isNumeric: true,
        },
      },
      aadhaar_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Name as per Aadhaar card",
      },
      aadhaar_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      aadhaar_verification_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      aadhaar_verification_method: {
        type: DataTypes.ENUM("otp", "biometric", "manual", "e_kyc"),
        allowNull: true,
      },
      // PAN Details
      pan_number: {
        type: DataTypes.STRING(10),
        allowNull: true,
        unique: true,
        validate: {
          is: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN format validation
        },
      },
      pan_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Name as per PAN card",
      },
      pan_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pan_verification_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Voter ID Details
      voter_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      voter_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Name as per Voter ID",
      },
      voter_id_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      voter_id_verification_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      assembly_constituency: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      parliamentary_constituency: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      polling_station: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      // Passport Details
      passport_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      passport_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      passport_place_of_issue: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      passport_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      // Ration Card Details
      ration_card_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      ration_card_type: {
        type: DataTypes.ENUM("apl", "bpl", "aay", "phh"),
        allowNull: true,
        comment:
          "APL: Above Poverty Line, BPL: Below Poverty Line, AAY: Antyodaya Anna Yojana, PHH: Priority Household",
      },
      ration_card_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      // Health Insurance Details
      arogyasri_card_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "Telangana Arogyasri health insurance card number",
      },
      arogyasri_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      rice_card_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "Rice card number",
      },
      rice_card_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      // Caste Certificate
      caste_certificate_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      caste_category: {
        type: DataTypes.ENUM("general", "obc", "sc", "st", "ews"),
        allowNull: true,
      },
      caste_certificate_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      // KYC Status
      kyc_status: {
        type: DataTypes.ENUM("pending", "partial", "complete", "rejected"),
        defaultValue: "pending",
      },
      kyc_completion_percentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      mandatory_documents_submitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      last_kyc_update_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      next_kyc_review_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      kyc_reviewed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      kyc_rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      document_storage_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "File system path or cloud storage reference for documents",
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
      tableName: "resident_kyc",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["resident_id"],
        },
        {
          fields: ["aadhaar_number"],
          unique: true,
          where: {
            aadhaar_number: { [sequelize.Sequelize.Op.ne]: null },
          },
        },
        {
          fields: ["pan_number"],
          unique: true,
          where: {
            pan_number: { [sequelize.Sequelize.Op.ne]: null },
          },
        },
        {
          fields: ["voter_id"],
          unique: true,
          where: {
            voter_id: { [sequelize.Sequelize.Op.ne]: null },
          },
        },
        {
          fields: ["kyc_status"],
        },
        {
          fields: ["kyc_completion_percentage"],
        },
        {
          fields: ["caste_category"],
        },
      ],
      hooks: {
        beforeCreate: async (kyc, options) => {
          // Calculate KYC completion percentage
          kyc.kyc_completion_percentage = await calculateKYCCompletion(kyc);

          // Auto-generate audit trail entry
          if (sequelize.models.AuditTrail) {
            try {
              await sequelize.models.AuditTrail.create({
                entity_type: "resident",
                entity_id: kyc.resident_id,
                action: "create",
                new_values: kyc.dataValues,
                user_id: kyc.created_by || null,
                ip_address: options.ip_address || null,
                user_agent: options.user_agent || null,
              });
            } catch (auditError) {
              // Silently fail audit trail creation to not break seeding
              // console.error("Audit trail creation failed:", auditError.message);
            }
          }
        },
        beforeUpdate: async (kyc, options) => {
          // Recalculate KYC completion percentage
          kyc.kyc_completion_percentage = await calculateKYCCompletion(kyc);

          if (sequelize.models.AuditTrail && kyc.changed()) {
            try {
              await sequelize.models.AuditTrail.create({
                entity_type: "resident",
                entity_id: kyc.resident_id,
                action: "update",
                old_values: kyc._previousDataValues,
                new_values: kyc.dataValues,
                changed_fields: Object.keys(kyc.changed()),
                user_id: kyc.updated_by || null,
                ip_address: options.ip_address || null,
                user_agent: options.user_agent || null,
              });
            } catch (auditError) {
              // Silently fail audit trail creation to not break seeding
              // console.error("Audit trail creation failed:", auditError.message);
            }
          }
        },
        beforeDestroy: async (kyc, options) => {
          if (sequelize.models.AuditTrail) {
            try {
              await sequelize.models.AuditTrail.create({
                entity_type: "resident",
                entity_id: kyc.resident_id,
                action: "delete",
                old_values: kyc.dataValues,
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

  // Helper function to calculate KYC completion percentage
  async function calculateKYCCompletion(kyc) {
    const mandatoryFields = ["aadhaar_number", "pan_number", "voter_id"];
    const optionalFields = [
      "driving_license_number",
      "ration_card_number",
      "arogyasri_card_number",
    ];

    let completedMandatory = 0;
    let completedOptional = 0;

    mandatoryFields.forEach((field) => {
      if (kyc[field] && kyc[field].trim() !== "") {
        completedMandatory++;
      }
    });

    optionalFields.forEach((field) => {
      if (kyc[field] && kyc[field].trim() !== "") {
        completedOptional++;
      }
    });

    // Mandatory fields contribute 70%, optional fields 30%
    const mandatoryPercentage =
      (completedMandatory / mandatoryFields.length) * 70;
    const optionalPercentage = (completedOptional / optionalFields.length) * 30;

    return Math.round(mandatoryPercentage + optionalPercentage);
  }

  // Instance methods
  ResidentKYC.prototype.updateKYCStatus = async function () {
    if (this.kyc_completion_percentage >= 100) {
      this.kyc_status = "complete";
      this.mandatory_documents_submitted = true;
    } else if (this.kyc_completion_percentage >= 70) {
      this.kyc_status = "partial";
      this.mandatory_documents_submitted = true;
    } else {
      this.kyc_status = "pending";
      this.mandatory_documents_submitted = false;
    }

    this.last_kyc_update_date = new Date();
    return await this.save();
  };

  // Associations
  ResidentKYC.associate = function (models) {
    // KYC belongs to a resident
    ResidentKYC.belongsTo(models.Resident, {
      foreignKey: "resident_id",
      as: "resident",
    });

    // KYC created/updated by user
    ResidentKYC.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });

    ResidentKYC.belongsTo(models.User, {
      foreignKey: "updated_by",
      as: "updater",
    });

    // KYC reviewed by user
    ResidentKYC.belongsTo(models.User, {
      foreignKey: "kyc_reviewed_by",
      as: "reviewer",
    });
  };

  return ResidentKYC;
};
