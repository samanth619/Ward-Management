'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('resident_kyc', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      resident_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'residents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // Aadhaar Details
      aadhaar_number: {
        type: Sequelize.STRING(12),
        allowNull: true,
        unique: true
      },
      aadhaar_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      aadhaar_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      aadhaar_verification_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      aadhaar_verification_method: {
        type: Sequelize.ENUM('otp', 'biometric', 'manual', 'e_kyc'),
        allowNull: true
      },
      // PAN Details
      pan_number: {
        type: Sequelize.STRING(10),
        allowNull: true,
        unique: true
      },
      pan_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pan_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pan_verification_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Voter ID Details
      voter_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      voter_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      voter_id_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      voter_id_verification_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      assembly_constituency: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      parliamentary_constituency: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      polling_station: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      // Driving License Details
      driving_license_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      driving_license_state: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      driving_license_expiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      driving_license_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      vehicle_classes: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      // Passport Details
      passport_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      passport_expiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      passport_place_of_issue: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      passport_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // Ration Card Details
      ration_card_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      ration_card_type: {
        type: Sequelize.ENUM('apl', 'bpl', 'aay', 'phh'),
        allowNull: true
      },
      ration_card_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // Health Insurance Details
      arogyasri_card_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      arogyasri_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      ayushman_bharat_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      ayushman_bharat_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      other_health_insurance: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Educational Certificates
      education_certificates: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      highest_qualification_certificate: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      // Income Certificates
      income_certificate_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      income_certificate_issuing_authority: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      income_certificate_valid_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      annual_income_declared: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      // Caste Certificate
      caste_certificate_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      caste_category: {
        type: Sequelize.ENUM('general', 'obc', 'sc', 'st', 'ews'),
        allowNull: true
      },
      caste_certificate_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // KYC Status
      kyc_status: {
        type: Sequelize.ENUM('pending', 'partial', 'complete', 'rejected'),
        defaultValue: 'pending'
      },
      kyc_completion_percentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      mandatory_documents_submitted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_kyc_update_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      next_kyc_review_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      kyc_reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      kyc_rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      document_storage_path: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      remarks: {
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
    await queryInterface.addIndex('resident_kyc', ['resident_id']);
    await queryInterface.addIndex('resident_kyc', ['aadhaar_number'], {
      unique: true,
      where: {
        aadhaar_number: { [Sequelize.Op.ne]: null }
      }
    });
    await queryInterface.addIndex('resident_kyc', ['pan_number'], {
      unique: true,
      where: {
        pan_number: { [Sequelize.Op.ne]: null }
      }
    });
    await queryInterface.addIndex('resident_kyc', ['voter_id'], {
      unique: true,
      where: {
        voter_id: { [Sequelize.Op.ne]: null }
      }
    });
    await queryInterface.addIndex('resident_kyc', ['kyc_status']);
    await queryInterface.addIndex('resident_kyc', ['kyc_completion_percentage']);
    await queryInterface.addIndex('resident_kyc', ['caste_category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('resident_kyc');
  }
};