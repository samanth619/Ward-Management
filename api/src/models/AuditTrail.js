const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AuditTrail = sequelize.define(
    "AuditTrail",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      // Note: audit_id removed - not present in migration
      entity_type: {
        type: DataTypes.STRING(50), // Changed from ENUM to STRING to match migration
        allowNull: false,
        comment: "Type of entity that was modified",
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "ID of the entity that was modified",
      },
      action: {
        type: DataTypes.STRING(50), // Changed from ENUM to STRING to match migration
        allowNull: false,
        comment: "Action that was performed",
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "user_id", // Explicitly map to user_id column
        references: {
          model: "users",
          key: "id",
        },
        comment: "User who performed the action (null for system actions)",
      },
      // Note: timestamp removed - migration uses created_at instead
      old_values: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Previous values before the change (for updates)",
      },
      new_values: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "New values after the change (for creates/updates)",
      },
      changed_fields: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of field names that were changed",
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: "IP address from where the action was performed",
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "User agent string of the client",
      },
      session_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Session ID when the action was performed",
      },
      request_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Unique request ID for tracing",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Reason for the change (provided by user or system)",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Additional notes about the action",
      },
      severity: {
        type: DataTypes.STRING(20), // Changed from ENUM to STRING to match migration
        allowNull: true,
        comment: "Severity level of the action",
      },
      category: {
        type: DataTypes.STRING(50), // Changed from ENUM to STRING to match migration
        allowNull: true,
        comment: "Category of the audit event",
      },
      success: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Whether the action was successful",
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Error message if the action failed",
      },
      error_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Error code if the action failed",
      },
      duration_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Duration of the operation in milliseconds",
      },
      affected_records: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Number of records affected by the action",
      },
      resource_accessed: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Resource or endpoint that was accessed",
      },
      http_method: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "HTTP method used (GET, POST, PUT, DELETE, etc.)",
      },
      response_status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "HTTP response status code",
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "File path for file-related operations",
      },
      file_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "File size for file-related operations",
      },
      checksum: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Checksum for data integrity verification",
      },
      compliance_flags: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: "Compliance-related flags and metadata",
      },
      retention_policy: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Data retention policy for this audit record",
      },
      geo_location: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Geographic location information if available",
      },
      device_info: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Device information for mobile/app access",
      },
      integration_source: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Source system for integrated operations",
      },
      correlation_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Correlation ID for linking related audit events",
      },
      parent_audit_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "audit_trails",
          key: "id",
        },
        comment: "Parent audit record for nested operations",
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Tags for easier searching and categorization",
      },
      sensitive_data: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether this audit record contains sensitive data",
      },
      archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether this record has been archived",
      },
      archived_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "When this record was archived",
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: "Additional metadata for the audit record",
      },
    },
    {
      tableName: "audit_trails",
      timestamps: true,
      updatedAt: false, // Audit records should not be updated
      indexes: [
        // Note: audit_id index removed - column doesn't exist in migration
        {
          fields: ["entity_type"],
        },
        {
          fields: ["entity_id"],
        },
        {
          fields: ["action"],
        },
        {
          fields: ["user_id"],
        },
        {
          fields: ["category"],
        },
        {
          fields: ["severity"],
        },
        {
          fields: ["success"],
        },
        {
          fields: ["ip_address"],
        },
        {
          fields: ["session_id"],
        },
        {
          fields: ["request_id"],
        },
        {
          fields: ["correlation_id"],
        },
        {
          fields: ["parent_audit_id"],
        },
        {
          fields: ["archived"],
        },
        {
          fields: ["sensitive_data"],
        },
        {
          name: "audit_entity_action_idx",
          fields: ["entity_type", "entity_id", "action"],
        },
        {
          name: "audit_user_created_idx",
          fields: ["user_id", "created_at"],
        },
        {
          name: "audit_created_category_idx",
          fields: ["created_at", "category"],
        },
      ],
      hooks: {
        // Note: audit_id removed - not present in migration
      },
    }
  );

  // Instance methods
  AuditTrail.prototype.getDurationInSeconds = function () {
    return this.duration_ms ? this.duration_ms / 1000 : null;
  };

  AuditTrail.prototype.isHighRisk = function () {
    const highRiskActions = [
      "delete",
      "bulk_delete",
      "permission_change",
      "password_change",
    ];
    const highRiskCategories = [
      "security_event",
      "permission_change",
      "system_administration",
    ];

    return (
      this.severity === "critical" ||
      this.severity === "high" ||
      highRiskActions.includes(this.action) ||
      highRiskCategories.includes(this.category) ||
      !this.success
    );
  };

  AuditTrail.prototype.getChangedFieldsCount = function () {
    return this.changed_fields ? this.changed_fields.length : 0;
  };

  AuditTrail.prototype.hasFieldChanged = function (fieldName) {
    return this.changed_fields && this.changed_fields.includes(fieldName);
  };

  AuditTrail.prototype.getOldValue = function (fieldName) {
    return this.old_values && this.old_values[fieldName];
  };

  AuditTrail.prototype.getNewValue = function (fieldName) {
    return this.new_values && this.new_values[fieldName];
  };

  // Class methods
  AuditTrail.findByEntity = function (entityType, entityId) {
    return this.findAll({
      where: {
        entity_type: entityType,
        entity_id: entityId,
      },
      order: [["created_at", "DESC"]],
      include: ["user", "parent_audit"],
    });
  };

  AuditTrail.findByUser = function (userId) {
    return this.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      include: ["parent_audit"],
    });
  };

  AuditTrail.findByAction = function (action) {
    return this.findAll({
      where: { action },
      order: [["created_at", "DESC"]],
      include: ["user"],
    });
  };

  AuditTrail.findByCategory = function (category) {
    return this.findAll({
      where: { category },
      order: [["created_at", "DESC"]],
      include: ["user"],
    });
  };

  AuditTrail.findBySeverity = function (severity) {
    return this.findAll({
      where: { severity },
      order: [["created_at", "DESC"]],
      include: ["user"],
    });
  };

  AuditTrail.findFailed = function () {
    return this.findAll({
      where: { success: false },
      order: [["created_at", "DESC"]],
      include: ["user"],
    });
  };

  AuditTrail.findByDateRange = function (startDate, endDate) {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["created_at", "DESC"]],
      include: ["user"],
    });
  };

  AuditTrail.findBySession = function (sessionId) {
    return this.findAll({
      where: { session_id: sessionId },
      order: [["created_at", "ASC"]],
    });
  };

  AuditTrail.findByCorrelation = function (correlationId) {
    return this.findAll({
      where: { correlation_id: correlationId },
      order: [["created_at", "ASC"]],
      include: ["user"],
    });
  };

  AuditTrail.findSecurityEvents = function () {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        [Op.or]: [
          { category: "security_event" },
          {
            action: {
              [Op.in]: [
                "login",
                "logout",
                "password_change",
                "permission_change",
              ],
            },
          },
          { severity: { [Op.in]: ["high", "critical"] } },
          { success: false },
        ],
      },
      order: [["created_at", "DESC"]],
      include: ["user"],
    });
  };

  AuditTrail.findSensitiveDataAccess = function () {
    return this.findAll({
      where: { sensitive_data: true },
      order: [["created_at", "DESC"]],
      include: ["user"],
    });
  };

  AuditTrail.getActivitySummary = async function (
    startDate,
    endDate,
    groupBy = "action"
  ) {
    const { Op } = sequelize.Sequelize;
    const whereClause = {};

    if (startDate && endDate) {
      whereClause.created_at = { [Op.between]: [startDate, endDate] };
    }

    const summary = await this.findAll({
      where: whereClause,
      attributes: [
        groupBy,
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal("CASE WHEN success = true THEN 1 END")
          ),
          "success_count",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal("CASE WHEN success = false THEN 1 END")
          ),
          "failure_count",
        ],
      ],
      group: [groupBy],
      raw: true,
    });

    return summary;
  };

  AuditTrail.getUserActivity = async function (userId, startDate, endDate) {
    const { Op } = sequelize.Sequelize;
    const whereClause = { updated_by: userId };

    if (startDate && endDate) {
      whereClause.created_at = { [Op.between]: [startDate, endDate] };
    }

    const activity = await this.findAll({
      where: whereClause,
      attributes: [
        "action",
        "entity_type",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("MAX", sequelize.col("created_at")), "last_action"],
      ],
      group: ["action", "entity_type"],
      raw: true,
    });

    return activity;
  };

  // Static method to create audit trail
  AuditTrail.createAuditLog = async function (params) {
    const {
      entityType,
      entityId,
      action,
      updatedBy,
      oldValues = null,
      newValues = null,
      changedFields = [],
      ipAddress = null,
      userAgent = null,
      sessionId = null,
      requestId = null,
      reason = null,
      severity = "low",
      category = "other",
      success = true,
      errorMessage = null,
      duration = null,
      affectedRecords = null,
      metadata = {},
    } = params;

    return await this.create({
      entity_type: entityType,
      entity_id: entityId,
      action,
      user_id: updatedBy,
      old_values: oldValues,
      new_values: newValues,
      changed_fields: changedFields,
      ip_address: ipAddress,
      user_agent: userAgent,
      session_id: sessionId,
      request_id: requestId,
      reason,
      severity,
      category,
      success,
      error_message: errorMessage,
      duration_ms: duration,
      affected_records: affectedRecords,
      metadata,
    });
  };

  // Associations
  AuditTrail.associate = function (models) {
    // AuditTrail belongs to user (who performed the action)
    AuditTrail.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    // AuditTrail belongs to parent audit (for nested operations)
    AuditTrail.belongsTo(models.AuditTrail, {
      foreignKey: "parent_audit_id",
      as: "parent_audit",
    });

    // AuditTrail has many child audits (for nested operations)
    AuditTrail.hasMany(models.AuditTrail, {
      foreignKey: "parent_audit_id",
      as: "child_audits",
    });
  };

  return AuditTrail;
};
