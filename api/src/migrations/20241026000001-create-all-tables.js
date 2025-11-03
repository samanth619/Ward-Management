"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM types first
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- User role enum
        CREATE TYPE user_role AS ENUM ('admin', 'staff', 'read_only');
        
        -- Property type enum
        CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'mixed', 'other');
        
        -- Ownership type enum
        CREATE TYPE ownership_type AS ENUM ('owned', 'rented', 'leased', 'government', 'other');
        
        -- Verification status enum
        CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'needs_update');
        
        -- Gender enum
        CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
        
        -- Marital status enum
        CREATE TYPE marital_status AS ENUM ('single', 'married', 'divorced', 'widowed', 'separated');
        
        -- Relationship type enum
        CREATE TYPE relationship_type AS ENUM ('head', 'spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other_relative', 'tenant', 'servant', 'other');
        
        -- Education level enum
        CREATE TYPE education_level AS ENUM ('illiterate', 'primary', 'secondary', 'higher_secondary', 'graduate', 'post_graduate', 'professional', 'other');
        
        -- Category type enum
        CREATE TYPE category_type AS ENUM ('general', 'obc', 'sc', 'st', 'other');
        
        -- Blood group enum
        CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
        
        -- Ration card type enum
        CREATE TYPE ration_card_type AS ENUM ('apl', 'bpl', 'aay', 'none');
        
        -- Employment status enum
        CREATE TYPE employment_status AS ENUM ('employed', 'unemployed', 'self_employed', 'retired', 'student', 'other');
        
        -- Scheme status enum
        CREATE TYPE scheme_status AS ENUM ('active', 'inactive', 'suspended', 'completed');
        
        -- Enrollment status enum
        CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'completed');
        
        -- Event type enum
        CREATE TYPE event_type AS ENUM ('meeting', 'announcement', 'service', 'emergency', 'other');
        
        -- Notification type enum
        CREATE TYPE notification_type AS ENUM ('sms', 'email', 'push', 'system');
        
        -- Notification status enum
        CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');
        
        -- Bank account type enum
        CREATE TYPE bank_account_type AS ENUM ('savings', 'current', 'fixed_deposit', 'recurring_deposit', 'overdraft');
        
        -- Priority level enum
        CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
        
        -- Verification method enum
        CREATE TYPE verification_method AS ENUM ('penny_drop', 'passbook', 'cheque', 'statement', 'manual', 'otp', 'biometric', 'e_kyc', 'phone_call', 'sms', 'in_person', 'document');
        
        -- Contact type enum
        CREATE TYPE contact_type AS ENUM ('primary', 'secondary', 'medical', 'local_guardian');
        
        -- KYC status enum
        CREATE TYPE kyc_status AS ENUM ('pending', 'partial', 'complete', 'rejected');
        
        -- Employment status enum (extended)
        CREATE TYPE employment_status_extended AS ENUM ('employed', 'unemployed', 'self_employed', 'student', 'homemaker', 'retired', 'differently_abled', 'seeking_employment');
        
        -- Employment type enum
        CREATE TYPE employment_type AS ENUM ('permanent', 'contract', 'part_time', 'freelance', 'daily_wage', 'seasonal');
        
        -- Work sector enum
        CREATE TYPE work_sector AS ENUM ('government', 'private', 'ngo', 'self_employed', 'agriculture', 'construction', 'manufacturing', 'services', 'it', 'healthcare', 'education', 'retail', 'other');
        
        -- Qualification enum
        CREATE TYPE qualification_level AS ENUM ('below_10th', '10th_pass', '12th_pass', 'diploma', 'graduation', 'post_graduation', 'phd', 'professional_course');
        
        -- Computer literacy enum
        CREATE TYPE computer_literacy AS ENUM ('none', 'basic', 'intermediate', 'advanced');
        
        -- Ration card type enum (extended)
        CREATE TYPE ration_card_type_extended AS ENUM ('apl', 'bpl', 'aay', 'phh');
        
        -- Caste category enum (extended)
        CREATE TYPE caste_category AS ENUM ('general', 'obc', 'sc', 'st', 'ews');
        
        -- Preferred job type enum
        CREATE TYPE preferred_job_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'work_from_home', 'flexible');
        
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 1. Create ward_secretariats table (must be created before users due to FK)
    await queryInterface.createTable("ward_secretariats", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      ward_number: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
      },
      ward_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      secretariat_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      secretariat_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      area_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      total_population: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      total_households: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      male_population: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      female_population: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      other_population: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      secretary_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      secretary_phone: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      secretary_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      assistant_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      assistant_phone: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      office_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      office_hours: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      services_offered: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "Array of services offered at this secretariat",
      },
      gps_coordinates: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pincode: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      establishment_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        // FK constraint will be added after users table is created
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 2. Create users table
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: "user_role",
        allowNull: false,
        defaultValue: "staff",
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      ward_secretariat_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "ward_secretariats",
          key: "id",
        },
        comment: "Reference to ward secretariat for staff users",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      email_verification_token: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      password_reset_token: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      profile_picture: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      preferences: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add FK constraint for ward_secretariats.last_updated_by (references users)
    await queryInterface.addConstraint("ward_secretariats", {
      fields: ["last_updated_by"],
      type: "foreign key",
      name: "ward_secretariats_last_updated_by_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // 3. Create households table
    await queryInterface.createTable("households", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      household_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      address_line1: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address_line2: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      landmark: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pincode: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      ward_secretariat_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "ward_secretariats",
          key: "id",
        },
      },
      area: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: "Municipal Ward",
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      property_type: {
        type: "property_type",
        allowNull: false,
        defaultValue: "residential",
      },
      ownership_type: {
        type: "ownership_type",
        allowNull: false,
        defaultValue: "owned",
      },
      total_members: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      adult_members: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      children_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      senior_citizens_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      electricity_connection: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      water_connection: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      gas_connection: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      internet_connection: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      is_bpl: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      ration_card_type: {
        type: "ration_card_type",
        allowNull: true,
      },
      primary_contact_number: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      secondary_contact_number: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verification_status: {
        type: "verification_status",
        defaultValue: "pending",
        allowNull: true,
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      additional_info: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // 4. Create residents table
    await queryInterface.createTable("residents", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "households",
          key: "id",
        },
      },
      resident_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: "Unique resident identification number",
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      middle_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      gender: {
        type: "gender_type",
        allowNull: false,
      },
      marital_status: {
        type: "marital_status",
        allowNull: true,
      },
      relationship_to_head: {
        type: "relationship_type",
        allowNull: false,
        defaultValue: "other",
      },
      phone_number: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      occupation: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      education_level: {
        type: "education_level",
        allowNull: true,
      },
      monthly_income: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      religion: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      caste: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      category: {
        type: "category_type",
        allowNull: true,
      },
      blood_group: {
        type: "blood_group",
        allowNull: true,
      },
      is_disabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      disability_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      profile_picture: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "URL or path to profile picture",
      },
      is_head_of_household: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      health_conditions: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of health conditions",
      },
      government_schemes: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of government schemes beneficiary of",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Whether the resident is currently living at this address",
      },
      anniversary_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "Wedding anniversary date, if applicable",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      additional_info: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: "Additional resident information in JSON format",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // 5. Create resident_bank_details table
    await queryInterface.createTable("resident_bank_details", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      resident_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "residents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      bank_account_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      bank_ifsc_code: {
        type: Sequelize.STRING(11),
        allowNull: true,
      },
      bank_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bank_branch: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      account_holder_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "Name as per bank records",
      },
      account_type: {
        type: "bank_account_type",
        allowNull: true,
        defaultValue: "savings",
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether bank details have been verified",
      },
      verification_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verification_method: {
        type: "verification_method",
        allowNull: true,
      },
      is_primary_account: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Primary account for benefit transfers",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      upi_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    });

    // 6. Create resident_emergency_contacts table
    await queryInterface.createTable("resident_emergency_contacts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      resident_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "residents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      contact_type: {
        type: "contact_type",
        allowNull: false,
        defaultValue: "primary",
      },
      contact_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      relationship: {
        type: Sequelize.ENUM(
          "spouse",
          "father",
          "mother",
          "son",
          "daughter",
          "brother",
          "sister",
          "grandfather",
          "grandmother",
          "uncle",
          "aunt",
          "nephew",
          "niece",
          "cousin",
          "friend",
          "neighbor",
          "colleague",
          "guardian",
          "other"
        ),
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      alternative_phone: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pincode: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      occupation: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      workplace: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      is_local_resident: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Whether the contact lives in the same ward/area",
      },
      is_available_24x7: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether this contact is available round the clock",
      },
      medical_authorization: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether this contact is authorized for medical decisions",
      },
      can_pick_up_documents: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether this contact can collect documents on behalf",
      },
      priority_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "Priority order for contacting (1 = highest priority)",
      },
      last_contacted_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_contacted_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      contact_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Notes about contacting this person",
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether contact details have been verified",
      },
      verification_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verification_method: {
        type: "verification_method",
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      deactivation_reason: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    });

    // 7. Create resident_kyc table
    await queryInterface.createTable("resident_kyc", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      resident_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "residents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      aadhaar_number: {
        type: Sequelize.STRING(12),
        allowNull: true,
        unique: true,
      },
      aadhaar_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "Name as per Aadhaar card",
      },
      aadhaar_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      aadhaar_verification_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      aadhaar_verification_method: {
        type: "verification_method",
        allowNull: true,
      },
      pan_number: {
        type: Sequelize.STRING(10),
        allowNull: true,
        unique: true,
      },
      pan_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "Name as per PAN card",
      },
      pan_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      pan_verification_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      voter_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      voter_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "Name as per Voter ID",
      },
      voter_id_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      voter_id_verification_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      assembly_constituency: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      parliamentary_constituency: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      polling_station: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      passport_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      passport_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      passport_place_of_issue: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      passport_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      ration_card_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      ration_card_type: {
        type: "ration_card_type_extended",
        allowNull: true,
      },
      ration_card_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      arogyasri_card_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "Telangana Arogyasri health insurance card number",
      },
      arogyasri_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      rice_card_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "Rice card number",
      },
      rice_card_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      caste_certificate_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      caste_category: {
        type: "caste_category",
        allowNull: true,
      },
      caste_certificate_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      kyc_status: {
        type: "kyc_status",
        defaultValue: "pending",
      },
      kyc_completion_percentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      mandatory_documents_submitted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      last_kyc_update_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      next_kyc_review_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      kyc_reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      kyc_rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      document_storage_path: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: "File system path or cloud storage reference for documents",
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    });

    // 8. Create resident_employment table
    await queryInterface.createTable("resident_employment", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      resident_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "residents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      employment_status: {
        type: "employment_status_extended",
        allowNull: false,
        defaultValue: "unemployed",
      },
      current_occupation: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      job_title: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      employment_type: {
        type: "employment_type",
        allowNull: true,
      },
      work_sector: {
        type: "work_sector",
        allowNull: true,
      },
      monthly_income: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      seeking_employment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether the resident is actively seeking employment",
      },
      preferred_job_type: {
        type: "preferred_job_type",
        allowNull: true,
      },
      preferred_sectors: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "JSON array of preferred work sectors",
      },
      highest_qualification: {
        type: "qualification_level",
        allowNull: true,
      },
      qualification_details: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Detailed qualification information in JSON format",
      },
      technical_skills: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "JSON array of technical skills",
      },
      certifications: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "JSON array of professional certifications",
      },
      language_skills: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "JSON object with language proficiency levels",
      },
      computer_literacy: {
        type: "computer_literacy",
        allowNull: true,
        defaultValue: "none",
      },
      work_experience_years: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    });

    // 9. Create schemes table
    await queryInterface.createTable("schemes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      scheme_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      eligibility_criteria: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      benefits: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      required_documents: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      application_process: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: "scheme_status",
        defaultValue: "active",
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      budget_allocated: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      budget_utilized: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      contact_person: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      contact_phone: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      website_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      additional_info: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // 10. Create scheme_enrollments table
    await queryInterface.createTable("scheme_enrollments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      scheme_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "schemes",
          key: "id",
        },
      },
      resident_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "residents",
          key: "id",
        },
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "households",
          key: "id",
        },
      },
      application_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      application_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: "enrollment_status",
        defaultValue: "pending",
        allowNull: true,
      },
      applied_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      approval_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      benefit_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      benefit_received: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      documents_submitted: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      additional_info: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // 11. Create conversations table
    await queryInterface.createTable("conversations", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      resident_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "residents",
          key: "id",
        },
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "households",
          key: "id",
        },
      },
      staff_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      priority: {
        type: "priority_level",
        defaultValue: "medium",
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: "open",
        allowNull: true,
      },
      channel: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      attachments: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "conversations",
          key: "id",
        },
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      resolved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      additional_info: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // 12. Create events table
    await queryInterface.createTable("events", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      event_type: {
        type: "event_type",
        allowNull: true,
        defaultValue: "announcement",
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      organizer: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      contact_info: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      registration_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      target_audience: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      attachments: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: "scheduled",
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      ward_secretariat_ids: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of ward secretariat IDs (UUIDs) this event is for",
      },
      additional_info: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // 13. Create notification_logs table
    await queryInterface.createTable("notification_logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      recipient_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "residents",
          key: "id",
        },
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "households",
          key: "id",
        },
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "events",
          key: "id",
        },
      },
      type: {
        type: "notification_type",
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      recipient_contact: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: "notification_status",
        defaultValue: "pending",
        allowNull: true,
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 14. Create audit_trails table
    await queryInterface.createTable("audit_trails", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      old_values: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      new_values: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      changed_fields: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      session_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      request_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      severity: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create indexes for better performance
    await queryInterface.addIndex("users", ["email"]);
    await queryInterface.addIndex("users", ["role"]);
    await queryInterface.addIndex("users", ["ward_secretariat_id"]);
    await queryInterface.addIndex("users", ["is_active"]);

    await queryInterface.addIndex("ward_secretariats", ["ward_number"]);
    await queryInterface.addIndex("ward_secretariats", ["secretariat_code"]);
    await queryInterface.addIndex("ward_secretariats", ["is_active"]);

    await queryInterface.addIndex("households", ["household_number"]);
    await queryInterface.addIndex("households", ["ward_secretariat_id"]);
    await queryInterface.addIndex("households", ["pincode"]);
    await queryInterface.addIndex("households", ["verification_status"]);

    await queryInterface.addIndex("residents", ["resident_id"], {
      unique: true,
    });
    await queryInterface.addIndex("residents", ["household_id"]);
    await queryInterface.addIndex("residents", ["first_name", "last_name"]);
    await queryInterface.addIndex("residents", ["date_of_birth"]);
    await queryInterface.addIndex("residents", ["gender"]);
    await queryInterface.addIndex("residents", ["occupation"]);
    await queryInterface.addIndex("residents", ["is_head_of_household"]);
    await queryInterface.addIndex("residents", ["is_active"]);
    await queryInterface.addIndex("residents", ["phone_number"]);
    await queryInterface.addIndex("residents", ["email"]);

    await queryInterface.addIndex("resident_bank_details", ["resident_id"]);
    await queryInterface.addIndex("resident_bank_details", [
      "bank_account_number",
    ]);
    await queryInterface.addIndex("resident_bank_details", ["bank_ifsc_code"]);
    await queryInterface.addIndex("resident_bank_details", ["is_verified"]);
    await queryInterface.addIndex("resident_bank_details", [
      "is_primary_account",
    ]);

    await queryInterface.addIndex("resident_emergency_contacts", [
      "resident_id",
    ]);
    await queryInterface.addIndex("resident_emergency_contacts", [
      "phone_number",
    ]);
    await queryInterface.addIndex("resident_emergency_contacts", [
      "contact_type",
    ]);
    await queryInterface.addIndex("resident_emergency_contacts", [
      "priority_order",
    ]);
    await queryInterface.addIndex("resident_emergency_contacts", ["is_active"]);

    await queryInterface.addIndex("resident_kyc", ["resident_id"]);
    await queryInterface.addIndex("resident_kyc", ["aadhaar_number"]);
    await queryInterface.addIndex("resident_kyc", ["pan_number"]);
    await queryInterface.addIndex("resident_kyc", ["voter_id"]);
    await queryInterface.addIndex("resident_kyc", ["kyc_status"]);
    await queryInterface.addIndex("resident_kyc", [
      "kyc_completion_percentage",
    ]);
    await queryInterface.addIndex("resident_kyc", ["caste_category"]);

    await queryInterface.addIndex("resident_employment", ["resident_id"]);
    await queryInterface.addIndex("resident_employment", ["employment_status"]);
    await queryInterface.addIndex("resident_employment", [
      "seeking_employment",
    ]);
    await queryInterface.addIndex("resident_employment", ["work_sector"]);
    await queryInterface.addIndex("resident_employment", [
      "highest_qualification",
    ]);

    await queryInterface.addIndex("schemes", ["scheme_code"]);
    await queryInterface.addIndex("schemes", ["status"]);
    await queryInterface.addIndex("schemes", ["department"]);

    await queryInterface.addIndex("scheme_enrollments", ["scheme_id"]);
    await queryInterface.addIndex("scheme_enrollments", ["resident_id"]);
    await queryInterface.addIndex("scheme_enrollments", ["application_number"]);
    await queryInterface.addIndex("scheme_enrollments", ["status"]);

    await queryInterface.addIndex("conversations", ["resident_id"]);
    await queryInterface.addIndex("conversations", ["household_id"]);
    await queryInterface.addIndex("conversations", ["staff_id"]);
    await queryInterface.addIndex("conversations", ["status"]);
    await queryInterface.addIndex("conversations", ["priority"]);

    await queryInterface.addIndex("events", ["event_type"]);
    await queryInterface.addIndex("events", ["start_date"]);
    await queryInterface.addIndex("events", ["status"]);
    await queryInterface.addIndex("events", ["created_by"]);

    await queryInterface.addIndex("notification_logs", ["recipient_id"]);
    await queryInterface.addIndex("notification_logs", ["type"]);
    await queryInterface.addIndex("notification_logs", ["status"]);
    await queryInterface.addIndex("notification_logs", ["sent_at"]);

    await queryInterface.addIndex("audit_trails", ["entity_type"]);
    await queryInterface.addIndex("audit_trails", ["entity_id"]);
    await queryInterface.addIndex("audit_trails", ["action"]);
    await queryInterface.addIndex("audit_trails", ["user_id"]);
    await queryInterface.addIndex("audit_trails", ["created_at"]);

    console.log(
      "✅ All tables created successfully with proper relationships and indexes"
    );
  },

  async down(queryInterface, Sequelize) {
    // Drop FK constraint on ward_secretariats.last_updated_by first (circular dependency)
    try {
      await queryInterface.removeConstraint(
        "ward_secretariats",
        "ward_secretariats_last_updated_by_fkey"
      );
    } catch (error) {
      // Constraint might not exist, ignore
      console.log(
        "Note: ward_secretariats_last_updated_by_fkey constraint not found (may already be dropped)"
      );
    }

    // Drop all tables in reverse order to handle foreign key constraints
    await queryInterface.dropTable("audit_trails");
    await queryInterface.dropTable("notification_logs");
    await queryInterface.dropTable("events");
    await queryInterface.dropTable("conversations");
    await queryInterface.dropTable("scheme_enrollments");
    await queryInterface.dropTable("schemes");
    await queryInterface.dropTable("resident_employment");
    await queryInterface.dropTable("resident_kyc");
    await queryInterface.dropTable("resident_emergency_contacts");
    await queryInterface.dropTable("resident_bank_details");
    await queryInterface.dropTable("residents");
    await queryInterface.dropTable("households");
    // Drop users before ward_secretariats since users.ward_secretariat_id references ward_secretariats
    await queryInterface.dropTable("users");
    await queryInterface.dropTable("ward_secretariats");

    // Drop ENUM types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS user_role, property_type, ownership_type, verification_status,
                         gender_type, marital_status, relationship_type, education_level,
                         category_type, blood_group, ration_card_type, employment_status,
                         scheme_status, enrollment_status, event_type, notification_type,
                         notification_status, bank_account_type, priority_level,
                         verification_method, contact_type, kyc_status, employment_status_extended,
                         employment_type, work_sector, qualification_level, computer_literacy,
                         ration_card_type_extended, caste_category, preferred_job_type CASCADE;
    `);

    console.log("✅ All tables and enums dropped successfully");
  },
};
