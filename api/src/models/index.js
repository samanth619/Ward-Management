const { sequelize, Sequelize } = require('../config/database');

// Import all models
const User = require('./User')(sequelize);
const Household = require('./Household')(sequelize);
const Resident = require('./Resident')(sequelize);
const Conversation = require('./Conversation')(sequelize);
const Event = require('./Event')(sequelize);
const NotificationLog = require('./NotificationLog')(sequelize);
const AuditTrail = require('./AuditTrail')(sequelize);

// Create models object
const models = {
  User,
  Household,
  Resident,
  Conversation,
  Event,
  NotificationLog,
  AuditTrail,
  sequelize,
  Sequelize
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Add hooks for audit trail logging
const auditableModels = ['User', 'Household', 'Resident', 'Conversation', 'Event'];

auditableModels.forEach(modelName => {
  const Model = models[modelName];
  
  // Hook for create operations
  Model.addHook('afterCreate', async (instance, options) => {
    try {
      await models.AuditTrail.createAuditLog({
        entityType: modelName.toLowerCase(),
        entityId: instance.id,
        action: 'create',
        updatedBy: options.userId || null,
        newValues: instance.dataValues,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        sessionId: options.sessionId || null,
        requestId: options.requestId || null,
        category: 'data_modification',
        severity: 'low'
      });
    } catch (error) {
      console.error('Audit trail logging failed for create:', error);
    }
  });

  // Hook for update operations
  Model.addHook('afterUpdate', async (instance, options) => {
    try {
      const changedFields = instance.changed() || [];
      const oldValues = {};
      const newValues = {};
      
      changedFields.forEach(field => {
        oldValues[field] = instance._previousDataValues[field];
        newValues[field] = instance.dataValues[field];
      });

      if (changedFields.length > 0) {
        await models.AuditTrail.createAuditLog({
          entityType: modelName.toLowerCase(),
          entityId: instance.id,
          action: 'update',
          updatedBy: options.userId || null,
          oldValues,
          newValues,
          changedFields,
          ipAddress: options.ipAddress || null,
          userAgent: options.userAgent || null,
          sessionId: options.sessionId || null,
          requestId: options.requestId || null,
          category: 'data_modification',
          severity: 'low'
        });
      }
    } catch (error) {
      console.error('Audit trail logging failed for update:', error);
    }
  });

  // Hook for delete operations
  Model.addHook('afterDestroy', async (instance, options) => {
    try {
      await models.AuditTrail.createAuditLog({
        entityType: modelName.toLowerCase(),
        entityId: instance.id,
        action: 'delete',
        updatedBy: options.userId || null,
        oldValues: instance.dataValues,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        sessionId: options.sessionId || null,
        requestId: options.requestId || null,
        category: 'data_modification',
        severity: 'medium'
      });
    } catch (error) {
      console.error('Audit trail logging failed for delete:', error);
    }
  });
});

// Add authentication audit hooks for User model
models.User.addHook('afterCreate', async (user, options) => {
  if (options.isRegistration) {
    try {
      await models.AuditTrail.createAuditLog({
        entityType: 'user',
        entityId: user.id,
        action: 'create',
        updatedBy: user.id,
        category: 'user_authentication',
        severity: 'medium',
        reason: 'User registration'
      });
    } catch (error) {
      console.error('Audit trail logging failed for user registration:', error);
    }
  }
});

// Helper function to sync database
const syncDatabase = async (options = {}) => {
  try {
    console.log('🔄 Starting database synchronization...');
    
    // Test connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models
    const syncOptions = {
      force: options.force || false,
      alter: options.alter || false,
      ...options
    };
    
    await sequelize.sync(syncOptions);
    console.log('✅ Database models synchronized successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

// Helper function to create initial data
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if admin user exists
    const adminExists = await models.User.findOne({
      where: { email: 'admin@wardmanagement.com' }
    });
    
    if (!adminExists) {
      // Create default admin user
      const adminUser = await models.User.create({
        name: 'System Administrator',
        email: 'admin@wardmanagement.com',
        password: 'admin123', // This will be hashed by the model hook
        role: 'admin',
        is_active: true,
        email_verified: true
      });
      
      console.log('✅ Default admin user created');
      
      // Log admin creation
      await models.AuditTrail.createAuditLog({
        entityType: 'user',
        entityId: adminUser.id,
        action: 'create',
        updatedBy: adminUser.id,
        category: 'system_administration',
        severity: 'high',
        reason: 'Initial system setup - Admin user creation'
      });
    }
    
    console.log('✅ Database seeding completed');
    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Helper function to get model statistics
const getModelStats = async () => {
  try {
    const stats = {};
    
    for (const modelName of Object.keys(models)) {
      if (models[modelName].count && typeof models[modelName].count === 'function') {
        stats[modelName] = await models[modelName].count();
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting model statistics:', error);
    return {};
  }
};

// Helper function to validate model relationships
const validateRelationships = async () => {
  try {
    console.log('🔍 Validating model relationships...');
    
    // Test basic relationships by creating sample queries
    const tests = [
      () => models.User.findOne({ include: ['conversations', 'created_events', 'audit_entries'] }),
      () => models.Household.findOne({ include: ['residents', 'conversations'] }),
      () => models.Resident.findOne({ include: ['household', 'conversations', 'notifications'] }),
      () => models.Conversation.findOne({ include: ['resident', 'household', 'staff'] }),
      () => models.Event.findOne({ include: ['creator', 'notifications'] }),
      () => models.NotificationLog.findOne({ include: ['resident', 'household', 'event', 'user'] }),
      () => models.AuditTrail.findOne({ include: ['user'] })
    ];
    
    for (const test of tests) {
      await test();
    }
    
    console.log('✅ All model relationships validated successfully');
    return true;
  } catch (error) {
    console.error('❌ Model relationship validation failed:', error);
    return false;
  }
};

module.exports = {
  ...models,
  syncDatabase,
  seedDatabase,
  getModelStats,
  validateRelationships
};