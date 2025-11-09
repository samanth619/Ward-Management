const { getModels } = require("../models");
const { Op } = require("sequelize");

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
      WardSecretariat,
      // Event, // Out of scope temporarily
      // Conversation, // Out of scope temporarily
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
      // active_events: 0, // Out of scope temporarily
      // pending_conversations: 0, // Out of scope temporarily
      scheme_enrollments: await SchemeEnrollment.count({
        where: {
          status: { [Op.notIn]: ["rejected"] },
        },
      }),
    };

    // ============================================
    // DEMOGRAPHICS
    // ============================================
    // Gender distribution
    const genderStats = await Resident.findAll({
      attributes: [
        "gender",
        [Resident.sequelize.fn("COUNT", Resident.sequelize.col("id")), "count"],
      ],
      where: { is_active: true },
      group: ["gender"],
      raw: true,
    });

    const genderDistribution = genderStats.reduce((acc, item) => {
      acc[item.gender] = parseInt(item.count);
      return acc;
    }, {});

    // Caste distribution
    const casteStats = await Resident.findAll({
      attributes: [
        "caste",
        [Resident.sequelize.fn("COUNT", Resident.sequelize.col("id")), "count"],
      ],
      where: {
        is_active: true,
        caste: { [Op.not]: null },
      },
      group: ["caste"],
      order: [[Resident.sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });

    const casteDistribution = casteStats.reduce((acc, item) => {
      if (item.caste) {
        acc[item.caste.toUpperCase()] = parseInt(item.count);
      }
      return acc;
    }, {});

    // Profession/Occupation distribution
    const occupationStats = await Resident.findAll({
      attributes: [
        "occupation",
        [Resident.sequelize.fn("COUNT", Resident.sequelize.col("id")), "count"],
      ],
      where: {
        is_active: true,
        occupation: { [Op.not]: null },
      },
      group: ["occupation"],
      order: [[Resident.sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });

    const occupationDistribution = occupationStats.reduce((acc, item) => {
      if (item.occupation) {
        acc[item.occupation.toUpperCase()] = parseInt(item.count);
      }
      return acc;
    }, {});

    // Education/Qualification distribution
    const educationStats = await Resident.findAll({
      attributes: [
        "education_level",
        [Resident.sequelize.fn("COUNT", Resident.sequelize.col("id")), "count"],
      ],
      where: {
        is_active: true,
        education_level: { [Op.not]: null },
      },
      group: ["education_level"],
      order: [[Resident.sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });

    const educationDistribution = educationStats.reduce((acc, item) => {
      if (item.education_level) {
        const level = item.education_level.toUpperCase().replace("_", " ");
        acc[level] = parseInt(item.count);
      }
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
        "ward_secretariat_id",
        [
          Household.sequelize.fn("COUNT", Household.sequelize.col("id")),
          "count",
        ],
      ],
      where: {
        ward_secretariat_id: { [Op.not]: null },
      },
      group: ["ward_secretariat_id"],
      raw: true,
    });

    const wardDistribution = wardStats.reduce((acc, item) => {
      acc[item.ward_secretariat_id] = parseInt(item.count);
      return acc;
    }, {});

    // Age groups detailed (0-5, 6-10, 11-15, etc.)
    const ageGroupsDetailed = {};
    const ageRanges = [
      { min: 0, max: 5, label: "0-5" },
      { min: 6, max: 10, label: "6-10" },
      { min: 11, max: 15, label: "11-15" },
      { min: 16, max: 20, label: "16-20" },
      { min: 21, max: 25, label: "21-25" },
      { min: 26, max: 30, label: "26-30" },
      { min: 31, max: 35, label: "31-35" },
      { min: 36, max: 40, label: "36-40" },
      { min: 41, max: 45, label: "41-45" },
      { min: 46, max: 50, label: "46-50" },
      { min: 51, max: 55, label: "51-55" },
      { min: 56, max: 60, label: "56-60" },
    ];

    for (const range of ageRanges) {
      // For age range min-max, date_of_birth should be between (today - max years) and (today - min years)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - range.min);
      maxDate.setHours(23, 59, 59, 999);

      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - range.max - 1);
      minDate.setHours(0, 0, 0, 0);

      const count = await Resident.count({
        where: {
          is_active: true,
          date_of_birth: {
            [Op.between]: [minDate, maxDate],
          },
        },
      });

      ageGroupsDetailed[`${range.label}_years`] = count;
    }

    // 61+ years
    const seniorCutoff = new Date();
    seniorCutoff.setFullYear(seniorCutoff.getFullYear() - 61);
    seniorCutoff.setHours(23, 59, 59, 999);
    ageGroupsDetailed["61+_years"] = await Resident.count({
      where: {
        is_active: true,
        date_of_birth: { [Op.lte]: seniorCutoff },
      },
    });

    const demographics = {
      gender_distribution: genderDistribution,
      caste_distribution: casteDistribution,
      occupation_distribution: occupationDistribution,
      education_distribution: educationDistribution,
      age_groups: {
        children,
        adults,
        senior_citizens: seniorCitizens,
      },
      age_groups_detailed: ageGroupsDetailed,
      ward_distribution: wardDistribution,
    };

    // ============================================
    // RECENT ACTIVITIES
    // ============================================
    // Recent residents - get all residents for data preview (not just recent)
    const allResidents = await Resident.findAll({
      where: {
        is_active: true,
      },
      include: [
        {
          model: Household,
          as: "household",
          attributes: [
            "id",
            "household_number",
            "address_line1",
            "address_line2",
            "total_members",
          ],
          include: [
            {
              model: WardSecretariat,
              as: "ward_secretariat",
              required: false,
              attributes: ["id", "ward_name", "ward_number"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 100, // Limit for data preview
      attributes: [
        "id",
        "first_name",
        "last_name",
        "middle_name",
        "resident_id",
        "date_of_birth",
        "gender",
        "phone_number",
        "occupation",
        "caste",
        "education_level",
        "created_at",
        "household_id",
      ],
    });

    // Recent residents for recent activities section
    const newResidents = allResidents.slice(0, recentActivitiesLimit);

    // Recent conversations - Out of scope temporarily
    // const recentConversations = await Conversation.findAll({...});

    // Recent events - Out of scope temporarily
    // const recentEvents = await Event.findAll({...});

    // Recent scheme applications
    const recentSchemeApplications = await SchemeEnrollment.findAll({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
      include: [
        {
          model: Scheme,
          as: "scheme",
          attributes: ["id", "scheme_name", "scheme_code"],
        },
        {
          model: Resident,
          as: "resident",
          attributes: ["id", "first_name", "last_name", "resident_id"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: recentActivitiesLimit,
      attributes: [
        "id",
        "application_number",
        "status",
        "application_date",
        "created_at",
      ],
    });

    const recentActivities = {
      new_residents: newResidents,
      // recent_conversations: [], // Out of scope temporarily
      // recent_events: [], // Out of scope temporarily
      recent_scheme_applications: recentSchemeApplications,
    };

    // Data preview - all residents for table display
    const dataPreview = {
      residents: allResidents,
    };

    // ============================================
    // UPCOMING EVENTS
    // ============================================
    // Upcoming birthdays
    const upcomingBirthdays = await Resident.findBirthdays(
      today,
      upcomingEndDate
    );

    // Upcoming anniversaries
    const upcomingAnniversaries = await Resident.findAnniversaries(
      today,
      upcomingEndDate
    );

    // Upcoming events - Out of scope temporarily
    // const upcomingEvents = await Event.findUpcoming(daysForUpcoming);

    // Upcoming follow-ups - Out of scope temporarily
    // const upcomingFollowUps = await Conversation.findAll({...});

    // Get full resident data for upcoming birthdays with household info
    const upcomingBirthdaysFull = await Resident.findAll({
      where: {
        is_active: true,
        date_of_birth: { [Op.not]: null },
      },
      include: [
        {
          model: Household,
          as: "household",
          attributes: ["id", "household_number", "address_line1"],
        },
      ],
      attributes: [
        "id",
        "first_name",
        "last_name",
        "middle_name",
        "date_of_birth",
        "gender",
        "phone_number",
        "household_id",
      ],
      limit: 100,
    });

    // Filter and sort by days until birthday
    const todayForBirthdays = new Date();
    const upcomingEndDateForBirthdays = new Date();
    upcomingEndDateForBirthdays.setDate(
      upcomingEndDateForBirthdays.getDate() + daysForUpcoming
    );

    const birthdaysWithDays = upcomingBirthdaysFull
      .map((r) => {
        if (!r.date_of_birth) return null;
        const dob = new Date(r.date_of_birth);
        const thisYearBirthday = new Date(
          todayForBirthdays.getFullYear(),
          dob.getMonth(),
          dob.getDate()
        );
        if (thisYearBirthday < todayForBirthdays) {
          thisYearBirthday.setFullYear(todayForBirthdays.getFullYear() + 1);
        }
        const daysUntil = Math.ceil(
          (thisYearBirthday - todayForBirthdays) / (1000 * 60 * 60 * 24)
        );
        return { ...r.toJSON(), days_until_birthday: daysUntil };
      })
      .filter(
        (r) =>
          r &&
          r.days_until_birthday >= 0 &&
          r.days_until_birthday <= daysForUpcoming
      )
      .sort((a, b) => a.days_until_birthday - b.days_until_birthday)
      .slice(0, 10);

    const upcoming = {
      birthdays: birthdaysWithDays.map((r) => ({
        id: r.id,
        first_name: r.first_name,
        last_name: r.last_name,
        middle_name: r.middle_name,
        date_of_birth: r.date_of_birth,
        gender: r.gender,
        phone_number: r.phone_number,
        household_id: r.household_id,
        household: r.household,
        days_until_birthday: r.days_until_birthday,
      })),
      anniversaries: upcomingAnniversaries.slice(0, 10).map((r) => ({
        id: r.id,
        first_name: r.first_name,
        last_name: r.last_name,
        anniversary_date: r.anniversary_date,
        household_id: r.household_id,
      })),
      // events: [], // Out of scope temporarily
      // follow_ups: [], // Out of scope temporarily
    };

    // ============================================
    // ALERTS
    // ============================================
    // Overdue follow-ups - Out of scope temporarily
    // const overdueFollowUps = await Conversation.findAll({...});
    // const overdueFollowUpsCount = overdueFollowUps.length;

    // Pending verifications (households)
    const pendingVerifications = await Household.count({
      where: {
        verification_status: { [Op.in]: ["pending", "needs_update"] },
      },
    });

    // Upcoming renewals (scheme enrollments) - Not available (renewal fields don't exist in migration)
    // const upcomingRenewals = await SchemeEnrollment.findDueRenewals(30);
    const upcomingRenewalsCount = 0; // Set to 0 since renewal tracking fields don't exist

    // Unresolved complaints - Out of scope temporarily
    // const unresolvedComplaints = await Conversation.count({...});

    const alerts = {
      // overdue_follow_ups: 0, // Out of scope temporarily
      pending_verifications: pendingVerifications,
      upcoming_renewals: upcomingRenewalsCount,
      // unresolved_complaints: 0, // Out of scope temporarily
    };

    // ============================================
    // SCHEME STATISTICS
    // ============================================
    const totalSchemes = await Scheme.count({
      where: { scheme_status: "active" },
    });

    const activeEnrollments = await SchemeEnrollment.count({
      where: {
        status: { [Op.in]: ["approved", "completed"] },
      },
    });

    const pendingApplications =
      await SchemeEnrollment.findPendingApplications();
    const pendingApplicationsCount = pendingApplications.length;

    // Scheme enrollment by status
    const enrollmentStatusStats = await SchemeEnrollment.findAll({
      attributes: [
        "status",
        [
          SchemeEnrollment.sequelize.fn(
            "COUNT",
            SchemeEnrollment.sequelize.col("id")
          ),
          "count",
        ],
      ],
      group: ["status"],
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
    // CONVERSATION STATISTICS - Out of scope temporarily
    // ============================================
    // const conversationStats = {
    //   by_status: {},
    //   by_channel: {},
    //   by_priority: {},
    // };

    // ============================================
    // ASSEMBLE RESPONSE
    // ============================================
    res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        overview,
        demographics,
        recent_activities: recentActivities,
        upcoming,
        alerts,
        scheme_stats: schemeStats,
        // conversation_stats: conversationStats, // Out of scope temporarily
        data_preview: dataPreview,
        generated_at: new Date().toISOString(),
        query_params: {
          days_for_upcoming: daysForUpcoming,
          recent_activities_limit: recentActivitiesLimit,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data",
      error_code: "GET_DASHBOARD_FAILED",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getDashboard,
};
