/**
 * Authentication System Test Script
 * This script tests the basic functionality of the authentication system
 */

const request = require('supertest');
const app = require('../server');

// Test configuration
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123!',
  confirm_password: 'TestPass123!',
  role: 'staff',
  ward_number: 'WARD001'
};

const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'AdminPass123!',
  confirm_password: 'AdminPass123!',
  role: 'admin'
};

let userTokens = {};
let adminTokens = {};
let userId = '';

describe('Authentication System Tests', () => {
  
  describe('User Registration', () => {
    test('Should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.tokens).toBeDefined();
      expect(res.body.data.tokens.access_token).toBeDefined();
      expect(res.body.data.tokens.refresh_token).toBeDefined();

      // Store tokens for later tests
      userTokens = res.body.data.tokens;
      userId = res.body.data.user.id;
    });

    test('Should not register user with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('USER_EXISTS');
    });

    test('Should not register user with invalid password', async () => {
      const invalidUser = {
        ...testUser,
        email: 'invalid@example.com',
        password: 'weak',
        confirm_password: 'weak'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });
  });

  describe('User Login', () => {
    test('Should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.tokens).toBeDefined();

      // Update tokens
      userTokens = res.body.data.tokens;
    });

    test('Should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('INVALID_CREDENTIALS');
    });

    test('Should not login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Protected Routes', () => {
    test('Should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userTokens.access_token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    test('Should not access protected route without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('NO_TOKEN');
    });

    test('Should not access protected route with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('MALFORMED_TOKEN');
    });
  });

  describe('Token Refresh', () => {
    test('Should refresh access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refresh_token: userTokens.refresh_token
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toBeDefined();
      expect(res.body.data.tokens.access_token).toBeDefined();

      // Update tokens
      userTokens = res.body.data.tokens;
    });

    test('Should not refresh with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refresh_token: 'invalid_refresh_token'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('Profile Management', () => {
    test('Should update user profile', async () => {
      const updateData = {
        name: 'Updated Test User',
        phone: '+1234567890'
      };

      const res = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${userTokens.access_token}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe(updateData.name);
      expect(res.body.data.user.phone).toBe(updateData.phone);
    });

    test('Should change password', async () => {
      const passwordData = {
        current_password: testUser.password,
        password: 'NewTestPass123!',
        confirm_password: 'NewTestPass123!'
      };

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${userTokens.access_token}`)
        .send(passwordData)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Update test user password for future tests
      testUser.password = passwordData.password;
    });

    test('Should not change password with wrong current password', async () => {
      const passwordData = {
        current_password: 'wrongpassword',
        password: 'AnotherNewPass123!',
        confirm_password: 'AnotherNewPass123!'
      };

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${userTokens.access_token}`)
        .send(passwordData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('INVALID_CURRENT_PASSWORD');
    });
  });

  describe('Admin User Management', () => {
    beforeAll(async () => {
      // Register admin user
      const res = await request(app)
        .post('/api/auth/register')
        .send(adminUser);

      adminTokens = res.body.data.tokens;
    });

    test('Should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminTokens.access_token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeDefined();
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    test('Should not access admin endpoints as regular user', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userTokens.access_token}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('INSUFFICIENT_PERMISSION');
    });

    test('Should create user as admin', async () => {
      const newUser = {
        name: 'Created User',
        email: 'created@example.com',
        password: 'CreatedPass123!',
        role: 'read_only',
        ward_number: 'WARD002'
      };

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminTokens.access_token}`)
        .send(newUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(newUser.email);
      expect(res.body.data.user.role).toBe(newUser.role);
    });

    test('Should get user statistics as admin', async () => {
      const res = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminTokens.access_token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.total_users).toBeGreaterThan(0);
      expect(res.body.data.role_distribution).toBeDefined();
    });
  });

  describe('Password Reset', () => {
    test('Should request password reset', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('Should handle password reset request for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        })
        .expect(200);

      // Should still return success for security reasons
      expect(res.body.success).toBe(true);
    });
  });

  describe('Logout', () => {
    test('Should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userTokens.access_token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});

module.exports = {
  testUser,
  adminUser
};