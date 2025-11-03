const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ResidentEmployment = sequelize.define(
    "ResidentEmployment",
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
        references: {
          model: "residents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // Current Employment Status
      employment_status: {
        type: DataTypes.ENUM(
          "employed",
          "unemployed",
          "self_employed",
          "student",
          "homemaker",
          "retired",
          "differently_abled",
          "seeking_employment"
        ),
        allowNull: false,
        defaultValue: "unemployed",
      },
      current_occupation: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      job_title: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      employment_type: {
        type: DataTypes.ENUM(
          "permanent",
          "contract",
          "part_time",
          "freelance",
          "daily_wage",
          "seasonal"
        ),
        allowNull: true,
      },
      work_sector: {
        type: DataTypes.ENUM(
          "government",
          "private",
          "ngo",
          "self_employed",
          "agriculture",
          "construction",
          "manufacturing",
          "services",
          "it",
          "healthcare",
          "education",
          "retail",
          "other"
        ),
        allowNull: true,
      },
      monthly_income: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      // Employment Seeking Details
      seeking_employment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether the resident is actively seeking employment",
      },
      preferred_job_type: {
        type: DataTypes.ENUM(
          "full_time",
          "part_time",
          "contract",
          "freelance",
          "work_from_home",
          "flexible"
        ),
        allowNull: true,
      },
      preferred_sectors: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON array of preferred work sectors",
      },
      // Skills and Qualifications
      highest_qualification: {
        type: DataTypes.ENUM(
          "below_10th",
          "10th_pass",
          "12th_pass",
          "diploma",
          "graduation",
          "post_graduation",
          "phd",
          "professional_course"
        ),
        allowNull: true,
      },
      qualification_details: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Detailed qualification information in JSON format",
      },
      technical_skills: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON array of technical skills",
      },
      certifications: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON array of professional certifications",
      },
      language_skills: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON object with language proficiency levels",
      },
      computer_literacy: {
        type: DataTypes.ENUM("none", "basic", "intermediate", "advanced"),
        allowNull: true,
        defaultValue: "none",
      },
      work_experience_years: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 60,
        },
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
      tableName: "resident_employment",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["resident_id"],
        },
        {
          fields: ["employment_status"],
        },
        {
          fields: ["seeking_employment"],
        },
        {
          fields: ["work_sector"],
        },
        {
          fields: ["highest_qualification"],
        },
        {
          fields: ["employment_verification_status"],
        },
        {
          fields: ["requires_employment_assistance"],
        },
        {
          fields: ["is_current_job"],
        },
        {
          fields: ["monthly_income"],
        },
      ],
      hooks: {
        beforeCreate: async (employment, options) => {
          employment.last_employment_status_update = new Date();

          // Auto-generate audit trail entry
          if (sequelize.models.AuditTrail) {
            try {
              await sequelize.models.AuditTrail.create({
                entity_type: "resident",
                entity_id: employment.resident_id,
                action: "create",
                new_values: employment.dataValues,
                user_id: employment.created_by || null,
                ip_address: options.ip_address || null,
                user_agent: options.user_agent || null,
              });
            } catch (auditError) {
              // Silently fail audit trail creation to not break seeding
              // console.error("Audit trail creation failed:", auditError.message);
            }
          }
        },
        beforeUpdate: async (employment, options) => {
          if (
            employment.changed("employment_status") ||
            employment.changed("current_occupation")
          ) {
            employment.last_employment_status_update = new Date();
          }

          if (sequelize.models.AuditTrail && employment.changed()) {
            try {
              await sequelize.models.AuditTrail.create({
                entity_type: "resident",
                entity_id: employment.resident_id,
                action: "update",
                old_values: employment._previousDataValues,
                new_values: employment.dataValues,
                changed_fields: Object.keys(employment.changed()),
                user_id: employment.updated_by || null,
                ip_address: options.ip_address || null,
                user_agent: options.user_agent || null,
              });
            } catch (auditError) {
              // Silently fail audit trail creation to not break seeding
              // console.error("Audit trail creation failed:", auditError.message);
            }
          }
        },
        beforeDestroy: async (employment, options) => {
          if (sequelize.models.AuditTrail) {
            try {
              await sequelize.models.AuditTrail.create({
                entity_type: "resident",
                entity_id: employment.resident_id,
                action: "delete",
                old_values: employment.dataValues,
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

  // Instance methods
  ResidentEmployment.prototype.calculateEmployabilityScore = function () {
    let score = 0;

    // Education score (0-30)
    const educationScores = {
      phd: 30,
      post_graduation: 25,
      graduation: 20,
      diploma: 15,
      "12th_pass": 10,
      "10th_pass": 5,
      below_10th: 0,
      professional_course: 25,
    };
    score += educationScores[this.highest_qualification] || 0;

    // Experience score (0-25)
    if (this.work_experience_years) {
      score += Math.min(this.work_experience_years * 2, 25);
    }

    // Skills score (0-20)
    if (this.technical_skills) {
      const skills = JSON.parse(this.technical_skills || "[]");
      score += Math.min(skills.length * 2, 20);
    }

    // Computer literacy score (0-15)
    const computerScores = {
      advanced: 15,
      intermediate: 10,
      basic: 5,
      none: 0,
    };
    score += computerScores[this.computer_literacy] || 0;

    // Availability score (0-10)
    if (this.seeking_employment) score += 5;
    if (this.transportation_available) score += 3;
    if (this.willing_to_relocate) score += 2;

    return Math.min(score, 100);
  };

  // Associations
  ResidentEmployment.associate = function (models) {
    // Employment belongs to a resident
    ResidentEmployment.belongsTo(models.Resident, {
      foreignKey: "resident_id",
      as: "resident",
    });

    // Employment created/updated by user
    ResidentEmployment.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });

    ResidentEmployment.belongsTo(models.User, {
      foreignKey: "updated_by",
      as: "updater",
    });

    // Note: employment_verified_by column doesn't exist in the migration, so association removed
  };

  return ResidentEmployment;
};
