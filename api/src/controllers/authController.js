const bcrypt = require('bcryptjs');
const { getModels } = require('../models');
const { 
  createTokenResponse, 
  generateEmailVerificationToken, 
  generatePasswordResetToken 
} = require('../utils/jwt');

/**
 * Authentication Controller for Ward Management System
 */

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public (but may require admin approval)
 */
const register = async (req, res) => {
  try {
    const models = await getModels();
    const { User } = models;

    const { 
      name, 
      email, 
      password, 
      phone, 
      role = 'staff', 
      ward_secretariat_id 
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

    // Create user
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role,
      ward_secretariat_id,
      is_active: true, // Set to false if requiring admin approval
      email_verified: false,
    };

    const user = await User.create(userData);

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken(user);
    
    // Update user with verification token
    await user.update({ email_verification_token: emailVerificationToken });

    // TODO: Send email verification email
    // await sendEmailVerification(user.email, emailVerificationToken);

    // Create token response
    const tokenResponse = createTokenResponse(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: user.toJSON(),
        tokens: tokenResponse,
        email_verification_required: true,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error_code: 'REGISTER_FAILED',
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const models = await getModels();
    const { User } = models;

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error_code: 'INVALID_CREDENTIALS',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
        error_code: 'ACCOUNT_DEACTIVATED',
      });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error_code: 'INVALID_CREDENTIALS',
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Create token response
    const tokenResponse = createTokenResponse(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        tokens: tokenResponse,
        email_verified: user.email_verified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error_code: 'LOGIN_FAILED',
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (with valid refresh token)
 */
const refreshToken = async (req, res) => {
  try {
    const user = req.user; // Set by verifyRefreshToken middleware

    // Check if user is still active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
        error_code: 'ACCOUNT_DEACTIVATED',
      });
    }

    // Create new token response
    const tokenResponse = createTokenResponse(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: tokenResponse,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error_code: 'REFRESH_FAILED',
    });
  }
};

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is primarily handled client-side
    // Here we can optionally blacklist the token or perform cleanup
    
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: {
        logged_out_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error_code: 'LOGOUT_FAILED',
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const models = await getModels();
    const { User } = models;

    const user = req.user; // Set by protect middleware

    // Get fresh user data
    const currentUser = await User.findByPk(user.id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: currentUser.toJSON(),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error_code: 'PROFILE_FETCH_FAILED',
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const models = await getModels();
    const { User } = models;

    const user = req.user; // Set by protect middleware
    const { name, phone, ward_secretariat_id, preferences } = req.body;

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (preferences !== undefined) updateData.preferences = preferences;
    
    // Only allow ward_secretariat_id update for admins or if user doesn't have one
    if (ward_secretariat_id !== undefined) {
      if (user.role === 'admin' || !user.ward_secretariat_id) {
        updateData.ward_secretariat_id = ward_secretariat_id;
      } else {
        return res.status(403).json({
          success: false,
          message: 'You cannot change your ward secretariat assignment. Contact an administrator.',
          error_code: 'WARD_UPDATE_FORBIDDEN',
        });
      }
    }

    // Update user
    await user.update(updateData);

    // Get updated user data
    const updatedUser = await User.findByPk(user.id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toJSON(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error_code: 'PROFILE_UPDATE_FAILED',
    });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const user = req.user; // Set by protect middleware
    const { current_password, password } = req.body;

    // Validate current password
    const isCurrentPasswordValid = await user.validatePassword(current_password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        error_code: 'INVALID_CURRENT_PASSWORD',
      });
    }

    // Update password
    await user.update({ password });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {
        changed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error_code: 'PASSWORD_CHANGE_FAILED',
    });
  }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const models = await getModels();
    const { User } = models;

    const { email } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken(user);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: resetExpires,
    });

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error_code: 'PASSWORD_RESET_REQUEST_FAILED',
    });
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public (with valid reset token)
 */
const resetPassword = async (req, res) => {
  try {
    const user = req.user; // Set by verifyPasswordResetToken middleware
    const { password } = req.body;

    // Update password and clear reset token
    await user.update({
      password,
      password_reset_token: null,
      password_reset_expires: null,
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
      data: {
        reset_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error_code: 'PASSWORD_RESET_FAILED',
    });
  }
};

/**
 * @desc    Verify email address
 * @route   GET /api/auth/verify-email/:token
 * @access  Public (with valid email verification token)
 */
const verifyEmail = async (req, res) => {
  try {
    const user = req.user; // Set by verifyEmailToken middleware

    // Update user email verification status
    await user.update({
      email_verified: true,
      email_verification_token: null,
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        verified_at: new Date().toISOString(),
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error_code: 'EMAIL_VERIFICATION_FAILED',
    });
  }
};

/**
 * @desc    Resend email verification
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
const resendEmailVerification = async (req, res) => {
  try {
    const user = req.user; // Set by protect middleware

    // Check if email is already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
        error_code: 'EMAIL_ALREADY_VERIFIED',
      });
    }

    // Generate new verification token
    const emailVerificationToken = generateEmailVerificationToken(user);

    // Update user with new verification token
    await user.update({ email_verification_token: emailVerificationToken });

    // TODO: Send email verification email
    // await sendEmailVerification(user.email, emailVerificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email has been sent',
      data: {
        sent_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error_code: 'RESEND_VERIFICATION_FAILED',
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
};