const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Household = sequelize.define(
    "Household",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      household_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: "Unique household identification number",
      },
      address_line1: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [5, 255],
        },
      },
      address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      landmark: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          isNumeric: true,
          len: [5, 10],
        },
      },
      ward_secretariat_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "ward_secretariats",
          key: "id",
        },
        comment: "Reference to ward secretariat",
      },
      area: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Area or locality name",
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "Municipal Ward",
        validate: {
          notEmpty: true,
        },
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        validate: {
          min: -90,
          max: 90,
        },
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        validate: {
          min: -180,
          max: 180,
        },
      },
      property_type: {
        type: DataTypes.ENUM("residential", "commercial", "mixed", "other"),
        allowNull: false,
        defaultValue: "residential",
      },
      ownership_type: {
        type: DataTypes.ENUM(
          "owned",
          "rented",
          "leased",
          "government",
          "other"
        ),
        allowNull: false,
        defaultValue: "owned",
      },
      total_members: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      adult_members: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      children_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      senior_citizens_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      electricity_connection: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      water_connection: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      gas_connection: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      internet_connection: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_bpl: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Below Poverty Line status",
      },
      ration_card_type: {
        type: DataTypes.ENUM("apl", "bpl", "aay", "none"),
        allowNull: true,
        comment:
          "APL: Above Poverty Line, BPL: Below Poverty Line, AAY: Antyodaya Anna Yojana",
      },
      primary_contact_number: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
          is: /^[+]?[\d\s-()]+$/i,
        },
      },
      secondary_contact_number: {
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
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      verification_status: {
        type: DataTypes.ENUM("pending", "verified", "rejected", "needs_update"),
        defaultValue: "pending",
      },
      verified_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      additional_info: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: "Additional household information in JSON format",
      },
    },
    {
      tableName: "households",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true, // Soft delete
      deletedAt: "deleted_at",
      indexes: [
        {
          unique: true,
          fields: ["household_number"],
        },
        {
          fields: ["ward_secretariat_id"],
        },
        {
          fields: ["pincode"],
        },
        {
          fields: ["area"],
        },
        {
          fields: ["property_type"],
        },
        {
          fields: ["verification_status"],
        },
        {
          fields: ["is_bpl"],
        },
        {
          name: "household_location_idx",
          fields: ["latitude", "longitude"],
        },
      ],
    }
  );

  // Instance methods
  Household.prototype.getFullAddress = function () {
    let address = this.address_line1;
    if (this.address_line2) address += ", " + this.address_line2;
    if (this.landmark) address += ", Near " + this.landmark;
    if (this.area) address += ", " + this.area;
    address += ", " + this.city + ", " + this.state + " - " + this.pincode;
    return address;
  };

  Household.prototype.updateMemberCounts = async function () {
    const residents = await this.getResidents();
    this.total_members = residents.length;
    this.adult_members = residents.filter(
      (r) => r.age >= 18 && r.age < 60
    ).length;
    this.children_count = residents.filter((r) => r.age < 18).length;
    this.senior_citizens_count = residents.filter((r) => r.age >= 60).length;
    await this.save();
  };

  // Class methods
  Household.findByWardSecretariat = function (wardSecretariatId) {
    return this.findAll({
      where: { ward_secretariat_id: wardSecretariatId },
      include: ["residents"],
    });
  };

  Household.findByVerificationStatus = function (status) {
    return this.findAll({
      where: { verification_status: status },
    });
  };

  Household.findBPLHouseholds = function () {
    return this.findAll({
      where: { is_bpl: true },
    });
  };

  // Associations
  Household.associate = function (models) {
    // Household belongs to ward secretariat
    Household.belongsTo(models.WardSecretariat, {
      foreignKey: "ward_secretariat_id",
      as: "ward_secretariat",
    });

    // Household has many residents
    Household.hasMany(models.Resident, {
      foreignKey: "household_id",
      as: "residents",
      onDelete: "CASCADE",
    });

    // Household belongs to verifying user
    Household.belongsTo(models.User, {
      foreignKey: "verified_by",
      as: "verifying_user",
    });

    // Household has many conversations through residents
    Household.hasMany(models.Conversation, {
      foreignKey: "household_id",
      as: "conversations",
    });
  };

  return Household;
};

//WARD SECRETERIAT NAME: SREERAMULAPETA 					SECRETERIATE CODE:21007005							AREA: SRI KRISHNA DEVARAYA STATUE
