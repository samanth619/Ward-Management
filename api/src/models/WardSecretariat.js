const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WardSecretariat = sequelize.define('WardSecretariat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    secretariat_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Unique secretariat identification code'
    },
    secretariat_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    ward_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    area_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    mandal: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Mandal or administrative division'
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Telangana'
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [6, 10]
      }
    },
    secretariat_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Secretary or in-charge person name'
    },
    contact_phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s-()]+$/i
      }
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    office_hours: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '09:00', close: '13:00' },
        sunday: { open: null, close: null }
      }
    },
    total_households: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    total_population: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    government_offices_nearby: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of nearby government offices and landmarks'
    },
    landmarks: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of important landmarks in the area'
    },
    services_available: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Services available at this secretariat'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    established_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    additional_info: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional secretariat information'
    }
  }, {
    tableName: 'ward_secretariats',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['secretariat_code']
      },
      {
        fields: ['ward_number']
      },
      {
        fields: ['area_name']
      },
      {
        fields: ['district']
      },
      {
        fields: ['pincode']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  // Instance methods
  WardSecretariat.prototype.getFullAddress = function() {
    let address = this.secretariat_name;
    if (this.secretariat_address) address += ', ' + this.secretariat_address;
    if (this.area_name) address += ', ' + this.area_name;
    if (this.mandal) address += ', ' + this.mandal;
    address += ', ' + this.district + ', ' + this.state + ' - ' + this.pincode;
    return address;
  };

  WardSecretariat.prototype.updatePopulationStats = async function() {
    const households = await this.getHouseholds();
    this.total_households = households.length;
    
    let totalPopulation = 0;
    for (const household of households) {
      totalPopulation += household.total_members;
    }
    this.total_population = totalPopulation;
    
    await this.save();
  };

  // Class methods
  WardSecretariat.findByWardNumber = function(wardNumber) {
    return this.findOne({
      where: { ward_number: wardNumber, is_active: true }
    });
  };

  WardSecretariat.findByArea = function(areaName) {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        area_name: { [Op.iLike]: `%${areaName}%` },
        is_active: true
      }
    });
  };

  WardSecretariat.findByDistrict = function(district) {
    return this.findAll({
      where: { district, is_active: true },
      order: [['area_name', 'ASC']]
    });
  };

  // Associations
  WardSecretariat.associate = function(models) {
    // WardSecretariat has many households
    WardSecretariat.hasMany(models.Household, {
      foreignKey: 'ward_secretariat_id',
      as: 'households'
    });

    // WardSecretariat has many users (staff assigned to this ward)
    WardSecretariat.hasMany(models.User, {
      foreignKey: 'assigned_ward_secretariat_id',
      as: 'assigned_staff'
    });
  };

  return WardSecretariat;
};