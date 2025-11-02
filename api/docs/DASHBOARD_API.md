# Dashboard API Endpoint

## Overview
The dashboard endpoint aggregates all key data needed for the ward management dashboard in a single API call, reducing frontend requests and improving performance.

## Endpoint

### Get Dashboard Data
**GET** `/api/dashboard`

Returns comprehensive dashboard data including overview metrics, demographics, recent activities, upcoming events, alerts, and statistics.

**Authentication:** Required (JWT token)

**Query Parameters:**
- `days` (optional, default: 30) - Number of days for upcoming events (birthdays, anniversaries, events)
- `recent_limit` (optional, default: 5) - Number of recent activities to return per category

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "total_residents": 1000,
      "total_households": 200,
      "total_users": 10,
      "active_events": 5,
      "pending_conversations": 15,
      "scheme_enrollments": 150
    },
    "demographics": {
      "gender_distribution": {
        "male": 480,
        "female": 470,
        "other": 50
      },
      "age_groups": {
        "children": 200,
        "adults": 650,
        "senior_citizens": 150
      },
      "ward_distribution": {
        "ward-uuid-1": 50,
        "ward-uuid-2": 75
      }
    },
    "recent_activities": {
      "new_residents": [
        {
          "id": "uuid",
          "first_name": "John",
          "last_name": "Doe",
          "resident_id": "RES001",
          "created_at": "2024-01-01T00:00:00.000Z",
          "household": {
            "id": "uuid",
            "household_number": "HH001",
            "address_line1": "123 Main St"
          }
        }
      ],
      "recent_conversations": [
        {
          "id": "uuid",
          "conversation_id": "CONV001",
          "subject": "Water Supply Issue",
          "status": "in_progress",
          "priority": "high",
          "conversation_type": "phone_call",
          "created_at": "2024-01-01T00:00:00.000Z"
        }
      ],
      "recent_events": [
        {
          "id": "uuid",
          "event_id": "EVT001",
          "title": "Health Camp",
          "event_type": "health_camp",
          "start_date": "2024-01-15T00:00:00.000Z",
          "status": "published",
          "created_at": "2024-01-01T00:00:00.000Z"
        }
      ],
      "recent_scheme_applications": [
        {
          "id": "uuid",
          "enrollment_id": "ENR001",
          "status": "under_review",
          "application_date": "2024-01-01T00:00:00.000Z",
          "created_at": "2024-01-01T00:00:00.000Z",
          "scheme": {
            "id": "uuid",
            "scheme_name": "Old Age Pension",
            "scheme_code": "OAP001"
          },
          "resident": {
            "id": "uuid",
            "first_name": "Jane",
            "last_name": "Smith",
            "resident_id": "RES002"
          }
        }
      ]
    },
    "upcoming": {
      "birthdays": [
        {
          "id": "uuid",
          "first_name": "John",
          "last_name": "Doe",
          "date_of_birth": "1990-01-15",
          "household_id": "uuid"
        }
      ],
      "anniversaries": [
        {
          "id": "uuid",
          "first_name": "Jane",
          "last_name": "Smith",
          "anniversary_date": "2010-01-20",
          "household_id": "uuid"
        }
      ],
      "events": [
        {
          "id": "uuid",
          "event_id": "EVT002",
          "title": "Vaccination Drive",
          "event_type": "vaccination_drive",
          "start_date": "2024-01-20T00:00:00.000Z",
          "location": "Community Hall"
        }
      ],
      "follow_ups": [
        {
          "id": "uuid",
          "conversation_id": "CONV002",
          "subject": "Road Repair",
          "next_follow_up_date": "2024-01-25T00:00:00.000Z",
          "status": "in_progress",
          "resident": {
            "id": "uuid",
            "first_name": "Bob",
            "last_name": "Johnson"
          }
        }
      ]
    },
    "alerts": {
      "overdue_follow_ups": 3,
      "pending_verifications": 10,
      "upcoming_renewals": 5,
      "unresolved_complaints": 8
    },
    "scheme_stats": {
      "total_schemes": 25,
      "active_enrollments": 120,
      "pending_applications": 15,
      "by_status": {
        "draft": 5,
        "submitted": 10,
        "under_review": 8,
        "verified": 20,
        "approved": 50,
        "beneficiary": 70,
        "rejected": 10,
        "closed": 5
      }
    },
    "conversation_stats": {
      "by_status": {
        "open": 5,
        "in_progress": 10,
        "resolved": 50,
        "closed": 30,
        "pending": 3
      },
      "by_category": {
        "sanitation": 10,
        "water_supply": 8,
        "electricity": 5,
        "roads": 7,
        "health": 12,
        "schemes": 15,
        "other": 20
      },
      "by_priority": {
        "low": 20,
        "medium": 40,
        "high": 25,
        "urgent": 10
      }
    },
    "generated_at": "2024-01-01T12:00:00.000Z",
    "query_params": {
      "days_for_upcoming": 30,
      "recent_activities_limit": 5
    }
  }
}
```

## Data Sections

### 1. Overview
Key metrics displayed as cards on the dashboard:
- Total residents count
- Total households count
- Total active users
- Active events count
- Pending conversations count
- Total scheme enrollments

### 2. Demographics
Statistics for charts and visualizations:
- **Gender Distribution**: Count by gender (male, female, other)
- **Age Groups**: Count by age category (children < 18, adults 18-59, senior citizens >= 60)
- **Ward Distribution**: Household count per ward

### 3. Recent Activities
Most recent items across different categories (last 30 days):
- **New Residents**: Recently registered residents
- **Recent Conversations**: Latest conversations/complaints
- **Recent Events**: Recently created events
- **Recent Scheme Applications**: Latest scheme enrollments

### 4. Upcoming
Items that need attention in the near future:
- **Birthdays**: Residents with birthdays in the next N days (default: 30)
- **Anniversaries**: Residents with anniversaries in the next N days
- **Events**: Upcoming events scheduled in the next N days
- **Follow-ups**: Conversations requiring follow-up action

### 5. Alerts
Counts of items requiring immediate attention:
- **Overdue Follow-ups**: Follow-ups that are past their due date
- **Pending Verifications**: Households awaiting verification
- **Upcoming Renewals**: Scheme enrollments due for renewal (next 30 days)
- **Unresolved Complaints**: Open complaints that haven't been resolved

### 6. Scheme Statistics
Comprehensive scheme enrollment statistics:
- Total active schemes
- Active enrollments count
- Pending applications count
- Breakdown by enrollment status

### 7. Conversation Statistics
Comprehensive conversation/complaint statistics:
- Breakdown by status (open, in_progress, resolved, closed, pending)
- Breakdown by category (sanitation, water_supply, electricity, etc.)
- Breakdown by priority (low, medium, high, urgent)

## Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "error_code": "NO_TOKEN"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to retrieve dashboard data",
  "error_code": "GET_DASHBOARD_FAILED"
}
```

## Performance Notes

1. **Single Request**: All dashboard data is returned in one API call, reducing frontend requests
2. **Configurable Limits**: Recent activities and upcoming events can be limited via query parameters
3. **Optimized Queries**: Uses efficient database queries with proper indexing
4. **Caching Opportunity**: Response can be cached on the frontend for better performance

## Usage Example

```javascript
// Fetch dashboard data
const response = await fetch('/api/dashboard?days=7&recent_limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

// Access overview metrics
const totalResidents = data.data.overview.total_residents;

// Access demographics for charts
const genderDistribution = data.data.demographics.gender_distribution;

// Access alerts
const overdueFollowUps = data.data.alerts.overdue_follow_ups;

// Access recent activities
const newResidents = data.data.recent_activities.new_residents;
```

## Dependencies

This endpoint relies on the following models and their associations:
- User
- Resident (with Household association)
- Household (with WardSecretariat association)
- Event
- Conversation (with Resident association)
- Scheme
- SchemeEnrollment (with Scheme and Resident associations)
- NotificationLog

All models must be properly initialized and associations configured for this endpoint to work correctly.

