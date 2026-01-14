# Eastlify Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254712345678",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254712345678",
  "role": "shop_owner",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Profile
**GET** `/api/auth/profile` 🔒

### Update Profile
**PUT** `/api/auth/profile` 🔒

**Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "phone": "+254712345678",
  "password": "newpassword123" // optional
}
```

---

## Shop Endpoints

### Get All Shops
**GET** `/api/shops`

**Query Parameters:**
- `category` - Filter by category
- `street` - Filter by street
- `search` - Search in name/description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```
GET /api/shops?category=Electronics&street=First%20Avenue&page=1&limit=10
```

### Get Shop by ID
**GET** `/api/shops/:id`

### Get My Shop
**GET** `/api/shops/my/shop` 🔒

### Create Shop
**POST** `/api/shops` 🔒

**Body:**
```json
{
  "shopName": "Tech Hub",
  "description": "Best electronics in Eastleigh",
  "categories": ["Electronics", "Phones"],
  "street": "First Avenue",
  "buildingFloor": "2nd Floor, Room 205",
  "phone": "+254712345678",
  "email": "techhub@example.com",
  "whatsapp": "+254712345678",
  "profileImage": "data:image/jpeg;base64,...",
  "workingHours": {
    "open": "08:00",
    "close": "18:00"
  }
}
```

### Update Shop
**PUT** `/api/shops/:id` 🔒

### Delete Shop
**DELETE** `/api/shops/:id` 🔒

---

## Product Endpoints

### Get All Products
**GET** `/api/products`

**Query Parameters:**
- `category` - Filter by category
- `shop` - Filter by shop ID
- `search` - Search in name/description/tags
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```
GET /api/products?category=Phones&minPrice=10000&maxPrice=50000&page=1
```

### Get Product by ID
**GET** `/api/products/:id`

### Get My Products
**GET** `/api/products/my/products` 🔒

### Create Product
**POST** `/api/products` 🔒

**Body:**
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with amazing features",
  "price": 120000,
  "compareAtPrice": 150000,
  "category": "Phones",
  "images": ["data:image/jpeg;base64,..."],
  "stock": 10,
  "inStock": true,
  "tags": ["iPhone", "Apple", "Smartphone"]
}
```

### Update Product
**PUT** `/api/products/:id` 🔒

### Delete Product
**DELETE** `/api/products/:id` 🔒

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "message": "Error description",
  "stack": "..." // Only in development
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Notes

- 🔒 indicates protected endpoints requiring authentication
- All timestamps are in ISO 8601 format
- Images can be Base64 encoded or URLs
- Maximum payload size: 50MB (for Base64 images)
