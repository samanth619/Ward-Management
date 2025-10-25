'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('resident_employment', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      resident_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'residents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // Current Employment Status
      employment_status: {
        type: Sequelize.ENUM('employed', 'unemployed', 'self_employed', 'student', 'homemaker', 'retired', 'differently_abled', 'seeking_employment'),
        allowNull: false,
        defaultValue: 'unemployed'
      },
      current_occupation: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      employer_name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      employer_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      employer_contact: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      job_title: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      employment_type: {
        type: Sequelize.ENUM('permanent', 'contract', 'part_time', 'freelance', 'daily_wage', 'seasonal'),
        allowNull: true
      },
      work_sector: {
        type: Sequelize.ENUM('government', 'private', 'ngo', 'self_employed', 'agriculture', 'construction', 'manufacturing', 'services', 'it', 'healthcare', 'education', 'retail', 'other'),
        allowNull: true
      },
      monthly_income: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      employment_start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      employment_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_current_job: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // Employment Seeking Details
      seeking_employment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      preferred_job_type: {
        type: Sequelize.ENUM('full_time', 'part_time', 'contract', 'freelance', 'work_from_home', 'flexible'),
        allowNull: true
      },
      preferred_sectors: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expected_salary_min: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      expected_salary_max: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      willing_to_relocate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      transportation_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      max_commute_distance: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      // Skills and Qualifications
      highest_qualification: {
        type: Sequelize.ENUM('below_10th', '10th_pass', '12th_pass', 'diploma', 'graduation', 'post_graduation', 'phd', 'professional_course'),
        allowNull: true
      },
      qualification_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      technical_skills: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      certifications: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      language_skills: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      computer_literacy: {
        type: Sequelize.ENUM('none', 'basic', 'intermediate', 'advanced'),
        allowNull: true,
        defaultValue: 'none'
      },
      work_experience_years: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      // Government Employment Programs
      registered_with_employment_exchange: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      employment_exchange_registration_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      employment_exchange_registration_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      mgnrega_job_card_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      mgnrega_days_worked_this_year: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      participated_in_skill_development: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      skill_development_programs: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Entrepreneurship
      interested_in_entrepreneurship: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      business_idea: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requires_business_loan: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      loan_amount_required: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      has_existing_business: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      business_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      business_registration_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      // Employment Support Services
      requires_employment_assistance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      assistance_type_required: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      disability_affecting_employment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      disability_type: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      requires_special_assistance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      special_assistance_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Employment History Tracking
      last_employment_status_update: {
        type: Sequelize.DATE,
        allowNull: true
      },
      employment_verification_status: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
      },
      employment_verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      employment_verification_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      employment_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    });

    // Add indexes
    await queryInterface.addIndex('resident_employment', ['resident_id']);
    await queryInterface.addIndex('resident_employment', ['employment_status']);
    await queryInterface.addIndex('resident_employment', ['seeking_employment']);
    await queryInterface.addIndex('resident_employment', ['work_sector']);
    await queryInterface.addIndex('resident_employment', ['highest_qualification']);
    await queryInterface.addIndex('resident_employment', ['employment_verification_status']);
    await queryInterface.addIndex('resident_employment', ['requires_employment_assistance']);
    await queryInterface.addIndex('resident_employment', ['is_current_job']);
    await queryInterface.addIndex('resident_employment', ['monthly_income']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('resident_employment');
  }
};