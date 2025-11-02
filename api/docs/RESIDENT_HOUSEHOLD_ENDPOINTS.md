# Resident and Household API Endpoints

## Overview
This document describes the implemented Resident and Household API endpoints for the Ward Management System.

## Resident Endpoints

### 1. Get All Residents
**GET** `/api/residents`

Get paginated list of residents with filtering options.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `sort` (default: 'created_at') - Sort field
- `order` (default: 'desc') - Sort order (asc/desc)
- `q` - Search query (searches first_name, last_name, middle_name, resident_id, phone_number)
- `gender` - Filter by gender
- `household_id` - Filter by household ID
- `is_active` - Filter by active status (true/false)
- `ward_number` - Filter by ward (through household)

**Response:**
```json
{
  "success": true,
  "message": "Residents retrieved successfully",
  "data": {
    "residents": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_residents": 50,
      "limit": 10,
      "has_next_page": true,
      "has_prev_page": false
    },
    "filters": {...}
  }
}
```

### 2. Get Resident by ID
**GET** `/api/residents/:id`

Get a single resident with household information.

**Response:**
```json
{
  "success": true,
  "message": "Resident retrieved successfully",
  "data": {
    "resident": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "household": {...}
    }
  }
}
```

### 3. Create Resident
**POST** `/api/residents`

Create a new resident.

**Request Body:**
- `household_id` (required) - UUID of household
- `resident_id` (optional) - Unique resident ID (auto-generated if not provided)
- `first_name` (required)
- `last_name` (required)
- `middle_name` (optional)
- `date_of_birth` (required)
- `gender` (required)
- `marital_status` (optional)
- `relationship_to_head` (optional, default: 'other')
- `phone_number` (optional)
- `email` (optional)
- `occupation` (optional)
- `education_level` (optional)
- `monthly_income` (optional)
- `religion` (optional)
- `caste` (optional)
- `category` (optional)
- `blood_group` (optional)
- `is_disabled` (optional, default: false)
- `disability_type` (optional)
- `profile_picture` (optional)
- `is_head_of_household` (optional, default: false)
- `vaccination_status` (optional, JSON object)
- `health_conditions` (optional, JSON array)
- `government_schemes` (optional, JSON array)
- `is_active` (optional, default: true)
- `anniversary_date` (optional)
- `notes` (optional)
- `additional_info` (optional, JSON object)

**Note:** Automatically updates household member counts after creation.

### 4. Update Resident
**PUT** `/api/residents/:id`

Update an existing resident.

**Request Body:** Same as create, but all fields are optional.

**Note:** Automatically updates household member counts if active status or household changes.

### 5. Delete Resident
**DELETE** `/api/residents/:id`

Soft delete a resident (sets deleted_at timestamp).

**Note:** Automatically updates household member counts after deletion.

### 6. Get Resident Statistics
**GET** `/api/residents/stats`

Get aggregated statistics about residents.

**Response:**
```json
{
  "success": true,
  "message": "Resident statistics retrieved successfully",
  "data": {
    "total_residents": 1000,
    "active_residents": 950,
    "inactive_residents": 50,
    "recent_registrations": 25,
    "head_of_household_count": 200,
    "gender_distribution": {
      "male": 480,
      "female": 470
    },
    "age_groups": {
      "children": 200,
      "adults": 650,
      "senior_citizens": 100
    },
    "generated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Get Resident Demographics
**GET** `/api/residents/demographics`

Get detailed demographic breakdown.

**Response:**
```json
{
  "success": true,
  "message": "Resident demographics retrieved successfully",
  "data": {
    "gender_distribution": {...},
    "marital_status_distribution": {...},
    "category_distribution": {...},
    "education_distribution": {...},
    "generated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 8. Get Upcoming Birthdays
**GET** `/api/residents/birthdays/upcoming?days=30`

Get residents with birthdays in the next N days (default: 30).

**Query Parameters:**
- `days` (optional, default: 30) - Number of days ahead to look

**Response:**
```json
{
  "success": true,
  "message": "Upcoming birthdays retrieved successfully",
  "data": {
    "birthdays": [...],
    "days_range": 30,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-01-31T00:00:00.000Z"
  }
}
```

### 9. Get Upcoming Anniversaries
**GET** `/api/residents/anniversaries/upcoming?days=30`

Get residents with anniversaries in the next N days (default: 30).

**Query Parameters:**
- `days` (optional, default: 30) - Number of days ahead to look

**Response:** Same format as birthdays endpoint.

---

## Household Endpoints

### 1. Get All Households
**GET** `/api/households`

Get paginated list of households with filtering options.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `sort` (default: 'created_at') - Sort field
- `order` (default: 'desc') - Sort order (asc/desc)
- `q` - Search query (searches household_number, address, head_of_family, voter_id, ration_card)
- `ward_secretariat_id` - Filter by ward secretariat ID
- `pincode` - Filter by pincode
- `area` - Filter by area
- `property_type` - Filter by property type
- `ownership_type` - Filter by ownership type
- `is_bpl` - Filter by BPL status (true/false)
- `verification_status` - Filter by verification status

**Response:**
```json
{
  "success": true,
  "message": "Households retrieved successfully",
  "data": {
    "households": [...],
    "pagination": {...},
    "filters": {...}
  }
}
```

### 2. Get Household by ID
**GET** `/api/households/:id`

Get a single household with ward secretariat and residents information.

**Response:**
```json
{
  "success": true,
  "message": "Household retrieved successfully",
  "data": {
    "household": {
      "id": "uuid",
      "household_number": "HH001",
      "ward_secretariat": {...},
      "residents": [...]
    }
  }
}
```

### 3. Create Household
**POST** `/api/households`

Create a new household.

**Request Body:**
- `household_number` (optional) - Unique household number (auto-generated if not provided)
- `address_line1` (required)
- `address_line2` (optional)
- `landmark` (optional)
- `pincode` (required)
- `ward_secretariat_id` (optional)
- `serial_number` (optional)
- `voter_id_primary` (optional)
- `ration_card_number` (optional)
- `head_of_family` (optional)
- `aadhaar_numbers` (optional, JSON array)
- `government_offices_nearby` (optional, JSON array)
- `schemes_eligible` (optional, JSON array)
- `remarks_issues` (optional)
- `area` (optional)
- `city` (optional, default: 'Municipal Ward')
- `state` (required)
- `latitude` (optional)
- `longitude` (optional)
- `property_type` (optional, default: 'residential')
- `ownership_type` (optional, default: 'owned')
- `total_members` (optional, default: 0)
- `adult_members` (optional, default: 0)
- `children_count` (optional, default: 0)
- `senior_citizens_count` (optional, default: 0)
- `electricity_connection` (optional, default: true)
- `water_connection` (optional, default: true)
- `gas_connection` (optional, default: false)
- `internet_connection` (optional, default: false)
- `is_bpl` (optional, default: false)
- `ration_card_type` (optional)
- `primary_contact_number` (optional)
- `secondary_contact_number` (optional)
- `email` (optional)
- `notes` (optional)
- `verification_status` (optional, default: 'pending')
- `additional_info` (optional, JSON object)

### 4. Update Household
**PUT** `/api/households/:id`

Update an existing household.

**Request Body:** Same as create, but all fields are optional.

**Special Field:**
- `recalculate_members` (boolean) - If true, recalculates member counts from residents

### 5. Delete Household
**DELETE** `/api/households/:id`

Soft delete a household (sets deleted_at timestamp).

### 6. Get Household Statistics
**GET** `/api/households/stats`

Get aggregated statistics about households.

**Response:**
```json
{
  "success": true,
  "message": "Household statistics retrieved successfully",
  "data": {
    "total_households": 200,
    "total_members": 800,
    "bpl_households": 50,
    "non_bpl_households": 150,
    "recent_registrations": 10,
    "property_type_distribution": {...},
    "ownership_type_distribution": {...},
    "verification_status_distribution": {...},
    "ward_distribution": {...},
    "generated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Get Households by Ward
**GET** `/api/households/by-ward/:wardId`

Get all households in a specific ward.

**URL Parameters:**
- `wardId` - Ward secretariat ID (UUID)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `sort` (default: 'created_at')
- `order` (default: 'desc')

**Response:** Same format as get all households.

---

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error_code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Notes

1. **Member Count Updates**: When residents are created, updated, or deleted, household member counts are automatically recalculated.

2. **Soft Deletes**: Both residents and households use soft deletes (paranoid mode), meaning records are marked as deleted but not removed from the database.

3. **Auto-generated IDs**: Resident IDs and household numbers are auto-generated if not provided.

4. **Associations**: All endpoints that return single records include relevant associations (household for residents, residents and ward for households).

5. **Pagination**: All list endpoints support pagination with configurable page size.

6. **Filtering**: Extensive filtering options are available on list endpoints for flexible data retrieval.

