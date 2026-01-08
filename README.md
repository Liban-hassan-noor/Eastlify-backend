# Eastlify Backend

Backend API for Eastlify - A platform for discovering and managing shops in Eastleigh, Nairobi.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Features

✅ User authentication (register, login, JWT)  
✅ Shop management (CRUD operations)  
✅ Product management (CRUD operations)  
✅ Search & filtering (by category, street, price)  
✅ Pagination support  
✅ Role-based access control  
✅ Base64 image support  

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Eastlify-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
```

4. **Run the server**

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## Project Structure

```
Eastlify-backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── shopController.js  # Shop CRUD operations
│   └── productController.js # Product CRUD operations
├── middleware/
│   ├── auth.js            # JWT & role verification
│   └── errorHandler.js    # Error handling
├── models/
│   ├── User.js            # User schema
│   ├── Shop.js            # Shop schema
│   └── Product.js         # Product schema
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── shopRoutes.js      # Shop endpoints
│   └── productRoutes.js   # Product endpoints
├── utils/
│   └── jwt.js             # JWT utilities
├── .env                   # Environment variables
├── server.js              # Main entry point
└── package.json
```

## Available Scripts

- `npm start` - Run the server in production mode
- `npm run dev` - Run the server in development mode with nodemon

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |

## Models

### User
- Authentication & authorization
- Shop owner profiles
- Password hashing with bcrypt

### Shop
- Shop information & location
- Categories & contact details
- Images (profile, cover, gallery)
- Working hours & verification status

### Product
- Product details & pricing
- Stock management
- Images & tags
- Linked to shops

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Shops
- `GET /api/shops` - Get all shops (with filters)
- `GET /api/shops/:id` - Get shop by ID
- `GET /api/shops/my/shop` - Get my shop (protected)
- `POST /api/shops` - Create shop (protected)
- `PUT /api/shops/:id` - Update shop (protected)
- `DELETE /api/shops/:id` - Delete shop (protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/my/products` - Get my products (protected)
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected routes with middleware
- Role-based access control
- Input validation on models

## License

ISC
