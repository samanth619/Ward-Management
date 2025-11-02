/**
 * Role-based Access Control (RBAC) middleware for Ward Management System
 * 
 * Roles:
 * - admin: Full system access, can manage users, view all wards
 * - staff: Can manage residents and households in their assigned ward
 * - read_only: Can only view data, no create/update/delete permissions
 */

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  'read_only': 1,
  'staff': 2,
  'admin': 3,
};

// Permission definitions
const PERMISSIONS = {
  // User management
  'users:create': ['admin'],
  'users:read': ['admin', 'staff', 'read_only'],
  'users:update': ['admin'],
  'users:delete': ['admin'],
  'users:read_all': ['admin'],
  
  // Resident management
  'residents:create': ['admin', 'staff'],
  'residents:read': ['admin', 'staff', 'read_only'],
  'residents:update': ['admin', 'staff'],
  'residents:delete': ['admin', 'staff'],
  'residents:read_all': ['admin'],
  
  // Household management
  'households:create': ['admin', 'staff'],
  'households:read': ['admin', 'staff', 'read_only'],
  'households:update': ['admin', 'staff'],
  'households:delete': ['admin', 'staff'],
  'households:read_all': ['admin'],
  
  // Scheme management
  'schemes:create': ['admin'],
  'schemes:read': ['admin', 'staff', 'read_only'],
  'schemes:update': ['admin'],
  'schemes:delete': ['admin'],
  
  // Scheme enrollment
  'enrollments:create': ['admin', 'staff'],
  'enrollments:read': ['admin', 'staff', 'read_only'],
  'enrollments:update': ['admin', 'staff'],
  'enrollments:delete': ['admin', 'staff'],
  
  // Conversations/Communication
  'conversations:create': ['admin', 'staff'],
  'conversations:read': ['admin', 'staff', 'read_only'],
  'conversations:update': ['admin', 'staff'],
  'conversations:delete': ['admin'],
  
  // Events
  'events:create': ['admin', 'staff'],
  'events:read': ['admin', 'staff', 'read_only'],
  'events:update': ['admin', 'staff'],
  'events:delete': ['admin'],
  
  // Notifications
  'notifications:create': ['admin', 'staff'],
  'notifications:read': ['admin', 'staff', 'read_only'],
  'notifications:update': ['admin'],
  'notifications:delete': ['admin'],
  
  // Reports and Analytics
  'reports:read': ['admin', 'staff', 'read_only'],
  'reports:export': ['admin', 'staff'],
  'analytics:read': ['admin', 'staff'],
  
  // System settings
  'settings:read': ['admin'],
  'settings:update': ['admin'],
  
  // Audit trails
  'audit:read': ['admin'],
};

/**
 * Check if user has required role
 * @param {Array|string} requiredRoles - Required role(s)
 * @returns {Function} Middleware function
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          error_code: 'AUTH_REQUIRED',
        });
      }

      const userRole = req.user.role;
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      // Check if user has any of the required roles
      if (!rolesArray.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions. Required role(s): ' + rolesArray.join(', '),
          error_code: 'INSUFFICIENT_ROLE',
          required_roles: rolesArray,
          user_role: userRole,
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during role verification.',
        error_code: 'ROLE_VERIFICATION_ERROR',
      });
    }
  };
};

/**
 * Check if user has required permission
 * @param {string} permission - Required permission
 * @returns {Function} Middleware function
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          error_code: 'AUTH_REQUIRED',
        });
      }

      const userRole = req.user.role;
      const allowedRoles = PERMISSIONS[permission];

      if (!allowedRoles) {
        console.error(`Unknown permission: ${permission}`);
        return res.status(500).json({
          success: false,
          message: 'Invalid permission configuration.',
          error_code: 'INVALID_PERMISSION',
        });
      }

      // Check if user's role has the required permission
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required permission: ${permission}`,
          error_code: 'INSUFFICIENT_PERMISSION',
          required_permission: permission,
          user_role: userRole,
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission verification.',
        error_code: 'PERMISSION_VERIFICATION_ERROR',
      });
    }
  };
};

/**
 * Check if user has minimum role level
 * @param {string} minimumRole - Minimum required role
 * @returns {Function} Middleware function
 */
const requireMinimumRole = (minimumRole) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          error_code: 'AUTH_REQUIRED',
        });
      }

      const userRole = req.user.role;
      const userLevel = ROLE_HIERARCHY[userRole];
      const requiredLevel = ROLE_HIERARCHY[minimumRole];

      if (!userLevel || !requiredLevel) {
        return res.status(500).json({
          success: false,
          message: 'Invalid role configuration.',
          error_code: 'INVALID_ROLE_CONFIG',
        });
      }

      // Check if user's role level meets minimum requirement
      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          message: `Insufficient role level. Minimum required: ${minimumRole}`,
          error_code: 'INSUFFICIENT_ROLE_LEVEL',
          minimum_role: minimumRole,
          user_role: userRole,
        });
      }

      next();
    } catch (error) {
      console.error('Minimum role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during role level verification.',
        error_code: 'ROLE_LEVEL_VERIFICATION_ERROR',
      });
    }
  };
};

/**
 * Check if user can access specific ward data
 * @param {Function} getWardNumber - Function to extract ward number from request
 * @returns {Function} Middleware function
 */
const requireWardAccess = (getWardNumber) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          error_code: 'AUTH_REQUIRED',
        });
      }

      const userRole = req.user.role;
      const userWardNumber = req.user.ward_number;

      // Admins can access all wards
      if (userRole === 'admin') {
        return next();
      }

      // Get the ward number being accessed
      const requestedWardNumber = getWardNumber(req);

      // If no specific ward is being accessed, allow (general endpoints)
      if (!requestedWardNumber) {
        return next();
      }

      // Staff and read_only users can only access their assigned ward
      if (userWardNumber && userWardNumber === requestedWardNumber) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access data from your assigned ward.',
        error_code: 'WARD_ACCESS_DENIED',
        user_ward: userWardNumber,
        requested_ward: requestedWardNumber,
      });
    } catch (error) {
      console.error('Ward access middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during ward access verification.',
        error_code: 'WARD_ACCESS_VERIFICATION_ERROR',
      });
    }
  };
};

/**
 * Check if user can modify their own data or if they have admin privileges
 * @param {Function} getUserId - Function to extract user ID from request
 * @returns {Function} Middleware function
 */
const requireSelfOrAdmin = (getUserId) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          error_code: 'AUTH_REQUIRED',
        });
      }

      const currentUserId = req.user.id;
      const userRole = req.user.role;
      const targetUserId = getUserId(req);

      // Admins can modify any user
      if (userRole === 'admin') {
        return next();
      }

      // Users can modify their own data
      if (currentUserId === targetUserId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own data or need admin privileges.',
        error_code: 'SELF_OR_ADMIN_REQUIRED',
      });
    } catch (error) {
      console.error('Self or admin middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during self/admin verification.',
        error_code: 'SELF_ADMIN_VERIFICATION_ERROR',
      });
    }
  };
};

/**
 * Utility function to get user's permissions
 * @param {string} userRole - User's role
 * @returns {Array} Array of permissions
 */
const getUserPermissions = (userRole) => {
  const userPermissions = [];
  
  for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(userRole)) {
      userPermissions.push(permission);
    }
  }
  
  return userPermissions;
};

/**
 * Check if user has permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has permission
 */
const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles && allowedRoles.includes(userRole);
};

// Common role combinations
const ADMIN_ONLY = requireRole('admin');
const STAFF_OR_ADMIN = requireRole(['staff', 'admin']);
const ALL_ROLES = requireRole(['admin', 'staff', 'read_only']);

// Common permission checks
const REQUIRE_READ_PERMISSION = requirePermission;
const REQUIRE_WRITE_PERMISSION = requirePermission;

module.exports = {
  requireRole,
  requirePermission,
  requireMinimumRole,
  requireWardAccess,
  requireSelfOrAdmin,
  getUserPermissions,
  hasPermission,
  ADMIN_ONLY,
  STAFF_OR_ADMIN,
  ALL_ROLES,
  REQUIRE_READ_PERMISSION,
  REQUIRE_WRITE_PERMISSION,
  PERMISSIONS,
  ROLE_HIERARCHY,
};