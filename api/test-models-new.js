#!/usr/bin/env node

/**
 * Test script to verify all models and database setup
 */

const { getSequelizeInstance } = require('./src/config/database');
const { getModels } = require('./src/models');
require('dotenv').config();

async function testModels() {
  let sequelize;
  try {
    console.log('🧪 Ward Management System - Model Testing\n');

    // Initialize database connection
    console.log('📊 Initializing database connection...');
    sequelize = await getSequelizeInstance();
    console.log('✅ Database connection established successfully.\n');

    // Get models
    console.log('🔗 Loading models...');
    const models = await getModels();
    console.log('✅ Models loaded successfully.\n');

    // Test 1: Verify all models are loaded
    console.log('=== Test 1: Model Loading ===');
    const expectedModels = [
      'User', 'Household', 'WardSecretariat', 'Resident', 
      'ResidentBankDetails', 'ResidentEmergencyContact', 'ResidentEmployment', 'ResidentKYC',
      'Scheme', 'SchemeEnrollment', 'Conversation', 'Event', 'NotificationLog', 'AuditTrail'
    ];
    
    for (const modelName of expectedModels) {
      if (models[modelName]) {
        console.log(`✅ ${modelName} model loaded successfully`);
      } else {
        console.log(`❌ ${modelName} model failed to load`);
      }
    }
    console.log();

    // Test 2: Database Connection
    console.log('=== Test 2: Database Connection ===');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Test 3: Basic CRUD Operations
    console.log('=== Test 3: Basic CRUD Operations ===');
    
    // Test User creation
    console.log('Testing User model...');
    const testUser = await models.User.create({
      name: 'Test Staff Member',
      email: 'test@wardmanagement.com',
      password: 'Test123456!',
      role: 'staff',
      is_active: true,
      email_verified: true
    });
    console.log(`✅ User created: ${testUser.name} (${testUser.email})`);
    
    // Test WardSecretariat
    console.log('Testing WardSecretariat model...');
    const testWard = await models.WardSecretariat.create({
      ward_number: '001',
      ward_name: 'Test Ward',
      secretariat_name: 'Test Ward Secretariat',
      secretariat_code: 'WS001'
    });
    console.log(`✅ Ward Secretariat created: ${testWard.secretariat_name}`);
    
    // Test Household
    console.log('Testing Household model...');
    const testHousehold = await models.Household.create({
      household_number: 'HH001',
      address_line1: 'Test Address Line 1',
      pincode: '500001',
      ward_number: '001',
      ward_secretariat_id: testWard.id,
      city: 'Test City',
      state: 'Telangana',
      total_members: 2
    });
    console.log(`✅ Household created: ${testHousehold.household_number}`);
    
    // Test Resident
    console.log('Testing Resident model...');
    const testResident = await models.Resident.create({
      household_id: testHousehold.id,
      first_name: 'Test',
      last_name: 'Resident',
      date_of_birth: '1990-01-01',
      gender: 'male',
      phone_number: '9876543210',
      is_head_of_household: true
    });
    console.log(`✅ Resident created: ${testResident.first_name} ${testResident.last_name}`);
    
    // Test ResidentBankDetails
    console.log('Testing ResidentBankDetails model...');
    const testBankDetails = await models.ResidentBankDetails.create({
      resident_id: testResident.id,
      bank_name: 'Test Bank',
      account_number: '1234567890',
      ifsc_code: 'TEST0001234',
      account_holder_name: 'Test Resident',
      is_primary: true
    });
    console.log(`✅ Bank details created for account: ${testBankDetails.account_number}`);
    
    // Test Scheme
    console.log('Testing Scheme model...');
    const testScheme = await models.Scheme.create({
      name: 'Test Government Scheme',
      scheme_code: 'SCH001',
      department: 'Department of Social Welfare',
      description: 'Test scheme for verification',
      eligibility_criteria: {
        age_min: 18,
        income_max: 50000
      },
      created_by: testUser.id
    });
    console.log(`✅ Scheme created: ${testScheme.name}`);
    
    // Test SchemeEnrollment
    console.log('Testing SchemeEnrollment model...');
    const testEnrollment = await models.SchemeEnrollment.create({
      scheme_id: testScheme.id,
      resident_id: testResident.id,
      household_id: testHousehold.id,
      application_number: 'APP001',
      applied_by: testUser.id
    });
    console.log(`✅ Scheme enrollment created: ${testEnrollment.application_number}`);
    
    // Test Conversation
    console.log('Testing Conversation model...');
    const testConversation = await models.Conversation.create({
      subject: 'Test Conversation',
      message: 'This is a test conversation for system verification',
      resident_id: testResident.id,
      household_id: testHousehold.id,
      staff_id: testUser.id
    });
    console.log(`✅ Conversation created: ${testConversation.subject}`);
    
    // Test Event
    console.log('Testing Event model...');
    const testEvent = await models.Event.create({
      title: 'Test Community Event',
      description: 'This is a test event for system verification',
      event_type: 'meeting',
      start_date: new Date(),
      created_by: testUser.id
    });
    console.log(`✅ Event created: ${testEvent.title}`);
    
    // Test NotificationLog
    console.log('Testing NotificationLog model...');
    const testNotification = await models.NotificationLog.create({
      recipient_id: testResident.id,
      household_id: testHousehold.id,
      event_id: testEvent.id,
      type: 'sms',
      title: 'Test Notification',
      message: 'This is a test notification',
      recipient_contact: '9876543210'
    });
    console.log(`✅ Notification created: ${testNotification.title}`);

    // Test 4: Count Records
    console.log('\n=== Test 4: Record Counts ===');
    const counts = {};
    for (const modelName of expectedModels) {
      counts[modelName] = await models[modelName].count();
      console.log(`${modelName}: ${counts[modelName]} records`);
    }
    console.log();

    // Test 5: Clean up test data
    console.log('=== Test 5: Cleanup ===');
    await testNotification.destroy();
    await testEvent.destroy();
    await testConversation.destroy();
    await testEnrollment.destroy();
    await testScheme.destroy();
    await testBankDetails.destroy();
    await testResident.destroy();
    await testHousehold.destroy();
    await testWard.destroy();
    await testUser.destroy();
    console.log('✅ Test data cleaned up\n');
    
    console.log('🎉 All model tests passed successfully!');
    console.log('✅ Ward Management System models are ready for use');
    
  } catch (error) {
    console.error('\n❌ Model test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    if (sequelize) {
      await sequelize.close();
      console.log('\n🔒 Database connection closed');
    }
  }
}

// Run the test
if (require.main === module) {
  testModels().catch(console.error);
}

module.exports = testModels;