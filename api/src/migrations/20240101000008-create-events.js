'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      event_type: {
        type: Sequelize.ENUM('meeting', 'awareness', 'camp', 'survey', 'distribution', 'training', 'celebration', 'emergency'),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('health', 'education', 'employment', 'welfare', 'cultural', 'sports', 'administrative', 'emergency'),
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      venue_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      organizer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      organizer_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      organizer_contact: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      target_audience: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Target groups for the event'
      },
      expected_attendance: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      actual_attendance: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      registration_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      registration_deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      current_registrations: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('planned', 'scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'),
        defaultValue: 'planned'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      budget_allocated: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      budget_utilized: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      funding_source: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      approvals_required: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Required approvals and their status'
      },
      permits_required: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Required permits and their status'
      },
      speakers_guests: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'List of speakers and chief guests'
      },
      agenda: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Event agenda with timings'
      },
      resources_required: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Resources like audio, video, materials etc'
      },
      logistics: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Logistics arrangements'
      },
      volunteer_count: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      volunteers_assigned: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'List of volunteers and their roles'
      },
      notification_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      notification_channels: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Channels used for notifications'
      },
      media_coverage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      media_contacts: {
        type: Sequelize.JSON,
        allowNull: true
      },
      photo_gallery: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Event photos and videos'
      },
      feedback_collected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      feedback_summary: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Summary of participant feedback'
      },
      success_metrics: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'KPIs and success measurements'
      },
      follow_up_actions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Post event follow-up actions'
      },
      recurring_event: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      recurrence_pattern: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
        allowNull: true
      },
      recurrence_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      parent_event_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'events',
          key: 'id'
        },
        comment: 'For recurring events, reference to parent'
      },
      weather_considerations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      emergency_contacts: {
        type: Sequelize.JSON,
        allowNull: true
      },
      safety_measures: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      covid_guidelines: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      accessibility_features: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Accessibility arrangements for differently abled'
      },
      live_streaming: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      streaming_link: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tags for categorization and search'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('events', ['start_date']);
    await queryInterface.addIndex('events', ['end_date']);
    await queryInterface.addIndex('events', ['event_type']);
    await queryInterface.addIndex('events', ['category']);
    await queryInterface.addIndex('events', ['status']);
    await queryInterface.addIndex('events', ['organizer_id']);
    await queryInterface.addIndex('events', ['priority']);
    await queryInterface.addIndex('events', ['recurring_event']);
    await queryInterface.addIndex('events', ['parent_event_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('events');
  }
};