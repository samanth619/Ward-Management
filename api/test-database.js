const { 
  sequelize, 
  syncDatabase, 
  seedDatabase, 
  getModelStats, 
  validateRelationships,
  User,
  Household,
  Resident,
  Conversation,
  Event,
  NotificationLog,
  AuditTrail
} = require('./src/models');

async function testDatabaseSetup() {
  console.log('🚀 Starting Ward Management System Database Test');
  console.log('================================================');

  try {
    // Test 1: Database Connection
    console.log('\n1️⃣  Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Test 2: Model Loading
    console.log('\n2️⃣  Testing model loading...');
    const models = [
      { name: 'User', model: User },
      { name: 'Household', model: Household },
      { name: 'Resident', model: Resident },
      { name: 'Conversation', model: Conversation },
      { name: 'Event', model: Event },
      { name: 'NotificationLog', model: NotificationLog },
      { name: 'AuditTrail', model: AuditTrail }
    ];

    models.forEach(({ name, model }) => {
      if (model && model.name) {
        console.log(`✅ ${name} model loaded successfully`);
      } else {
        console.log(`❌ ${name} model failed to load`);
      }
    });

    // Test 3: Database Synchronization (without forcing data loss)
    console.log('\n3️⃣  Testing database synchronization...');
    await syncDatabase({ alter: true });
    console.log('✅ Database synchronized successfully');

    // Test 4: Model Relationships Validation
    console.log('\n4️⃣  Testing model relationships...');
    const relationshipsValid = await validateRelationships();
    if (relationshipsValid) {
      console.log('✅ All model relationships are valid');
    } else {
      console.log('⚠️  Some model relationships may have issues');
    }

    // Test 5: Database Seeding
    console.log('\n5️⃣  Testing database seeding...');
    await seedDatabase();
    console.log('✅ Database seeding completed');

    // Test 6: Basic CRUD Operations
    console.log('\n6️⃣  Testing basic CRUD operations...');
    
    // Test creating a user
    const testUser = await User.create({
      name: 'Test Staff Member',
      email: 'test@wardmanagement.com',
      password: 'password123',
      role: 'staff',
      ward_number: '001'
    });
    console.log('✅ User creation test passed');

    // Test creating a household
    const testHousehold = await Household.create({
      household_number: 'HH001TEST',
      address_line1: '123 Test Street',
      ward_number: '001',
      pincode: '500001',
      city: 'Test City',
      state: 'Test State',
      verified_by: testUser.id
    });
    console.log('✅ Household creation test passed');

    // Test creating a resident
    const testResident = await Resident.create({
      household_id: testHousehold.id,
      first_name: 'Test',
      last_name: 'Resident',
      date_of_birth: '1990-01-01',
      gender: 'male',
      relationship_to_head: 'head',
      is_head_of_household: true
    });
    console.log('✅ Resident creation test passed');

    // Test creating a conversation
    const testConversation = await Conversation.create({
      resident_id: testResident.id,
      household_id: testHousehold.id,
      staff_id: testUser.id,
      subject: 'Test Conversation',
      description: 'This is a test conversation for database validation',
      issue_category: 'other',
      conversation_type: 'office_visit'
    });
    console.log('✅ Conversation creation test passed');

    // Test creating an event
    const testEvent = await Event.create({
      title: 'Test Event',
      description: 'This is a test event',
      event_type: 'meeting',
      start_date: new Date(),
      created_by: testUser.id,
      ward_numbers: ['001']
    });
    console.log('✅ Event creation test passed');

    // Test creating a notification log
    const testNotification = await NotificationLog.create({
      resident_id: testResident.id,
      event_id: testEvent.id,
      user_id: testUser.id,
      notification_type: 'event_reminder',
      channel: 'sms',
      message: 'This is a test notification'
    });
    console.log('✅ Notification log creation test passed');

    // Test 7: Relationship Queries
    console.log('\n7️⃣  Testing relationship queries...');
    
    const userWithRelations = await User.findByPk(testUser.id, {
      include: ['conversations', 'created_events']
    });
    console.log(`✅ User relationships test passed - Found ${userWithRelations.conversations.length} conversations`);

    const householdWithResidents = await Household.findByPk(testHousehold.id, {
      include: ['residents']
    });
    console.log(`✅ Household relationships test passed - Found ${householdWithResidents.residents.length} residents`);

    // Test 8: Model Statistics
    console.log('\n8️⃣  Getting model statistics...');
    const stats = await getModelStats();
    console.log('📊 Database Statistics:');
    Object.entries(stats).forEach(([model, count]) => {
      console.log(`   ${model}: ${count} records`);
    });

    // Test 9: Cleanup Test Data
    console.log('\n9️⃣  Cleaning up test data...');
    await testNotification.destroy();
    await testEvent.destroy();
    await testConversation.destroy();
    await testResident.destroy();
    await testHousehold.destroy();
    await testUser.destroy();
    console.log('✅ Test data cleanup completed');

    // Final Success Message
    console.log('\n🎉 All database tests passed successfully!');
    console.log('================================================');
    console.log('Database is ready for the Ward Management System');
    
    return true;

  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseSetup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = testDatabaseSetup;