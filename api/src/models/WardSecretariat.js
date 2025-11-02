const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WardSecretariat = sequelize.define('WardSecretariat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    ward_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    ward_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    secretariat_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    secretariat_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    area_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_population: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    total_households: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    male_population: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    female_population: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    other_population: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    secretary_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    secretary_phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    secretary_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    assistant_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    assistant_phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    office_address: {
      type: DataTypes.TEXT,
      allowNull: true
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
    services_offered: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of services offered at this secretariat'
    },
    gps_coordinates: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    establishment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'ward_secretariats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,
    indexes: [
      {
        fields: ['ward_number']
      },
      {
        fields: ['secretariat_code']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  WardSecretariat.associate = function(models) {
    WardSecretariat.hasMany(models.Household, {
      foreignKey: 'ward_secretariat_id',
      as: 'households'
    });

    WardSecretariat.belongsTo(models.User, {
      foreignKey: 'last_updated_by',
      as: 'updater'
    });
  };

  return WardSecretariat;
};
