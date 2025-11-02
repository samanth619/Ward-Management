const { getModels } = require('../models');
const { 
  createTokenResponse, 
  generateEmailVerificationToken 
} = require('../utils/jwt');
const { getUserPermissions } = require('../middleware/rbacMiddleware');
const { Op } = require('sequelize');

/**
 * User Management Controller for Ward Management System
 * Admin-only functionality for managing users
 */

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res) => {
  try {
    const models = await getModels();
    const { User } = models;

    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'desc',
      q,
      role,
      ward_number,
      is_active,
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Search query
    if (q) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { phone: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // Role filter
    if (role) {
      whereClause.role = role;
    }

    // Ward number filter
    if (ward_number) {
      whereClause.ward_number = ward_number;
    }

    // Active status filter
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    // For non-admin users, limit to their ward
    if (req.user.role !== 'admin' && req.user.ward_number) {
      whereClause.ward_number = req.user.ward_number;
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get users
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      attributes: { exclude: ['password'] },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_users: count,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
        },
        filters: {
          search: q,
          role,
          ward_number,
          is_active,
          sort,
          order,
        },
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error_code: 'GET_USERS_FAILED',
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin or Self)
 */
const getUserById = async (req, res) => {
  try {
    const models = await getModels();
    const { User } = models;

    const { id } = req.params;
    const currentUser = req.user;

    // Check if user is trying to access their own data or is admin
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own profile or need admin privileges',
        error_code: 'ACCESS_DENIED',
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
    }

    // For non-admin users, check ward access
    if (currentUser.role !== 'admin' && currentUser.ward_number && 
        user.ward_number && currentUser.ward_number !== user.ward_number) {
      return res.status(403).json({
        success: false,
        message: 'You can only access users from your assigned ward',
        error_code: 'WARD_ACCESS_DENIED',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: user.toJSON(),
        permissions: getUserPermissions(user.role),
      },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error_code: 'GET_USER_FAILED',
    });
  }
};

/**
 * @desc    Create new user (Admin only)
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
const createUser = async (req, res) => {
  try {
    const models = await getModels();
    const { User } = models;

    const {
      name,
      email,
      password,
      phone,
      role = 'staff',
      ward_number,
      is_active = true,
      send_invitation = false,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        error_code: 'USER_EXISTS',
      });
    }

    // Create user data
    const userData = {
      name,
      email: email.toLowerCase(),
      phone,
      role,
      ward_number,
      is_active,
      email_verified: false,
    };

    // Set password or generate temporary one
    if (password) {
      userData.password = password;
    } else {
      // Generate temporary password
      userData.password = Math.random().toString(36).slice(-12) + '!A1';
    }

    const user = await User.create(userData);

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken(user);
    await user.update({ email_verification_token: emailVerificationToken });

    // TODO: Send invitation email if requested
    if (send_invitation) {
      // await sendUserInvitation(user.email, emailVerificationToken, password);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: user.toJSON(),
        invitation_sent: send_invitation,
        temporary_password: !password ? userData.password : undefined,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error_code: 'CREATE_USER_FAILED',
    });
  }
};

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
const updateUser = async (req, res) => {
  try {
    const models = await getModels();
    const { User } = models;

    const { id } = req.params;
    const {
      name,
      phone,
      role,
      ward_number,
      is_active,
      preferences,
    } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id && is_active === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
        error_code: 'SELF_DEACTIVATION_FORBIDDEN',
      });
    }

    // Prevent last admin from being demoted
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.count({ where: { role: 'admin', is_active: true } });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the last admin user',
          error_code: 'LAST_ADMIN_PROTECTION',
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (ward_number !== undefined) updateData.ward_number = ward_number;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (preferences !== undefined) updateData.preferences = preferences;

    // Update user
    await user.update(updateData);

    // Get updated user data
    const updatedUser = await User.findByPk(id);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser.toJSON(),
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error_code: 'UPDATE_USER_FAILED',
    });
  }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
        error_code: 'SELF_DELETION_FORBIDDEN',
      });
    }

    // Prevent deletion of the last admin
    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin', is_active: true } });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user',
          error_code: 'LAST_ADMIN_PROTECTION',
        });
      }
    }

    // Soft delete (paranoid: true in model)
    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deleted_user_id: id,
        deleted_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error_code: 'DELETE_USER_FAILED',
    });
  }
};

/**
 * @desc    Reset user password (Admin only)
 * @route   POST /api/users/:id/reset-password
 * @access  Private (Admin only)
 */
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { send_email = true } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
    }

    // Generate temporary password
    const temporaryPassword = Math.random().toString(36).slice(-12) + '!A1';

    // Update user password
    await user.update({ password: temporaryPassword });

    // TODO: Send password reset email if requested
    if (send_email) {
      // await sendPasswordResetNotification(user.email, temporaryPassword);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        user_id: id,
        temporary_password: temporaryPassword,
        email_sent: send_email,
        reset_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset user password',
      error_code: 'RESET_PASSWORD_FAILED',
    });
  }
};

/**
 * @desc    Get user statistics (Admin only)
 * @route   GET /api/users/stats
 * @access  Private (Admin only)
 */
const getUserStats = async (req, res) => {
  try {
    // Get user counts by role
    const roleStats = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      where: { is_active: true },
      group: ['role'],
      raw: true,
    });

    // Get total users
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const inactiveUsers = totalUsers - activeUsers;

    // Get users by ward
    const wardStats = await User.findAll({
      attributes: [
        'ward_number',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      where: { 
        is_active: true,
        ward_number: { [Op.not]: null }
      },
      group: ['ward_number'],
      order: [['ward_number', 'ASC']],
      raw: true,
    });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.count({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo }
      }
    });

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        total_users: totalUsers,
        active_users: activeUsers,
        inactive_users: inactiveUsers,
        recent_registrations: recentRegistrations,
        role_distribution: roleStats.reduce((acc, item) => {
          acc[item.role] = parseInt(item.count);
          return acc;
        }, {}),
        ward_distribution: wardStats.reduce((acc, item) => {
          acc[item.ward_number] = parseInt(item.count);
          return acc;
        }, {}),
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics',
      error_code: 'GET_STATS_FAILED',
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats,
};