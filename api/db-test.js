const { checkPostgreSQLServer, initializeDatabase } = require('./src/config/dbInit');

async function quickTest() {
  console.log('🚀 Ward Management System - Database Quick Test');
  console.log('==============================================');
  
  try {
    // Test 1: Check if PostgreSQL server is running
    console.log('\n1️⃣  Checking PostgreSQL server...');
    const serverRunning = await checkPostgreSQLServer();
    
    if (!serverRunning) {
      console.log('\n❌ PostgreSQL server is not running or not accessible.');
      console.log('\n🔧 To start PostgreSQL:');
      console.log('   macOS (Homebrew): brew services start postgresql');
      console.log('   macOS (PostgreSQL.app): Start PostgreSQL.app');
      console.log('   Ubuntu/Debian: sudo service postgresql start');
      console.log('   Windows: Start PostgreSQL service from Services');
      console.log('\n💡 Or install PostgreSQL if not installed:');
      console.log('   macOS: brew install postgresql');
      console.log('   Ubuntu: sudo apt install postgresql postgresql-contrib');
      console.log('   Windows: Download from https://www.postgresql.org/download/');
      return false;
    }
    
    // Test 2: Initialize database (will create if doesn't exist)
    console.log('\n2️⃣  Initializing database...');
    const sequelize = await initializeDatabase();
    
    console.log('\n3️⃣  Testing database operations...');
    // Test a simple query
    const [results] = await sequelize.query('SELECT version()');
    console.log(`✅ PostgreSQL Version: ${results[0].version.split(' ')[0]} ${results[0].version.split(' ')[1]}`);
    
    // Close connection
    await sequelize.close();
    console.log('\n✅ Database connection closed');
    
    console.log('\n🎉 All tests passed! Database is ready for Ward Management System');
    return true;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection refused - PostgreSQL server may not be running');
    } else if (error.code === '28P01') {
      console.log('\n🔐 Authentication failed - Check your database credentials');
    } else if (error.code === '3D000') {
      console.log('\n📁 Database does not exist - This should be created automatically');
    }
    
    return false;
  }
}

// Run test if executed directly
if (require.main === module) {
  quickTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = quickTest;