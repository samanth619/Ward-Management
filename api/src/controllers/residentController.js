const { getModels } = require('../models');
const { Op } = require('sequelize');

/**
 * Resident Management Controller for Ward Management System
 */

/**
 * @desc    Get all residents with pagination and filtering
 * @route   GET /api/residents
 * @access  Private
 */
const getResidents = async (req, res) => {
  try {
    const models = await getModels();
    const { Resident, Household } = models;

    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'desc',
      q,
      gender,
      household_id,
      is_active,
      ward_number,
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Search query
    if (q) {
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${q}%` } },
        { middle_name: { [Op.iLike]: `%${q}%` } },
        { last_name: { [Op.iLike]: `%${q}%` } },
        { resident_id: { [Op.iLike]: `%${q}%` } },
        { phone_number: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // Gender filter
    if (gender) {
      whereClause.gender = gender;
    }

    // Household filter
    if (household_id) {
      whereClause.household_id = household_id;
    }

    // Active status filter
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    // Ward filter - filter through household
    let householdWhereClause = {};
    if (ward_number) {
      householdWhereClause.ward_secretariat_id = ward_number; // This might need adjustment based on actual schema
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get residents
    const { count, rows: residents } = await Resident.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Household,
          as: 'household',
          where: householdWhereClause,
          required: false,
          attributes: ['id', 'household_number', 'address_line1', 'ward_secretariat_id'],
        },
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      message: 'Residents retrieved successfully',
      data: {
        residents,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_residents: count,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
        },
        filters: {
          search: q,
          gender,
          household_id,
          is_active,
          ward_number,
          sort,
          order,
        },
      },
    });
  } catch (error) {
    console.error('Get residents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve residents',
      error_code: 'GET_RESIDENTS_FAILED',
    });
  }
};

/**
 * @desc    Get single resident by ID
 * @route   GET /api/residents/:id
 * @access  Private
 */
const getResidentById = async (req, res) => {
  try {
    const models = await getModels();
    const { Resident, Household } = models;

    const { id } = req.params;

    const resident = await Resident.findByPk(id, {
      include: [
        {
          model: Household,
          as: 'household',
          attributes: [
            'id',
            'household_number',
            'address_line1',
            'address_line2',
            'landmark',
            'pincode',
            'area',
            'city',
            'state',
            'ward_secretariat_id',
          ],
        },
      ],
    });

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found',
        error_code: 'RESIDENT_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resident retrieved successfully',
      data: {
        resident,
      },
    });
  } catch (error) {
    console.error('Get resident by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resident',
      error_code: 'GET_RESIDENT_FAILED',
    });
  }
};

/**
 * @desc    Create new resident
 * @route   POST /api/residents
 * @access  Private
 */
const createResident = async (req, res) => {
  try {
    const models = await getModels();
    const { Resident, Household } = models;

    const {
      household_id,
      resident_id,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      marital_status,
      relationship_to_head,
      phone_number,
      email,
      occupation,
      education_level,
      monthly_income,
      religion,
      caste,
      category,
      blood_group,
      is_disabled,
      disability_type,
      profile_picture,
      is_head_of_household,
      vaccination_status,
      health_conditions,
      government_schemes,
      is_active,
      moved_out_date,
      moved_out_reason,
      anniversary_date,
      notes,
      additional_info,
    } = req.body;

    // Validate household exists
    if (household_id) {
      const household = await Household.findByPk(household_id);
      if (!household) {
        return res.status(404).json({
          success: false,
          message: 'Household not found',
          error_code: 'HOUSEHOLD_NOT_FOUND',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Household ID is required',
        error_code: 'HOUSEHOLD_ID_REQUIRED',
      });
    }

    // Check if resident_id is unique (if provided)
    if (resident_id) {
      const existingResident = await Resident.findOne({ where: { resident_id } });
      if (existingResident) {
        return res.status(400).json({
          success: false,
          message: 'Resident ID already exists',
          error_code: 'RESIDENT_ID_EXISTS',
        });
      }
    }

    // Create resident
    const resident = await Resident.create({
      household_id,
      resident_id,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      marital_status,
      relationship_to_head: relationship_to_head || 'other',
      phone_number,
      email,
      occupation,
      education_level,
      monthly_income,
      religion,
      caste,
      category,
      blood_group,
      is_disabled: is_disabled || false,
      disability_type,
      profile_picture,
      is_head_of_household: is_head_of_household || false,
      vaccination_status: vaccination_status || {},
      health_conditions: health_conditions || [],
      government_schemes: government_schemes || [],
      is_active: is_active !== undefined ? is_active : true,
      moved_out_date,
      moved_out_reason,
      anniversary_date,
      notes,
      additional_info: additional_info || {},
    });

    // Update household member counts if resident is active
    if (resident.is_active) {
      const household = await Household.findByPk(household_id);
      await household.updateMemberCounts();
    }

    // Get resident with household
    const createdResident = await Resident.findByPk(resident.id, {
      include: [
        {
          model: Household,
          as: 'household',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Resident created successfully',
      data: {
        resident: createdResident,
      },
    });
  } catch (error) {
    console.error('Create resident error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resident',
      error_code: 'CREATE_RESIDENT_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update resident
 * @route   PUT /api/residents/:id
 * @access  Private
 */
const updateResident = async (req, res) => {
  try {
    const models = await getModels();
    const { Resident, Household } = models;

    const { id } = req.params;
    const updateData = req.body;

    const resident = await Resident.findByPk(id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found',
        error_code: 'RESIDENT_NOT_FOUND',
      });
    }

    // If household_id is being changed, validate new household
    if (updateData.household_id && updateData.household_id !== resident.household_id) {
      const household = await Household.findByPk(updateData.household_id);
      if (!household) {
        return res.status(404).json({
          success: false,
          message: 'Household not found',
          error_code: 'HOUSEHOLD_NOT_FOUND',
        });
      }
    }

    // If resident_id is being changed, check uniqueness
    if (updateData.resident_id && updateData.resident_id !== resident.resident_id) {
      const existingResident = await Resident.findOne({ where: { resident_id: updateData.resident_id } });
      if (existingResident) {
        return res.status(400).json({
          success: false,
          message: 'Resident ID already exists',
          error_code: 'RESIDENT_ID_EXISTS',
        });
      }
    }

    const oldHouseholdId = resident.household_id;
    const wasActive = resident.is_active;

    // Update resident
    await resident.update(updateData);

    // Update household member counts if active status or household changed
    if (updateData.is_active !== undefined || updateData.household_id) {
      // Update old household
      if (oldHouseholdId) {
        const oldHousehold = await Household.findByPk(oldHouseholdId);
        if (oldHousehold) {
          await oldHousehold.updateMemberCounts();
        }
      }

      // Update new household if changed
      const newHouseholdId = updateData.household_id || resident.household_id;
      if (newHouseholdId && newHouseholdId !== oldHouseholdId) {
        const newHousehold = await Household.findByPk(newHouseholdId);
        if (newHousehold) {
          await newHousehold.updateMemberCounts();
        }
      }
    }

    // Get updated resident with household
    const updatedResident = await Resident.findByPk(id, {
      include: [
        {
          model: Household,
          as: 'household',
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Resident updated successfully',
      data: {
        resident: updatedResident,
      },
    });
  } catch (error) {
    console.error('Update resident error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resident',
      error_code: 'UPDATE_RESIDENT_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Delete resident (soft delete)
 * @route   DELETE /api/residents/:id
 * @access  Private
 */
const deleteResident = async (req, res) => {
  try {
    const models = await getModels();
    const { Resident, Household } = models;

    const { id } = req.params;

    const resident = await Resident.findByPk(id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found',
        error_code: 'RESIDENT_NOT_FOUND',
      });
    }

    const householdId = resident.household_id;

    // Soft delete (paranoid: true in model)
    await resident.destroy();

    // Update household member counts
    if (householdId) {
      const household = await Household.findByPk(householdId);
      if (household) {
        await household.updateMemberCounts();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Resident deleted successfully',
      data: {
        deleted_resident_id: id,
        deleted_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Delete resident error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resident',
      error_code: 'DELETE_RESIDENT_FAILED',
    });
  }
};

/**
 * @desc    Get resident statistics
 * @route   GET /api/residents/stats
 * @access  Private
 */
const getResidentStats = async (req, res) => {
  try {
    const models = await getModels();
    const { Resident, Household } = models;

    // Total residents
    const totalResidents = await Resident.count();
    const activeResidents = await Resident.count({ where: { is_active: true } });
    const inactiveResidents = totalResidents - activeResidents;

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

    // Age groups (children < 18, adults 18-59, senior >= 60)
    const today = new Date();
    const cutoffDate18 = new Date();
    cutoffDate18.setFullYear(cutoffDate18.getFullYear() - 18);
    const cutoffDate60 = new Date();
    cutoffDate60.setFullYear(cutoffDate60.getFullYear() - 60);

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

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await Resident.count({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
    });

    // Head of household count
    const headOfHouseholdCount = await Resident.count({
      where: {
        is_active: true,
        is_head_of_household: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Resident statistics retrieved successfully',
      data: {
        total_residents: totalResidents,
        active_residents: activeResidents,
        inactive_residents: inactiveResidents,
        recent_registrations: recentRegistrations,
        head_of_household_count: headOfHouseholdCount,
        gender_distribution: genderStats.reduce((acc, item) => {
          acc[item.gender] = parseInt(item.count);
          return acc;
        }, {}),
        age_groups: {
          children,
          adults,
          senior_citizens: seniorCitizens,
        },
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get resident stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resident statistics',
      error_code: 'GET_RESIDENT_STATS_FAILED',
    });
  }
};

/**
 * @desc    Get resident demographics
 * @route   GET /api/residents/demographics
 * @access  Private
 */
const getResidentDemographics = async (req, res) => {
  try {
    const models = await getModels();
    const { Resident } = models;

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

    // Marital status distribution
    const maritalStatusStats = await Resident.findAll({
      attributes: [
        'marital_status',
        [Resident.sequelize.fn('COUNT', Resident.sequelize.col('id')), 'count'],
      ],
      where: {
        is_active: true,
        marital_status: { [Op.not]: null },
      },
      group: ['marital_status'],
      raw: true,
    });

    // Category distribution
    const categoryStats = await Resident.findAll({
      attributes: [
        'category',
        [Resident.sequelize.fn('COUNT', Resident.sequelize.col('id')), 'count'],
      ],
      where: {
        is_active: true,
        category: { [Op.not]: null },
      },
      group: ['category'],
      raw: true,
    });

    // Education level distribution
    const educationStats = await Resident.findAll({
      attributes: [
        'education_level',
        [Resident.sequelize.fn('COUNT', Resident.sequelize.col('id')), 'count'],
      ],
      where: {
        is_active: true,
        education_level: { [Op.not]: null },
      },
      group: ['education_level'],
      raw: true,
    });

    res.status(200).json({
      success: true,
      message: 'Resident demographics retrieved successfully',
      data: {
        gender_distribution: genderStats.reduce((acc, item) => {
          acc[item.gender] = parseInt(item.count);
          return acc;
        }, {}),
        marital_status_distribution: maritalStatusStats.reduce((acc, item) => {
          acc[item.marital_status] = parseInt(item.count);
          return acc;
        }, {}),
        category_distribution: categoryStats.reduce((acc, item) => {
          acc[item.category] = parseInt(item.count);
          return acc;
        }, {}),
        education_distribution: educationStats.reduce((acc, item) => {
          acc[item.education_level] = parseInt(item.count);
          return acc;
        }, {}),
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get resident demographics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resident demographics',
      error_code: 'GET_RESIDENT_DEMOGRAPHICS_FAILED',
    });
  }
};

/**
 * @desc    Get upcoming birthdays
 * @route   GET /api/residents/birthdays/upcoming
 * @access  Private
 */
const getUpcomingBirthdays = async (req, res) => {
  try {
    const models = await getModels();
    const { Resident, Household } = models;

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const residents = await Resident.findBirthdays(startDate, endDate);

    res.status(200).json({
      success: true,
      message: 'Upcoming birthdays retrieved successfully',
      data: {
        birthdays: residents,
        days_range: days,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get upcoming birthdays error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming birthdays',
      error_code: 'GET_BIRTHDAYS_FAILED',
    });
  }
};

/**
 * @desc    Get upcoming anniversaries
 * @route   GET /api/residents/anniversaries/upcoming
 * @access  Private
 */
const getUpcomingAnniversaries = async (req, res) => {
  try {
    const models = await getModels();
    const { Resident, Household } = models;

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const residents = await Resident.findAnniversaries(startDate, endDate);

    res.status(200).json({
      success: true,
      message: 'Upcoming anniversaries retrieved successfully',
      data: {
        anniversaries: residents,
        days_range: days,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get upcoming anniversaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming anniversaries',
      error_code: 'GET_ANNIVERSARIES_FAILED',
    });
  }
};

module.exports = {
  getResidents,
  getResidentById,
  createResident,
  updateResident,
  deleteResident,
  getResidentStats,
  getResidentDemographics,
  getUpcomingBirthdays,
  getUpcomingAnniversaries,
};

