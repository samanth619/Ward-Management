const { verifyToken, extractTokenFromHeader, validateTokenPayload } = require('../utils/jwt');
const { getModels } = require('../models');

/**
 * Authentication middleware for protecting routes
 */

// Protect middleware - requires valid JWT token
const protect = async (req, res, next) => {
  try {
    const models = await getModels();
    const { User } = models;

    let token;

    // Get token from header
    const authHeader = req.headers.authorization;
    token = extractTokenFromHeader(authHeader);

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error_code: 'NO_TOKEN',
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Validate token payload
      if (!validateTokenPayload(decoded, ['id', 'email', 'role'])) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Invalid token payload.',
          error_code: 'INVALID_TOKEN_PAYLOAD',
        });
      }

      // Check if token is for access (not refresh or other types)
      if (decoded.type && decoded.type !== 'access') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Invalid token type.',
          error_code: 'INVALID_TOKEN_TYPE',
        });
      }

      // Get user from database
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found.',
          error_code: 'USER_NOT_FOUND',
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User account is deactivated.',
          error_code: 'USER_DEACTIVATED',
        });
      }

      // Add user to request object
      req.user = user;
      req.token = token;

      next();
    } catch (tokenError) {
      let message = 'Access denied. Invalid token.';
      let errorCode = 'INVALID_TOKEN';

      if (tokenError.name === 'TokenExpiredError') {
        message = 'Access denied. Token has expired.';
        errorCode = 'TOKEN_EXPIRED';
      } else if (tokenError.name === 'JsonWebTokenError') {
        message = 'Access denied. Malformed token.';
        errorCode = 'MALFORMED_TOKEN';
      }

      return res.status(401).json({
        success: false,
        message,
        error_code: errorCode,
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      error_code: 'AUTH_SERVER_ERROR',
    });
  }
};

// Optional authentication - doesn't fail if no token, but sets user if valid token
const optionalAuth = async (req, res, next) => {
  try {
    const models = await getModels();
    const { User } = models;

    let token;

    // Get token from header
    const authHeader = req.headers.authorization;
    token = extractTokenFromHeader(authHeader);

    // If no token, continue without user
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Validate token payload
      if (!validateTokenPayload(decoded, ['id', 'email', 'role'])) {
        req.user = null;
        return next();
      }

      // Get user from database
      const user = await User.findByPk(decoded.id);

      if (!user || !user.is_active) {
        req.user = null;
        return next();
      }

      // Add user to request object
      req.user = user;
      req.token = token;

      next();
    } catch (tokenError) {
      // If token is invalid, continue without user
      req.user = null;
      next();
    }
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Verify refresh token middleware
const verifyRefreshToken = async (req, res, next) => {
  try {
    const models = await getModels();
    const { User } = models;

    let token;

    // Get token from body or header
    token = req.body.refresh_token || extractTokenFromHeader(req.headers.authorization);

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required.',
        error_code: 'NO_REFRESH_TOKEN',
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Validate token payload and type
      if (!validateTokenPayload(decoded, ['id', 'email']) || decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token.',
          error_code: 'INVALID_REFRESH_TOKEN',
        });
      }

      // Get user from database
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found.',
          error_code: 'USER_NOT_FOUND',
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated.',
          error_code: 'USER_DEACTIVATED',
        });
      }

      // Add user to request object
      req.user = user;
      req.refreshToken = token;

      next();
    } catch (tokenError) {
      let message = 'Invalid refresh token.';
      let errorCode = 'INVALID_REFRESH_TOKEN';

      if (tokenError.name === 'TokenExpiredError') {
        message = 'Refresh token has expired.';
        errorCode = 'REFRESH_TOKEN_EXPIRED';
      }

      return res.status(401).json({
        success: false,
        message,
        error_code: errorCode,
      });
    }
  } catch (error) {
    console.error('Refresh token middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh.',
      error_code: 'REFRESH_SERVER_ERROR',
    });
  }
};

// Verify email verification token
const verifyEmailToken = async (req, res, next) => {
  try {
    const models = await getModels();
    const { User } = models;

    const token = req.params.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Email verification token required.',
        error_code: 'NO_EMAIL_TOKEN',
      });
    }

    try {
      const decoded = verifyToken(token);

      if (!validateTokenPayload(decoded, ['id', 'email']) || decoded.type !== 'email_verification') {
        return res.status(400).json({
          success: false,
          message: 'Invalid email verification token.',
          error_code: 'INVALID_EMAIL_TOKEN',
        });
      }

      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
          error_code: 'USER_NOT_FOUND',
        });
      }

      req.user = user;
      req.emailToken = token;

      next();
    } catch (tokenError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token.',
        error_code: 'INVALID_EMAIL_TOKEN',
      });
    }
  } catch (error) {
    console.error('Email verification middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during email verification.',
      error_code: 'EMAIL_VERIFICATION_ERROR',
    });
  }
};

// Verify password reset token
const verifyPasswordResetToken = async (req, res, next) => {
  try {
    const models = await getModels();
    const { User } = models;

    const token = req.params.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token required.',
        error_code: 'NO_RESET_TOKEN',
      });
    }

    try {
      const decoded = verifyToken(token);

      if (!validateTokenPayload(decoded, ['id', 'email']) || decoded.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          message: 'Invalid password reset token.',
          error_code: 'INVALID_RESET_TOKEN',
        });
      }

      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
          error_code: 'USER_NOT_FOUND',
        });
      }

      req.user = user;
      req.resetToken = token;

      next();
    } catch (tokenError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
        error_code: 'INVALID_RESET_TOKEN',
      });
    }
  } catch (error) {
    console.error('Password reset middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during password reset.',
      error_code: 'PASSWORD_RESET_ERROR',
    });
  }
};

module.exports = {
  protect,
  optionalAuth,
  verifyRefreshToken,
  verifyEmailToken,
  verifyPasswordResetToken,
};