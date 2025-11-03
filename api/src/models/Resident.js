const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Resident = sequelize.define(
    "Resident",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      household_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "households",
          key: "id",
        },
      },
      resident_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: "Unique resident identification number",
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
      },
      middle_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isBefore: new Date().toISOString().split("T")[0], // Must be in the past
        },
      },
      age: {
        type: DataTypes.VIRTUAL,
        get() {
          const today = new Date();
          const birthDate = new Date(this.date_of_birth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          return age;
        },
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other", "prefer_not_to_say"),
        allowNull: false,
        validate: {
          isIn: [["male", "female", "other", "prefer_not_to_say"]],
        },
      },
      marital_status: {
        type: DataTypes.ENUM(
          "single",
          "married",
          "divorced",
          "widowed",
          "separated"
        ),
        allowNull: true,
      },
      relationship_to_head: {
        type: DataTypes.ENUM(
          "head",
          "spouse",
          "child",
          "parent",
          "sibling",
          "grandparent",
          "grandchild",
          "other_relative",
          "tenant",
          "servant",
          "other"
        ),
        allowNull: false,
        defaultValue: "other",
      },
      phone_number: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
          is: /^[+]?[\d\s-()]+$/i,
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      occupation: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      education_level: {
        type: DataTypes.ENUM(
          "illiterate",
          "primary",
          "secondary",
          "higher_secondary",
          "graduate",
          "post_graduate",
          "professional",
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
      religion: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      caste: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      category: {
        type: DataTypes.ENUM("general", "obc", "sc", "st", "other"),
        allowNull: true,
      },
      blood_group: {
        type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
        allowNull: true,
      },
      is_disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      disability_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      is_senior_citizen: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.age >= 60;
        },
      },
      is_minor: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.age < 18;
        },
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "URL or path to profile picture",
      },
      is_head_of_household: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      health_conditions: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of health conditions",
      },
      government_schemes: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of government schemes beneficiary of",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Whether the resident is currently living at this address",
      },
      anniversary_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Wedding anniversary date, if applicable",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      additional_info: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: "Additional resident information in JSON format",
      },
    },
    {
      tableName: "residents",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: true, // Soft delete
      deletedAt: 'deleted_at',
      indexes: [
        {
          unique: true,
          fields: ["resident_id"],
        },
        {
          fields: ["household_id"],
        },
        {
          fields: ["first_name", "last_name"],
        },
        {
          fields: ["date_of_birth"],
        },
        {
          fields: ["gender"],
        },
        {
          fields: ["occupation"],
        },
        {
          fields: ["is_head_of_household"],
        },
        {
          fields: ["is_active"],
        },
        {
          fields: ["phone_number"],
        },
        {
          fields: ["email"],
        },
      ],
      hooks: {
        beforeCreate: (resident) => {
          // Auto-generate resident_id if not provided
          if (!resident.resident_id) {
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, "0");
            resident.resident_id = `RES${timestamp}${random}`;
          }
        },
      },
    }
  );

  // Instance methods
  Resident.prototype.getFullName = function () {
    let fullName = this.first_name;
    if (this.middle_name) fullName += " " + this.middle_name;
    fullName += " " + this.last_name;
    return fullName;
  };

  Resident.prototype.getUpcomingBirthday = function () {
    const today = new Date();
    const thisYear = today.getFullYear();
    const birthDate = new Date(this.date_of_birth);
    let birthday = new Date(
      thisYear,
      birthDate.getMonth(),
      birthDate.getDate()
    );

    if (birthday < today) {
      birthday.setFullYear(thisYear + 1);
    }

    return birthday;
  };

  Resident.prototype.getUpcomingAnniversary = function () {
    if (!this.anniversary_date) return null;

    const today = new Date();
    const thisYear = today.getFullYear();
    const anniversaryDate = new Date(this.anniversary_date);
    let anniversary = new Date(
      thisYear,
      anniversaryDate.getMonth(),
      anniversaryDate.getDate()
    );

    if (anniversary < today) {
      anniversary.setFullYear(thisYear + 1);
    }

    return anniversary;
  };

  // Class methods
  Resident.findByHousehold = function (householdId) {
    return this.findAll({
      where: { household_id: householdId, is_active: true },
      order: [
        ["is_head_of_household", "DESC"],
        ["date_of_birth", "ASC"],
      ],
    });
  };

  Resident.findHeadsOfHousehold = function () {
    return this.findAll({
      where: { is_head_of_household: true, is_active: true },
      include: ["household"],
    });
  };

  Resident.findBirthdays = function (startDate, endDate) {
    const { Op } = sequelize.Sequelize;
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    return this.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          sequelize.where(
            sequelize.fn(
              "EXTRACT",
              sequelize.literal("MONTH FROM date_of_birth")
            ),
            { [Op.between]: [startMonth, endMonth] }
          ),
          sequelize.where(
            sequelize.fn(
              "EXTRACT",
              sequelize.literal("DAY FROM date_of_birth")
            ),
            { [Op.between]: [startDay, endDay] }
          ),
        ],
      },
      include: ["household"],
    });
  };

  Resident.findAnniversaries = function (startDate, endDate) {
    const { Op } = sequelize.Sequelize;
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    return this.findAll({
      where: {
        is_active: true,
        anniversary_date: { [Op.ne]: null },
        [Op.or]: [
          sequelize.where(
            sequelize.fn(
              "EXTRACT",
              sequelize.literal("MONTH FROM anniversary_date")
            ),
            { [Op.between]: [startMonth, endMonth] }
          ),
          sequelize.where(
            sequelize.fn(
              "EXTRACT",
              sequelize.literal("DAY FROM anniversary_date")
            ),
            { [Op.between]: [startDay, endDay] }
          ),
        ],
      },
      include: ["household"],
    });
  };

  Resident.findSeniorCitizens = function () {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 60);

    return this.findAll({
      where: {
        is_active: true,
        date_of_birth: { [sequelize.Sequelize.Op.lte]: cutoffDate },
      },
      include: ["household"],
    });
  };

  Resident.searchByName = function (searchTerm) {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${searchTerm}%` } },
          { middle_name: { [Op.iLike]: `%${searchTerm}%` } },
          { last_name: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      include: ["household"],
    });
  };

  // Associations
  Resident.associate = function (models) {
    // Resident belongs to household
    Resident.belongsTo(models.Household, {
      foreignKey: "household_id",
      as: "household",
    });

    // Resident has many conversations
    Resident.hasMany(models.Conversation, {
      foreignKey: "resident_id",
      as: "conversations",
    });

    // Resident has many notification logs
    Resident.hasMany(models.NotificationLog, {
      foreignKey: "resident_id",
      as: "notifications",
    });

    // Resident has many scheme enrollments
    Resident.hasMany(models.SchemeEnrollment, {
      foreignKey: "resident_id",
      as: "scheme_enrollments",
    });

    // Many-to-many relationship with schemes (through SchemeEnrollment)
    Resident.belongsToMany(models.Scheme, {
      through: models.SchemeEnrollment,
      foreignKey: "resident_id",
      otherKey: "scheme_id",
      as: "enrolled_schemes",
    });

    // Resident has one bank details record
    Resident.hasOne(models.ResidentBankDetails, {
      foreignKey: "resident_id",
      as: "bank_details",
    });

    // Resident has many emergency contacts
    Resident.hasMany(models.ResidentEmergencyContact, {
      foreignKey: "resident_id",
      as: "emergency_contacts",
    });

    // Resident has one KYC record
    Resident.hasOne(models.ResidentKYC, {
      foreignKey: "resident_id",
      as: "kyc_details",
    });

    // Resident has many employment records (can have employment history)
    Resident.hasMany(models.ResidentEmployment, {
      foreignKey: "resident_id",
      as: "employment_records",
    });
  };

  return Resident;
};
