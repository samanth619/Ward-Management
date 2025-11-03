const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Scheme = sequelize.define(
    "Scheme",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      scheme_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        comment: "Unique scheme identification code",
      },
      scheme_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "name", // Maps to 'name' column in database
        validate: {
          notEmpty: true,
          len: [2, 255],
        },
      },
      implementing_department: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "department", // Maps to 'department' column in database
        comment: "Government department implementing the scheme",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      benefits: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Benefits provided under the scheme",
      },
      eligibility_criteria: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        comment: "Eligibility criteria in structured format",
      },
      required_documents: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of required documents",
      },
      application_process: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "How to apply for the scheme",
      },
      scheme_status: {
        type: DataTypes.ENUM("active", "inactive", "suspended", "closed"),
        field: "status", // Maps to 'status' column in database
        defaultValue: "active",
      },
      start_date: {
        type: DataTypes.DATEONLY,
        field: "start_date",
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "End date if scheme has a time limit",
      },
      budget_allocated: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      budget_utilized: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      contact_person: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      contact_phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      contact_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      website_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      additional_info: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: "schemes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          unique: true,
          fields: ["scheme_code"],
        },
        {
          fields: [["department"]], // Using array syntax for field mapping
        },
        {
          fields: [["status"]], // Using array syntax for field mapping
        },
        {
          fields: ["category"],
        },
      ],
    }
  );

  // Instance methods
  Scheme.prototype.isActive = function () {
    const now = new Date();
    return (
      this.scheme_status === "active" &&
      (!this.end_date || new Date(this.end_date) > now)
    );
  };

  Scheme.prototype.isEligible = function (resident, household) {
    // Basic eligibility check - use eligibility_criteria from JSONB field
    // This is a simplified check; actual eligibility should be determined by
    // parsing the eligibility_criteria JSONB field
    return true;
  };

  // Class methods
  Scheme.findActiveSchemes = function () {
    const { Op } = sequelize.Sequelize;
    const today = new Date();

    return this.findAll({
      where: {
        scheme_status: "active",
        [Op.or]: [{ end_date: null }, { end_date: { [Op.gt]: today } }],
      },
      order: [["scheme_name", "ASC"]],
    });
  };

  Scheme.findByCategory = function (category) {
    return this.findAll({
      where: {
        category: category,
        scheme_status: "active",
      },
      order: [["scheme_name", "ASC"]],
    });
  };

  Scheme.findByDepartment = function (department) {
    return this.findAll({
      where: {
        implementing_department: department, // Uses field mapping to 'department' column
        scheme_status: "active",
      },
      order: [["scheme_name", "ASC"]],
    });
  };

  Scheme.findEligibleSchemes = function (resident, household) {
    // This would typically be done with a more complex query
    // For now, we'll fetch all active schemes and filter in application logic
    return this.findActiveSchemes();
  };

  Scheme.findExpiringSchemes = function (days = 30) {
    const { Op } = sequelize.Sequelize;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.findAll({
      where: {
        scheme_status: "active",
        end_date: {
          [Op.between]: [new Date(), endDate],
        },
      },
      order: [["end_date", "ASC"]],
    });
  };

  // Associations
  Scheme.associate = function (models) {
    // Scheme has many enrollments
    Scheme.hasMany(models.SchemeEnrollment, {
      foreignKey: "scheme_id",
      as: "enrollments",
    });

    // Many-to-many relationship with residents (through SchemeEnrollment)
    Scheme.belongsToMany(models.Resident, {
      through: models.SchemeEnrollment,
      foreignKey: "scheme_id",
      otherKey: "resident_id",
      as: "enrolled_residents",
    });
  };

  return Scheme;
};
