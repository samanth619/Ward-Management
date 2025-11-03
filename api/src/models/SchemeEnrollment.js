const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SchemeEnrollment = sequelize.define(
    "SchemeEnrollment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      // Note: enrollment_id removed - not present in migration
      resident_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "residents",
          key: "id",
        },
      },
      scheme_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "schemes",
          key: "id",
        },
      },
      application_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      application_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Official application number from government system",
      },
      status: {
        type: "enrollment_status", // Use the ENUM type from migration
        allowNull: true,
        defaultValue: "pending",
      },
      // Note: priority removed - not present in migration
      applied_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        comment: "Staff member who helped with the application",
      },
      documents_submitted: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "List of documents submitted with application",
      },
      // Note: Many fields removed - not present in migration
      // Only fields present in migration: applied_by, approved_by, approval_date, rejection_reason, benefit_amount, benefit_received, documents_submitted, notes, additional_info
      approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      approval_date: {
        type: DataTypes.DATEONLY,
        field: "approval_date",
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      benefit_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      benefit_received: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      additional_info: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: "Additional enrollment information",
      },
    },
    {
      tableName: "scheme_enrollments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        // Note: enrollment_id index removed - column doesn't exist in migration
        {
          fields: ["resident_id"],
        },
        {
          fields: ["scheme_id"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["application_date"],
        },
        {
          fields: ["applied_by"],
        },
        {
          fields: ["application_number"],
        },
        {
          name: "scheme_enrollment_resident_scheme_idx",
          fields: ["resident_id", "scheme_id"],
        },
      ],
      hooks: {
        beforeCreate: (enrollment) => {
          // Note: enrollment_id removed - not present in migration
        },
        afterUpdate: (enrollment) => {
          // Note: audit_trail removed - not present in migration
          // Status changes can be tracked via audit_trails table if needed
        },
      },
    }
  );

  // Instance methods
  SchemeEnrollment.prototype.updateStatus = async function (
    newStatus,
    remarks = null,
    updatedBy = null
  ) {
    const oldStatus = this.status;
    this.status = newStatus;

    // Set specific dates based on status
    const now = new Date();
    switch (newStatus) {
      case "approved":
        this.approval_date = now;
        break;
      case "rejected":
        if (remarks) this.rejection_reason = remarks;
        break;
      // Note: verified, beneficiary, rejection_date, verification_date, verification_remarks, benefit_start_date removed - not in migration
    }

    // Note: audit_trail removed - not present in migration
    // Status changes can be tracked via audit_trails table if needed

    await this.save();
  };

  SchemeEnrollment.prototype.addBenefitReceived = async function (
    amount,
    date = null
  ) {
    // Update benefit_received field (from migration)
    this.benefit_received =
      parseFloat(this.benefit_received || 0) + parseFloat(amount);
    // Note: last_benefit_date, benefits_frequency, next_benefit_due, total_benefits_received removed - not in migration

    await this.save();
  };

  SchemeEnrollment.prototype.getDaysInStatus = function () {
    const statusChangeDate = this.updated_at || this.created_at;
    const now = new Date();
    return Math.ceil((now - statusChangeDate) / (1000 * 60 * 60 * 24));
  };

  // Note: isOverdue removed - next_follow_up_date not in migration

  // Class methods
  SchemeEnrollment.findByResident = function (residentId) {
    return this.findAll({
      where: { resident_id: residentId },
      include: ["scheme"],
      order: [["application_date", "DESC"]],
    });
  };

  SchemeEnrollment.findByScheme = function (schemeId) {
    return this.findAll({
      where: { scheme_id: schemeId },
      include: ["resident"],
      order: [["application_date", "DESC"]],
    });
  };

  SchemeEnrollment.findByStatus = function (status) {
    return this.findAll({
      where: { status },
      include: ["resident", "scheme"],
      order: [["application_date", "DESC"]],
    });
  };

  SchemeEnrollment.findPendingApplications = function () {
    const { Op } = sequelize.Sequelize;
    return this.findAll({
      where: {
        status: "pending", // Use status from migration ENUM: pending, approved, rejected, suspended, completed
      },
      include: ["resident", "scheme"],
      order: [["application_date", "ASC"]],
    });
  };

  // Note: findOverdueFollowUps removed - follow_up_required, next_follow_up_date not in migration

  // Note: findDueRenewals removed - renewal_required, next_renewal_date not in migration

  // Associations
  SchemeEnrollment.associate = function (models) {
    // SchemeEnrollment belongs to resident
    SchemeEnrollment.belongsTo(models.Resident, {
      foreignKey: "resident_id",
      as: "resident",
    });

    // SchemeEnrollment belongs to scheme
    SchemeEnrollment.belongsTo(models.Scheme, {
      foreignKey: "scheme_id",
      as: "scheme",
    });

    // SchemeEnrollment belongs to user (applied by)
    SchemeEnrollment.belongsTo(models.User, {
      foreignKey: "applied_by",
      as: "applicant_staff",
    });

    // SchemeEnrollment belongs to user (approved by)
    SchemeEnrollment.belongsTo(models.User, {
      foreignKey: "approved_by",
      as: "approver",
    });

    // Note: case_worker_assigned association removed - column not in migration
  };

  return SchemeEnrollment;
};
