const { getModels } = require('../models');
const { Op } = require('sequelize');

/**
 * Dashboard Controller for Ward Management System
 * Aggregates all dashboard data in a single endpoint
 */

/**
 * @desc    Get dashboard data
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboard = async (req, res) => {
  try {
    const models = await getModels();
    const {
      User,
      Resident,
      Household,
      Event,
      Conversation,
      Scheme,
      SchemeEnrollment,
      NotificationLog,
    } = models;

    // Get query parameters
    const daysForUpcoming = parseInt(req.query.days) || 30;
    const recentActivitiesLimit = parseInt(req.query.recent_limit) || 5;

    // Set date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const upcomingEndDate = new Date();
    upcomingEndDate.setDate(upcomingEndDate.getDate() + daysForUpcoming);

    // Calculate age group cutoffs
    const cutoffDate18 = new Date();
    cutoffDate18.setFullYear(cutoffDate18.getFullYear() - 18);
    const cutoffDate60 = new Date();
    cutoffDate60.setFullYear(cutoffDate60.getFullYear() - 60);

    // ============================================
    // OVERVIEW METRICS
    // ============================================
    const overview = {
      total_residents: await Resident.count(),
      total_households: await Household.count(),
      total_users: await User.count({ where: { is_active: true } }),
      active_events: await Event.count({
        where: {
          status: { [Op.in]: ['published', 'ongoing'] },
          start_date: { [Op.gte]: today },
        },
      }),
      pending_conversations: await Conversation.count({
        where: {
          status: { [Op.in]: ['open', 'in_progress', 'pending'] },
        },
      }),
      scheme_enrollments: await SchemeEnrollment.count({
        where: {
          status: { [Op.notIn]: ['rejected', 'closed', 'expired'] },
        },
      }),
    };

    // ============================================
    // DEMOGRAPHICS
    // ============================================
    // Gender distribution
    const genderStats = await Resident.findAll({
      attributes: [
        'gender',
        [Resident.sequelize.fn('COUNT', Resident.sequelize.col('id')), 'count'],
      ],
      where: { is_active: true },
      group: ['gender'],
      raw: true,
    });

    const genderDistribution = genderStats.reduce((acc, item) => {
      acc[item.gender] = parseInt(item.count);
      return acc;
    }, {});

    // Age groups
    const children = await Resident.count({
      where: {
        is_active: true,
        date_of_birth: { [Op.gte]: cutoffDate18 },
      },
    });

    const adults = await Resident.count({
      where: {
        is_active: true,
        date_of_birth: { [Op.between]: [cutoffDate60, cutoffDate18] },
      },
    });

    const seniorCitizens = await Resident.count({
      where: {
        is_active: true,
        date_of_birth: { [Op.lte]: cutoffDate60 },
      },
    });

    // Ward distribution (through households)
    const wardStats = await Household.findAll({
      attributes: [
        'ward_secretariat_id',
        [Household.sequelize.fn('COUNT', Household.sequelize.col('id')), 'count'],
      ],
      where: {
        ward_secretariat_id: { [Op.not]: null },
      },
      group: ['ward_secretariat_id'],
      raw: true,
    });

    const wardDistribution = wardStats.reduce((acc, item) => {
      acc[item.ward_secretariat_id] = parseInt(item.count);
      return acc;
    }, {});

    const demographics = {
      gender_distribution: genderDistribution,
      age_groups: {
        children,
        adults,
        senior_citizens: seniorCitizens,
      },
      ward_distribution: wardDistribution,
    };

    // ============================================
    // RECENT ACTIVITIES
    // ============================================
    // Recent residents
    const newResidents = await Resident.findAll({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
      include: [
        {
          model: Household,
          as: 'household',
          attributes: ['id', 'household_number', 'address_line1'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: recentActivitiesLimit,
      attributes: [
        'id',
        'first_name',
        'last_name',
        'resident_id',
        'created_at',
        'household_id',
      ],
    });

    // Recent conversations
    const recentConversations = await Conversation.findAll({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
      order: [['created_at', 'DESC']],
      limit: recentActivitiesLimit,
      attributes: [
        'id',
        'conversation_id',
        'subject',
        'status',
        'priority',
        'conversation_type',
        'created_at',
      ],
    });

    // Recent events
    const recentEvents = await Event.findAll({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
      order: [['created_at', 'DESC']],
      limit: recentActivitiesLimit,
      attributes: [
        'id',
        'event_id',
        'title',
        'event_type',
        'start_date',
        'status',
        'created_at',
      ],
    });

    // Recent scheme applications
    const recentSchemeApplications = await SchemeEnrollment.findAll({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
      include: [
        {
          model: Scheme,
          as: 'scheme',
          attributes: ['id', 'scheme_name', 'scheme_code'],
        },
        {
          model: Resident,
          as: 'resident',
          attributes: ['id', 'first_name', 'last_name', 'resident_id'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: recentActivitiesLimit,
      attributes: [
        'id',
        'enrollment_id',
        'status',
        'application_date',
        'created_at',
      ],
    });

    const recentActivities = {
      new_residents: newResidents,
      recent_conversations: recentConversations,
      recent_events: recentEvents,
      recent_scheme_applications: recentSchemeApplications,
    };

    // ============================================
    // UPCOMING EVENTS
    // ============================================
    // Upcoming birthdays
    const upcomingBirthdays = await Resident.findBirthdays(today, upcomingEndDate);

    // Upcoming anniversaries
    const upcomingAnniversaries = await Resident.findAnniversaries(
      today,
      upcomingEndDate
    );

    // Upcoming events
    const upcomingEvents = await Event.findUpcoming(daysForUpcoming);

    // Upcoming follow-ups
    const upcomingFollowUps = await Conversation.findAll({
      where: {
        is_follow_up_required: true,
        next_follow_up_date: {
          [Op.between]: [today, upcomingEndDate],
        },
        status: { [Op.notIn]: ['resolved', 'closed'] },
      },
      include: [
        {
          model: Resident,
          as: 'resident',
          attributes: ['id', 'first_name', 'last_name'],
          required: false,
        },
      ],
      order: [['next_follow_up_date', 'ASC']],
      limit: 10,
      attributes: [
        'id',
        'conversation_id',
        'subject',
        'next_follow_up_date',
        'status',
      ],
    });

    const upcoming = {
      birthdays: upcomingBirthdays.slice(0, 10).map((r) => ({
        id: r.id,
        first_name: r.first_name,
        last_name: r.last_name,
        date_of_birth: r.date_of_birth,
        household_id: r.household_id,
      })),
      anniversaries: upcomingAnniversaries.slice(0, 10).map((r) => ({
        id: r.id,
        first_name: r.first_name,
        last_name: r.last_name,
        anniversary_date: r.anniversary_date,
        household_id: r.household_id,
      })),
      events: upcomingEvents.slice(0, 10).map((e) => ({
        id: e.id,
        event_id: e.event_id,
        title: e.title,
        event_type: e.event_type,
        start_date: e.start_date,
        location: e.location,
      })),
      follow_ups: upcomingFollowUps,
    };

    // ============================================
    // ALERTS
    // ============================================
    // Overdue follow-ups
    const overdueFollowUps = await Conversation.findOverdueFollowUps();
    const overdueFollowUpsCount = overdueFollowUps.length;

    // Pending verifications (households)
    const pendingVerifications = await Household.count({
      where: {
        verification_status: { [Op.in]: ['pending', 'needs_update'] },
      },
    });

    // Upcoming renewals (scheme enrollments)
    const upcomingRenewals = await SchemeEnrollment.findDueRenewals(30);
    const upcomingRenewalsCount = upcomingRenewals.length;

    // Unresolved complaints
    const unresolvedComplaints = await Conversation.count({
      where: {
        is_complaint: true,
        status: { [Op.notIn]: ['resolved', 'closed'] },
      },
    });

    const alerts = {
      overdue_follow_ups: overdueFollowUpsCount,
      pending_verifications: pendingVerifications,
      upcoming_renewals: upcomingRenewalsCount,
      unresolved_complaints: unresolvedComplaints,
    };

    // ============================================
    // SCHEME STATISTICS
    // ============================================
    const totalSchemes = await Scheme.count({
      where: { scheme_status: 'active' },
    });

    const activeEnrollments = await SchemeEnrollment.count({
      where: {
        status: { [Op.in]: ['approved', 'beneficiary', 'verified'] },
      },
    });

    const pendingApplications = await SchemeEnrollment.findPendingApplications();
    const pendingApplicationsCount = pendingApplications.length;

    // Scheme enrollment by status
    const enrollmentStatusStats = await SchemeEnrollment.findAll({
      attributes: [
        'status',
        [SchemeEnrollment.sequelize.fn('COUNT', SchemeEnrollment.sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const enrollmentByStatus = enrollmentStatusStats.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    const schemeStats = {
      total_schemes: totalSchemes,
      active_enrollments: activeEnrollments,
      pending_applications: pendingApplicationsCount,
      by_status: enrollmentByStatus,
    };

    // ============================================
    // CONVERSATION STATISTICS
    // ============================================
    // Conversations by status
    const conversationStatusStats = await Conversation.findAll({
      attributes: [
        'status',
        [Conversation.sequelize.fn('COUNT', Conversation.sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const conversationByStatus = conversationStatusStats.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    // Conversations by category
    const conversationCategoryStats = await Conversation.findAll({
      attributes: [
        'issue_category',
        [Conversation.sequelize.fn('COUNT', Conversation.sequelize.col('id')), 'count'],
      ],
      group: ['issue_category'],
      raw: true,
    });

    const conversationByCategory = conversationCategoryStats.reduce((acc, item) => {
      acc[item.issue_category] = parseInt(item.count);
      return acc;
    }, {});

    // Conversations by priority
    const conversationPriorityStats = await Conversation.findAll({
      attributes: [
        'priority',
        [Conversation.sequelize.fn('COUNT', Conversation.sequelize.col('id')), 'count'],
      ],
      group: ['priority'],
      raw: true,
    });

    const conversationByPriority = conversationPriorityStats.reduce((acc, item) => {
      acc[item.priority] = parseInt(item.count);
      return acc;
    }, {});

    const conversationStats = {
      by_status: conversationByStatus,
      by_category: conversationByCategory,
      by_priority: conversationByPriority,
    };

    // ============================================
    // ASSEMBLE RESPONSE
    // ============================================
    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        overview,
        demographics,
        recent_activities: recentActivities,
        upcoming,
        alerts,
        scheme_stats: schemeStats,
        conversation_stats: conversationStats,
        generated_at: new Date().toISOString(),
        query_params: {
          days_for_upcoming: daysForUpcoming,
          recent_activities_limit: recentActivitiesLimit,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      error_code: 'GET_DASHBOARD_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getDashboard,
};

