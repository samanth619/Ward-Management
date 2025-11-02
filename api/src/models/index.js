const { getSequelizeInstance, Sequelize } = require('../config/database');

// Function to initialize models - called after database connection is established
const initializeModels = (sequelize) => {
  // Import all models with sequelize instance
  const User = require('./User')(sequelize);
  const Household = require('./Household')(sequelize);
  const WardSecretariat = require('./WardSecretariat')(sequelize);
  const Resident = require('./Resident')(sequelize);
  const ResidentBankDetails = require('./ResidentBankDetails')(sequelize);
  const ResidentEmergencyContact = require('./ResidentEmergencyContact')(sequelize);
  const ResidentEmployment = require('./ResidentEmployment')(sequelize);
  const ResidentKYC = require('./ResidentKYC')(sequelize);
  const Scheme = require('./Scheme')(sequelize);
  const SchemeEnrollment = require('./SchemeEnrollment')(sequelize);
  const Conversation = require('./Conversation')(sequelize);
  const Event = require('./Event')(sequelize);
  const NotificationLog = require('./NotificationLog')(sequelize);
  const AuditTrail = require('./AuditTrail')(sequelize);

  return {
    User,
    Household,
    WardSecretariat,
    Resident,
    ResidentBankDetails,
    ResidentEmergencyContact,
    ResidentEmployment,
    ResidentKYC,
    Scheme,
    SchemeEnrollment,
    Conversation,
    Event,
    NotificationLog,
    AuditTrail
  };
};

// Setup associations after all models are created
const setupAssociations = (models) => {
  // Set up associations
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });
  
  return models;
};

// Main function to get models - ensures database is initialized first
const getModels = async () => {
  try {
    const sequelize = await getSequelizeInstance();
    const models = initializeModels(sequelize);
    const modelsWithAssociations = setupAssociations(models);
    
    return {
      ...modelsWithAssociations,
      sequelize,
      Sequelize
    };
  } catch (error) {
    console.error('Error initializing models:', error);
    throw error;
  }
};

// For backward compatibility and direct access (when database is already initialized)
const getModelsSync = () => {
  try {
    // This will only work if database is already initialized
    const { sequelize } = require('../config/database');
    const models = initializeModels(sequelize);
    const modelsWithAssociations = setupAssociations(models);
    
    return {
      ...modelsWithAssociations,
      sequelize,
      Sequelize
    };
  } catch (error) {
    console.error('Error getting models synchronously. Database may not be initialized.');
    throw new Error('Database not initialized. Use getModels() instead or call getSequelizeInstance() first.');
  }
};

module.exports = {
  getModels,
  getModelsSync,
  initializeModels,
  setupAssociations
};