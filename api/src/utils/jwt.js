const jwt = require("jsonwebtoken");

/**
 * JWT Utility functions for Ward Management System
 */

// Generate JWT token
const generateToken = (payload, options = {}) => {
  const defaultOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: process.env.JWT_ISSUER || "ward-management-system",
    audience: process.env.JWT_AUDIENCE || "ward-management-users",
  };

  const tokenOptions = { ...defaultOptions, ...options };

  return jwt.sign(payload, process.env.JWT_SECRET, tokenOptions);
};

// Generate access token (short-lived)
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    ward_secretariat_id: user.ward_secretariat_id,
    is_active: user.is_active,
  };

  return generateToken(payload, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

// Generate refresh token (long-lived)
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    type: "refresh",
  };

  return generateToken(payload, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

// Generate email verification token
const generateEmailVerificationToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    type: "email_verification",
  };

  return generateToken(payload, {
    expiresIn: process.env.JWT_EMAIL_VERIFICATION_EXPIRES_IN || "24h",
  });
};

// Generate password reset token
const generatePasswordResetToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    type: "password_reset",
  };

  return generateToken(payload, {
    expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN || "1h",
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Decode JWT token without verification (for debugging)
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token from authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer token" and "token" formats
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return authHeader;
};

// Create token response object
const createTokenResponse = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Calculate expiration times
  const accessTokenDecoded = jwt.decode(accessToken);
  const refreshTokenDecoded = jwt.decode(refreshToken);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: accessTokenDecoded.exp - Math.floor(Date.now() / 1000),
    expires_at: new Date(accessTokenDecoded.exp * 1000).toISOString(),
    refresh_expires_in: refreshTokenDecoded.exp - Math.floor(Date.now() / 1000),
    refresh_expires_at: new Date(refreshTokenDecoded.exp * 1000).toISOString(),
  };
};

// Validate token payload structure
const validateTokenPayload = (payload, requiredFields = ["id", "email"]) => {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  return requiredFields.every((field) => payload.hasOwnProperty(field));
};

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  extractTokenFromHeader,
  createTokenResponse,
  validateTokenPayload,
};
