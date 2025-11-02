const { getModels } = require('../models');
const { Op } = require('sequelize');

/**
 * Household Management Controller for Ward Management System
 */

/**
 * @desc    Get all households with pagination and filtering
 * @route   GET /api/households
 * @access  Private
 */
const getHouseholds = async (req, res) => {
  try {
    const models = await getModels();
    const { Household, WardSecretariat, Resident } = models;

    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'desc',
      q,
      ward_secretariat_id,
      pincode,
      area,
      property_type,
      ownership_type,
      is_bpl,
      verification_status,
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Search query
    if (q) {
      whereClause[Op.or] = [
        { household_number: { [Op.iLike]: `%${q}%` } },
        { address_line1: { [Op.iLike]: `%${q}%` } },
        { address_line2: { [Op.iLike]: `%${q}%` } },
        { head_of_family: { [Op.iLike]: `%${q}%` } },
        { voter_id_primary: { [Op.iLike]: `%${q}%` } },
        { ration_card_number: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // Ward secretariat filter
    if (ward_secretariat_id) {
      whereClause.ward_secretariat_id = ward_secretariat_id;
    }

    // Pincode filter
    if (pincode) {
      whereClause.pincode = pincode;
    }

    // Area filter
    if (area) {
      whereClause.area = { [Op.iLike]: `%${area}%` };
    }

    // Property type filter
    if (property_type) {
      whereClause.property_type = property_type;
    }

    // Ownership type filter
    if (ownership_type) {
      whereClause.ownership_type = ownership_type;
    }

    // BPL filter
    if (is_bpl !== undefined) {
      whereClause.is_bpl = is_bpl === 'true';
    }

    // Verification status filter
    if (verification_status) {
      whereClause.verification_status = verification_status;
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get households
    const { count, rows: households } = await Household.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: WardSecretariat,
          as: 'ward_secretariat',
          attributes: ['id', 'ward_number', 'ward_name'],
          required: false,
        },
        {
          model: Resident,
          as: 'residents',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'first_name', 'last_name', 'resident_id', 'is_head_of_household'],
        },
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true, // Important for correct count with associations
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      message: 'Households retrieved successfully',
      data: {
        households,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_households: count,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
        },
        filters: {
          search: q,
          ward_secretariat_id,
          pincode,
          area,
          property_type,
          ownership_type,
          is_bpl,
          verification_status,
          sort,
          order,
        },
      },
    });
  } catch (error) {
    console.error('Get households error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve households',
      error_code: 'GET_HOUSEHOLDS_FAILED',
    });
  }
};

/**
 * @desc    Get single household by ID
 * @route   GET /api/households/:id
 * @access  Private
 */
const getHouseholdById = async (req, res) => {
  try {
    const models = await getModels();
    const { Household, WardSecretariat, Resident } = models;

    const { id } = req.params;

    const household = await Household.findByPk(id, {
      include: [
        {
          model: WardSecretariat,
          as: 'ward_secretariat',
          attributes: ['id', 'ward_number', 'ward_name', 'ward_officer_name'],
        },
        {
          model: Resident,
          as: 'residents',
          attributes: { exclude: [] },
          order: [['is_head_of_household', 'DESC'], ['date_of_birth', 'ASC']],
        },
      ],
    });

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found',
        error_code: 'HOUSEHOLD_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Household retrieved successfully',
      data: {
        household,
      },
    });
  } catch (error) {
    console.error('Get household by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve household',
      error_code: 'GET_HOUSEHOLD_FAILED',
    });
  }
};

/**
 * @desc    Create new household
 * @route   POST /api/households
 * @access  Private
 */
const createHousehold = async (req, res) => {
  try {
    const models = await getModels();
    const { Household, WardSecretariat } = models;

    const {
      household_number,
      address_line1,
      address_line2,
      landmark,
      pincode,
      ward_secretariat_id,
      serial_number,
      voter_id_primary,
      ration_card_number,
      head_of_family,
      aadhaar_numbers,
      government_offices_nearby,
      schemes_eligible,
      remarks_issues,
      area,
      city,
      state,
      latitude,
      longitude,
      property_type,
      ownership_type,
      total_members,
      adult_members,
      children_count,
      senior_citizens_count,
      electricity_connection,
      water_connection,
      gas_connection,
      internet_connection,
      is_bpl,
      ration_card_type,
      primary_contact_number,
      secondary_contact_number,
      email,
      notes,
      verification_status,
      additional_info,
    } = req.body;

    // Validate ward secretariat exists (if provided)
    if (ward_secretariat_id) {
      const wardSecretariat = await WardSecretariat.findByPk(ward_secretariat_id);
      if (!wardSecretariat) {
        return res.status(404).json({
          success: false,
          message: 'Ward secretariat not found',
          error_code: 'WARD_SECRETARIAT_NOT_FOUND',
        });
      }
    }

    // Check if household_number is unique (if provided)
    if (household_number) {
      const existingHousehold = await Household.findOne({ where: { household_number } });
      if (existingHousehold) {
        return res.status(400).json({
          success: false,
          message: 'Household number already exists',
          error_code: 'HOUSEHOLD_NUMBER_EXISTS',
        });
      }
    }

    // Create household
    const household = await Household.create({
      household_number,
      address_line1,
      address_line2,
      landmark,
      pincode,
      ward_secretariat_id,
      serial_number,
      voter_id_primary,
      ration_card_number,
      head_of_family,
      aadhaar_numbers: aadhaar_numbers || [],
      government_offices_nearby: government_offices_nearby || [],
      schemes_eligible: schemes_eligible || [],
      remarks_issues,
      area,
      city: city || 'Municipal Ward',
      state,
      latitude,
      longitude,
      property_type: property_type || 'residential',
      ownership_type: ownership_type || 'owned',
      total_members: total_members || 0,
      adult_members: adult_members || 0,
      children_count: children_count || 0,
      senior_citizens_count: senior_citizens_count || 0,
      electricity_connection: electricity_connection !== undefined ? electricity_connection : true,
      water_connection: water_connection !== undefined ? water_connection : true,
      gas_connection: gas_connection || false,
      internet_connection: internet_connection || false,
      is_bpl: is_bpl || false,
      ration_card_type,
      primary_contact_number,
      secondary_contact_number,
      email,
      notes,
      verification_status: verification_status || 'pending',
      additional_info: additional_info || {},
    });

    // Get household with associations
    const createdHousehold = await Household.findByPk(household.id, {
      include: [
        {
          model: WardSecretariat,
          as: 'ward_secretariat',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Household created successfully',
      data: {
        household: createdHousehold,
      },
    });
  } catch (error) {
    console.error('Create household error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create household',
      error_code: 'CREATE_HOUSEHOLD_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update household
 * @route   PUT /api/households/:id
 * @access  Private
 */
const updateHousehold = async (req, res) => {
  try {
    const models = await getModels();
    const { Household, WardSecretariat } = models;

    const { id } = req.params;
    const updateData = req.body;

    const household = await Household.findByPk(id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found',
        error_code: 'HOUSEHOLD_NOT_FOUND',
      });
    }

    // If ward_secretariat_id is being changed, validate new ward
    if (updateData.ward_secretariat_id && updateData.ward_secretariat_id !== household.ward_secretariat_id) {
      const wardSecretariat = await WardSecretariat.findByPk(updateData.ward_secretariat_id);
      if (!wardSecretariat) {
        return res.status(404).json({
          success: false,
          message: 'Ward secretariat not found',
          error_code: 'WARD_SECRETARIAT_NOT_FOUND',
        });
      }
    }

    // If household_number is being changed, check uniqueness
    if (updateData.household_number && updateData.household_number !== household.household_number) {
      const existingHousehold = await Household.findOne({ where: { household_number: updateData.household_number } });
      if (existingHousehold) {
        return res.status(400).json({
          success: false,
          message: 'Household number already exists',
          error_code: 'HOUSEHOLD_NUMBER_EXISTS',
        });
      }
    }

    // Update household
    await household.update(updateData);

    // If update requested to recalculate member counts
    if (updateData.recalculate_members) {
      await household.updateMemberCounts();
    }

    // Get updated household with associations
    const updatedHousehold = await Household.findByPk(id, {
      include: [
        {
          model: WardSecretariat,
          as: 'ward_secretariat',
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Household updated successfully',
      data: {
        household: updatedHousehold,
      },
    });
  } catch (error) {
    console.error('Update household error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update household',
      error_code: 'UPDATE_HOUSEHOLD_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Delete household (soft delete)
 * @route   DELETE /api/households/:id
 * @access  Private
 */
const deleteHousehold = async (req, res) => {
  try {
    const models = await getModels();
    const { Household } = models;

    const { id } = req.params;

    const household = await Household.findByPk(id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found',
        error_code: 'HOUSEHOLD_NOT_FOUND',
      });
    }

    // Soft delete (paranoid: true in model)
    await household.destroy();

    res.status(200).json({
      success: true,
      message: 'Household deleted successfully',
      data: {
        deleted_household_id: id,
        deleted_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Delete household error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete household',
      error_code: 'DELETE_HOUSEHOLD_FAILED',
    });
  }
};

/**
 * @desc    Get household statistics
 * @route   GET /api/households/stats
 * @access  Private
 */
const getHouseholdStats = async (req, res) => {
  try {
    const models = await getModels();
    const { Household, Resident } = models;

    // Total households
    const totalHouseholds = await Household.count();

    // Property type distribution
    const propertyTypeStats = await Household.findAll({
      attributes: [
        'property_type',
        [Household.sequelize.fn('COUNT', Household.sequelize.col('id')), 'count'],
      ],
      group: ['property_type'],
      raw: true,
    });

    // Ownership type distribution
    const ownershipTypeStats = await Household.findAll({
      attributes: [
        'ownership_type',
        [Household.sequelize.fn('COUNT', Household.sequelize.col('id')), 'count'],
      ],
      group: ['ownership_type'],
      raw: true,
    });

    // BPL households
    const bplHouseholds = await Household.count({ where: { is_bpl: true } });
    const nonBplHouseholds = totalHouseholds - bplHouseholds;

    // Verification status distribution
    const verificationStatusStats = await Household.findAll({
      attributes: [
        'verification_status',
        [Household.sequelize.fn('COUNT', Household.sequelize.col('id')), 'count'],
      ],
      group: ['verification_status'],
      raw: true,
    });

    // Total members across all households
    const totalMembersResult = await Household.findAll({
      attributes: [
        [Household.sequelize.fn('SUM', Household.sequelize.col('total_members')), 'total'],
      ],
      raw: true,
    });
    const totalMembers = parseInt(totalMembersResult[0]?.total || 0);

    // Households by ward
    const wardStats = await Household.findAll({
      attributes: [
        'ward_secretariat_id',
        [Household.sequelize.fn('COUNT', Household.sequelize.col('id')), 'count'],
      ],
      where: {
        ward_secretariat_id: { [Op.not]: null },
      },
      group: ['ward_secretariat_id'],
      order: [['ward_secretariat_id', 'ASC']],
      raw: true,
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await Household.count({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Household statistics retrieved successfully',
      data: {
        total_households: totalHouseholds,
        total_members: totalMembers,
        bpl_households: bplHouseholds,
        non_bpl_households: nonBplHouseholds,
        recent_registrations: recentRegistrations,
        property_type_distribution: propertyTypeStats.reduce((acc, item) => {
          acc[item.property_type] = parseInt(item.count);
          return acc;
        }, {}),
        ownership_type_distribution: ownershipTypeStats.reduce((acc, item) => {
          acc[item.ownership_type] = parseInt(item.count);
          return acc;
        }, {}),
        verification_status_distribution: verificationStatusStats.reduce((acc, item) => {
          acc[item.verification_status] = parseInt(item.count);
          return acc;
        }, {}),
        ward_distribution: wardStats.reduce((acc, item) => {
          acc[item.ward_secretariat_id] = parseInt(item.count);
          return acc;
        }, {}),
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get household stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve household statistics',
      error_code: 'GET_HOUSEHOLD_STATS_FAILED',
    });
  }
};

/**
 * @desc    Get households by ward
 * @route   GET /api/households/by-ward/:wardId
 * @access  Private
 */
const getHouseholdsByWard = async (req, res) => {
  try {
    const models = await getModels();
    const { Household, WardSecretariat, Resident } = models;

    const { wardId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'desc',
    } = req.query;

    const whereClause = {
      ward_secretariat_id: wardId,
    };

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get households
    const { count, rows: households } = await Household.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: WardSecretariat,
          as: 'ward_secretariat',
          attributes: ['id', 'ward_number', 'ward_name'],
        },
        {
          model: Resident,
          as: 'residents',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'first_name', 'last_name', 'is_head_of_household'],
        },
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      message: 'Households by ward retrieved successfully',
      data: {
        households,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_households: count,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
        },
        ward_id: wardId,
      },
    });
  } catch (error) {
    console.error('Get households by ward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve households by ward',
      error_code: 'GET_HOUSEHOLDS_BY_WARD_FAILED',
    });
  }
};

module.exports = {
  getHouseholds,
  getHouseholdById,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  getHouseholdStats,
  getHouseholdsByWard,
};

