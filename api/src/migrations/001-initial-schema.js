const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ENUM types first
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- User role enum
        CREATE TYPE user_role AS ENUM ('admin', 'staff', 'read_only');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- Property type enum
        CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'mixed', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- Ownership type enum
        CREATE TYPE ownership_type AS ENUM ('owned', 'rented', 'leased', 'government', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- Verification status enum
        CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'needs_update');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Continue with other ENUMs...
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
        CREATE TYPE marital_status AS ENUM ('single', 'married', 'divorced', 'widowed', 'separated');
        CREATE TYPE relationship_type AS ENUM ('head', 'spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other_relative', 'tenant', 'servant', 'other');
        CREATE TYPE education_level AS ENUM ('illiterate', 'primary', 'secondary', 'higher_secondary', 'graduate', 'post_graduate', 'professional', 'other');
        CREATE TYPE category_type AS ENUM ('general', 'obc', 'sc', 'st', 'other');
        CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
        CREATE TYPE ration_card_type AS ENUM ('apl', 'bpl', 'aay', 'none');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create Users table
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('admin', 'staff', 'read_only'),
        allowNull: false,
        defaultValue: 'staff'
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      ward_number: {
        type: DataTypes.STRING(10),
        allowNull: true
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
        allowNull: true
      },
      preferences: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });

    // Create Households table
    await queryInterface.createTable('households', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      household_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      address_line1: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      landmark: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pincode: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      ward_number: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      area: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Municipal Ward'
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
      },
      property_type: {
        type: DataTypes.ENUM('residential', 'commercial', 'mixed', 'other'),
        allowNull: false,
        defaultValue: 'residential'
      },
      ownership_type: {
        type: DataTypes.ENUM('owned', 'rented', 'leased', 'government', 'other'),
        allowNull: false,
        defaultValue: 'owned'
      },
      total_members: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      adult_members: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      children_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      senior_citizens_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      electricity_connection: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      water_connection: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      gas_connection: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      internet_connection: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_bpl: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      ration_card_type: {
        type: DataTypes.ENUM('apl', 'bpl', 'aay', 'none'),
        allowNull: true
      },
      primary_contact_number: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      secondary_contact_number: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      verification_status: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected', 'needs_update'),
        defaultValue: 'pending'
      },
      verified_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      additional_info: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });

    // Add indexes for households
    await queryInterface.addIndex('households', ['household_number'], { unique: true });
    await queryInterface.addIndex('households', ['ward_number']);
    await queryInterface.addIndex('households', ['pincode']);
    await queryInterface.addIndex('households', ['verification_status']);

    console.log('✅ Initial migration completed - Users and Households tables created');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('households');
    await queryInterface.dropTable('users');
    
    // Drop ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS user_role CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS property_type CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS ownership_type CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS verification_status CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS gender_type CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS marital_status CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS relationship_type CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS education_level CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS category_type CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS blood_group CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS ration_card_type CASCADE;');
  }
};