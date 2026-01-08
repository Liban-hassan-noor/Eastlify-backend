# Eastlify Backend - User Flow

## 🎯 Architecture Overview

Eastlify has **two types of users**:

### 1. **Customers (Public Users)** 👥
- **No account needed**
- **No login required**
- Can browse shops and products freely
- All data is publicly accessible

### 2. **Shop Owners** 🏪
- **Must register and login**
- Manage their own shop
- Add/edit/delete their products
- Cannot access other shops' data

---

## 📱 User Flows

### **Customer Flow (No Authentication)**

```
1. Customer opens Eastlify app
2. Browses shops by category/street
3. Views shop details
4. Views products
5. Contacts shop via phone/WhatsApp
   ↓
   No login, no account, no authentication!
```

**Endpoints Used:**
- `GET /api/shops` - Browse shops
- `GET /api/shops/:id` - View shop details
- `GET /api/products` - Browse products
- `GET /api/products/:id` - View product details

---

### **Shop Owner Flow (Requires Authentication)**

```
1. Shop owner registers
   POST /api/auth/register
   ↓ Receives JWT token

2. Shop owner logs in (future visits)
   POST /api/auth/login
   ↓ Receives JWT token

3. Shop owner creates their shop
   POST /api/shops (with token)
   ↓ Shop created and linked to owner

4. Shop owner adds products
   POST /api/products (with token)
   ↓ Products linked to their shop

5. Shop owner manages their business
   - Update shop: PUT /api/shops/:id (with token)
   - Update products: PUT /api/products/:id (with token)
   - View their shop: GET /api/shops/my/shop (with token)
```

---

## 🔐 Authentication Details

### **Who Needs to Login?**
✅ **Shop Owners** - To manage their shop and products  
❌ **Customers** - No login needed, browse freely

### **User Roles**
- `shop_owner` - Default role for all registered users
- `admin` - For platform administrators (future use)

### **Token Usage**
Shop owners receive a JWT token after login/register:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

This token must be included in the `Authorization` header for protected endpoints:
```
Authorization: Bearer <token>
```

---

## 🌐 Public vs Protected Endpoints

### **Public Endpoints (No Token Required)**
Anyone can access these:

```
GET  /api/shops              - List all shops
GET  /api/shops/:id          - Get shop details
GET  /api/products           - List all products
GET  /api/products/:id       - Get product details
```

### **Protected Endpoints (Token Required)**
Only authenticated shop owners:

```
POST /api/auth/register      - Register new shop owner
POST /api/auth/login         - Login shop owner
GET  /api/auth/profile       - Get shop owner profile
PUT  /api/auth/profile       - Update shop owner profile

POST /api/shops              - Create shop
GET  /api/shops/my/shop      - Get my shop
PUT  /api/shops/:id          - Update my shop
DELETE /api/shops/:id        - Delete my shop

POST /api/products           - Create product
GET  /api/products/my/products - Get my products
PUT  /api/products/:id       - Update my product
DELETE /api/products/:id     - Delete my product
```

---

## 🔒 Security Rules

### **Shop Ownership Verification**
When a shop owner tries to update/delete:
1. Backend checks if they're logged in (JWT token)
2. Backend checks if they own the shop
3. Only allows action if both are true

**Example:**
```javascript
// In shopController.js
if (shop.owner.toString() !== req.user._id.toString()) {
  throw new Error("Not authorized to update this shop");
}
```

### **Product Ownership Verification**
Same for products - shop owners can only modify their own products:
```javascript
// In productController.js
const shop = await Shop.findById(product.shop);
if (shop.owner.toString() !== req.user._id.toString()) {
  throw new Error("Not authorized to update this product");
}
```

---

## 📊 Data Access Matrix

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| Browse shops | ✅ Public | ✅ Public | ✅ Public |
| View shop details | ✅ Public | ✅ Public | ✅ Public |
| Browse products | ✅ Public | ✅ Public | ✅ Public |
| View product details | ✅ Public | ✅ Public | ✅ Public |
| Register account | ❌ N/A | ✅ Yes | ✅ Yes |
| Create shop | ❌ N/A | ✅ Own only | ✅ Any |
| Edit shop | ❌ N/A | ✅ Own only | ✅ Any |
| Delete shop | ❌ N/A | ✅ Own only | ✅ Any |
| Create product | ❌ N/A | ✅ Own shop | ✅ Any |
| Edit product | ❌ N/A | ✅ Own shop | ✅ Any |
| Delete product | ❌ N/A | ✅ Own shop | ✅ Any |

---

## 💡 Frontend Integration

### **For Customer Pages (Public)**
No authentication needed:
```javascript
// Browse shops
const response = await fetch('http://localhost:5000/api/shops');
const data = await response.json();

// No token, no headers, just fetch!
```

### **For Shop Owner Dashboard (Protected)**
Include JWT token:
```javascript
// Get token from localStorage
const token = localStorage.getItem('token');

// Create shop
const response = await fetch('http://localhost:5000/api/shops', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ← Include token!
  },
  body: JSON.stringify(shopData)
});
```

---

## 🎯 Summary

Your backend is **perfectly designed** for your use case:

✅ **Customers** browse without accounts (public endpoints)  
✅ **Shop owners** register/login to manage their business (protected endpoints)  
✅ **Security** ensures shop owners can only modify their own data  
✅ **Simple** - No unnecessary customer authentication  

This is exactly what you need! 🚀
