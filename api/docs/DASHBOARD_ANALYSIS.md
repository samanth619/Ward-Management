# Dashboard API Requirements Analysis

## Overview

This document analyzes what data a typical Ward Management System dashboard would need and compares it against the current API implementation.

## Expected Dashboard Components

Based on typical municipal ward management dashboards, the following components are expected:

### 1. Statistics Cards (Overview Metrics) for a village

- Total Residents
- Total Households
- Total Users/Staff
- Active Events
- Pending Conversations/Complaints
- Scheme Enrollments
- Notifications Sent

### 2. Charts & Visualizations

- Resident Demographics (Age groups, Gender distribution)
- Household Distribution by Ward
- Scheme Enrollment Status
- Conversation/Complaint Status Breakdown
- Event Types Distribution
- Recent Activity Timeline

### 3. Recent Activities Feed

- Recent Resident Registrations
- Recent Conversations/Complaints
- Recent Events
- Recent Scheme Applications

### 4. Upcoming Events

- Upcoming birthdays (next 7-30 days)
- Upcoming anniversaries
- Scheduled events
- Follow-up reminders

### 5. Quick Actions & Alerts

- Overdue follow-ups
- Pending verifications
- Upcoming renewals
- Unresolved complaints

### 6. Geographic Data (if applicable)

- Household locations (if coordinates available)
- Ward coverage map

---

## Current API Status

### ✅ IMPLEMENTED Endpoints

1. **User Statistics**

   - Endpoint: `GET /api/users/stats`
   - Returns: Total users, active users, role distribution, ward distribution, recent registrations
   - Status: ✅ Implemented

2. **Health Check**

   - Endpoint: `GET /api/health`
   - Status: ✅ Implemented

3. **Auth Endpoints**
   - Login, Logout, Profile, etc.
   - Status: ✅ Implemented

### ❌ NOT IMPLEMENTED / Missing Endpoints

1. **Residents Endpoints**

   - `GET /api/residents` - Returns 501 (Not Implemented)
   - `GET /api/residents/:id` - Returns 501
   - `GET /api/residents/stats` - **MISSING** (needed for dashboard)
   - `GET /api/residents/demographics` - **MISSING** (needed for charts)

2. **Households Endpoints**

   - `GET /api/households` - Returns 501 (Not Implemented)
   - `GET /api/households/stats` - **MISSING** (needed for dashboard)
   - `GET /api/households/by-ward` - **MISSING**

3. **Events Endpoints**

   - `GET /api/events` - Returns 501 (Not Implemented)
   - `GET /api/events/upcoming` - **MISSING** (needed for dashboard)
   - `GET /api/events/stats` - **MISSING**

4. **Conversations/Complaints Endpoints**

   - `GET /api/conversations` - Returns 501 (Not Implemented)
   - `GET /api/conversations/pending` - **MISSING** (needed for alerts)
   - `GET /api/conversations/stats` - **MISSING**

5. **Schemes Endpoints**

   - `GET /api/schemes` - **MISSING** (route not found)
   - `GET /api/schemes/enrollments/stats` - **MISSING**
   - `GET /api/schemes/pending-applications` - **MISSING**

6. **Notifications Endpoints**

   - `GET /api/notifications` - Returns 501 (Not Implemented)
   - `GET /api/notifications/stats` - **MISSING**

7. **Dashboard Aggregated Endpoint**

   - `GET /api/dashboard` - **MISSING** (Main endpoint for dashboard data)
   - Should return all key metrics, charts data, recent activities, and alerts in one call

8. **Resident Lifecycle Events**
   - `GET /api/residents/birthdays/upcoming` - **MISSING** (model has method but no endpoint)
   - `GET /api/residents/anniversaries/upcoming` - **MISSING** (model has method but no endpoint)

---

## Required Dashboard API Endpoints

### Priority 1: Core Dashboard Endpoint

```
GET /api/dashboard
```

Should return:

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_residents": 0,
      "total_households": 0,
      "total_users": 0,
      "active_events": 0,
      "pending_conversations": 0,
      "scheme_enrollments": 0
    },
    "demographics": {
      "gender_distribution": { "male": 0, "female": 0, "other": 0 },
      "age_groups": { "children": 0, "adults": 0, "senior_citizens": 0 },
      "ward_distribution": {}
    },
    "recent_activities": {
      "new_residents": [],
      "recent_conversations": [],
      "recent_events": [],
      "recent_scheme_applications": []
    },
    "upcoming": {
      "birthdays": [],
      "anniversaries": [],
      "events": [],
      "follow_ups": []
    },
    "alerts": {
      "overdue_follow_ups": 0,
      "pending_verifications": 0,
      "upcoming_renewals": 0,
      "unresolved_complaints": 0
    },
    "scheme_stats": {
      "total_schemes": 0,
      "active_enrollments": 0,
      "pending_applications": 0,
      "by_status": {}
    },
    "conversation_stats": {
      "by_status": {},
      "by_category": {},
      "by_priority": {}
    }
  }
}
```

### Priority 2: Individual Statistics Endpoints

1. **Residents Statistics**

   ```
   GET /api/residents/stats
   GET /api/residents/demographics
   GET /api/residents/birthdays/upcoming?days=30
   GET /api/residents/anniversaries/upcoming?days=30
   ```

2. **Households Statistics**

   ```
   GET /api/households/stats
   GET /api/households/by-ward
   ```

3. **Events Statistics**

   ```
   GET /api/events/upcoming?days=30
   GET /api/events/stats
   GET /api/events/by-type
   ```

4. **Conversations/Complaints Statistics**

   ```
   GET /api/conversations/stats
   GET /api/conversations/pending
   GET /api/conversations/overdue
   GET /api/conversations/by-status
   ```

5. **Schemes Statistics**

   ```
   GET /api/schemes (list all schemes)
   GET /api/schemes/enrollments/stats
   GET /api/schemes/pending-applications
   GET /api/schemes/expiring?days=30
   ```

6. **Notifications Statistics**
   ```
   GET /api/notifications/stats
   GET /api/notifications/recent
   ```

---

## Data Model Analysis

### ✅ Models Available (All Data Exists)

All required models are properly defined:

- ✅ `Resident` - Comprehensive model with demographics, age calculation, birthday/anniversary methods
- ✅ `Household` - Full household information with member counts
- ✅ `Event` - Events with upcoming/past methods
- ✅ `Conversation` - Conversations/complaints with status tracking
- ✅ `Scheme` & `SchemeEnrollment` - Scheme management
- ✅ `NotificationLog` - Notification tracking
- ✅ `User` - User management

### ✅ Model Methods Available

Many helpful methods already exist in models:

- `Resident.findBirthdays(startDate, endDate)` ✅
- `Resident.findAnniversaries(startDate, endDate)` ✅
- `Resident.findSeniorCitizens()` ✅
- `Event.findUpcoming(days)` ✅
- `Event.findByStatus(status)` ✅
- `Conversation.findOverdueFollowUps()` ✅
- `Conversation.findByStatus(status)` ✅
- `SchemeEnrollment.findPendingApplications()` ✅
- `SchemeEnrollment.findOverdueFollowUps()` ✅
- `SchemeEnrollment.findDueRenewals(days)` ✅

---

## Recommendations

### Immediate Actions Required

1. **Implement Core Dashboard Endpoint** (`GET /api/dashboard`)

   - Most important missing piece
   - Aggregates all dashboard data in one call
   - Reduces frontend API calls

2. **Implement Resident Routes**

   - Basic CRUD operations
   - Statistics endpoint
   - Demographics endpoint
   - Upcoming birthdays/anniversaries endpoints

3. **Implement Household Routes**

   - Basic CRUD operations
   - Statistics endpoint

4. **Implement Event Routes**

   - List events with filtering
   - Upcoming events endpoint
   - Statistics endpoint

5. **Implement Conversation Routes**

   - List conversations with filtering
   - Pending/overdue endpoints
   - Statistics endpoint

6. **Create Scheme Routes**

   - Currently no route file exists
   - Need to create routes and controllers

7. **Implement Notification Routes**
   - Basic listing
   - Statistics endpoint

### Implementation Priority

1. **High Priority** (Required for basic dashboard)

   - Dashboard aggregated endpoint
   - Resident stats & demographics
   - Household stats
   - Upcoming events
   - Pending conversations

2. **Medium Priority** (Enhances dashboard)

   - Scheme statistics
   - Notification statistics
   - Detailed charts data endpoints

3. **Low Priority** (Nice to have)
   - Geographic data endpoints
   - Advanced filtering endpoints
   - Export endpoints

---

## Conclusion

**Current Status: ~15% Complete**

- ✅ Models are comprehensive and well-designed
- ✅ User management and auth are complete
- ❌ Most data endpoints return 501 (Not Implemented)
- ❌ No dashboard aggregator endpoint
- ❌ Many helpful model methods exist but no API endpoints expose them

**Gap Analysis:**

- Data models: ✅ Complete
- Model methods: ✅ Available
- API endpoints: ❌ Mostly missing
- Dashboard data: ❌ Not accessible via API

**Next Steps:**

1. Implement `/api/dashboard` endpoint (highest priority)
2. Implement CRUD operations for all main entities
3. Add statistics endpoints for each entity
4. Leverage existing model methods in controllers
