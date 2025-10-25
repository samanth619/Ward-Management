'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('resident_emergency_contacts', {
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
      contact_type: {
        type: Sequelize.ENUM('primary', 'secondary', 'medical', 'local_guardian'),
        allowNull: false,
        defaultValue: 'primary'
      },
      contact_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      relationship: {
        type: Sequelize.ENUM(
          'spouse', 'father', 'mother', 'son', 'daughter', 'brother', 'sister',
          'grandfather', 'grandmother', 'uncle', 'aunt', 'nephew', 'niece',
          'cousin', 'friend', 'neighbor', 'colleague', 'guardian', 'other'
        ),
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      alternative_phone: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pincode: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      occupation: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      workplace: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      is_local_resident: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_available_24x7: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      medical_authorization: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_pick_up_documents: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      priority_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      last_contacted_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_contacted_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      contact_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verification_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      verification_method: {
        type: Sequelize.ENUM('phone_call', 'sms', 'in_person', 'document'),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      deactivation_reason: {
        type: Sequelize.STRING(500),
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
    await queryInterface.addIndex('resident_emergency_contacts', ['resident_id']);
    await queryInterface.addIndex('resident_emergency_contacts', ['phone_number']);
    await queryInterface.addIndex('resident_emergency_contacts', ['contact_type']);
    await queryInterface.addIndex('resident_emergency_contacts', ['priority_order']);
    await queryInterface.addIndex('resident_emergency_contacts', ['is_active']);

    // Add unique constraint for resident_id, contact_type, priority_order combination
    await queryInterface.addConstraint('resident_emergency_contacts', {
      fields: ['resident_id', 'contact_type', 'priority_order'],
      type: 'unique',
      name: 'unique_resident_contact_priority',
      where: {
        is_active: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('resident_emergency_contacts');
  }
};