# Node.js REST API Demo

A complete REST API backend application demonstrating all HTTP methods (GET, POST, PUT, DELETE, OPTIONS) for managing an items store.

## Features

- ✅ **GET** - Retrieve all items or specific item by ID
- ✅ **POST** - Create new items
- ✅ **PUT** - Update existing items
- ✅ **DELETE** - Remove items
- ✅ **OPTIONS** - CORS preflight support
- 🌐 CORS enabled for cross-origin requests
- 📱 HTML interface for browser testing
- 🔧 JSON API for programmatic access
- ⚡ In-memory data storage (resets on server restart)

## Getting Started

### Installation & Running

```bash
# Navigate to project directory
cd node-rest-api

# Install dependencies (if any)
npm install

# Start the server
node server.js
```

The server will start on `http://localhost:3000`

### Testing the API

#### Option 1: Browser Interface
Visit `http://localhost:3000` in your browser to see the HTML interface with all items and API documentation.

#### Option 2: Automated Test Script
```bash
# Run the test script (server must be running)
node test-endpoints.js
```

#### Option 3: Manual Testing with curl

## API Endpoints

### 1. GET Methods

#### Get All Items
```bash
# HTML response (default)
curl http://localhost:3000/

# JSON response
curl -H "Accept: application/json" http://localhost:3000/items
```

**Response Example:**
```json
{
  "message": "Items retrieved successfully",
  "count": 5,
  "items": [
    {
      "id": 1,
      "name": "Apple",
      "category": "Fruit",
      "price": 0.5,
      "inStock": true
    }
  ]
}
```

#### Get Specific Item
```bash
curl http://localhost:3000/items/1
```

**Response Example:**
```json
{
  "message": "Item retrieved successfully",
  "item": {
    "id": 1,
    "name": "Apple",
    "category": "Fruit",
    "price": 0.5,
    "inStock": true
  }
}
```

### 2. POST Method - Create Item

```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Orange",
    "category": "Fruit", 
    "price": 0.8,
    "inStock": true
  }'
```

**Required Fields:** `name`, `category`, `price`  
**Optional Fields:** `inStock` (defaults to `true`)

**Response Example:**
```json
{
  "message": "Item created successfully",
  "item": {
    "id": 6,
    "name": "Orange",
    "category": "Fruit",
    "price": 0.8,
    "inStock": true
  }
}
```

### 3. PUT Method - Update Item

```bash
curl -X PUT http://localhost:3000/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Green Apple",
    "price": 0.6
  }'
```

**Note:** You can update any combination of fields. Omitted fields remain unchanged.

**Response Example:**
```json
{
  "message": "Item updated successfully",
  "item": {
    "id": 1,
    "name": "Green Apple",
    "category": "Fruit",
    "price": 0.6,
    "inStock": true
  }
}
```

### 4. DELETE Method - Remove Item

```bash
curl -X DELETE http://localhost:3000/items/1
```

**Response Example:**
```json
{
  "message": "Item deleted successfully",
  "deletedItem": {
    "id": 1,
    "name": "Apple",
    "category": "Fruit",
    "price": 0.5,
    "inStock": true
  }
}
```

### 5. OPTIONS Method - CORS Preflight

```bash
curl -X OPTIONS http://localhost:3000/items
```

**Response:** Empty body with CORS headers for cross-origin requests.

## Error Handling

The API provides comprehensive error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Missing required fields: name, category, price",
  "required": ["name", "category", "price"],
  "optional": ["inStock"]
}
```

### 404 Not Found
```json
{
  "error": "Item not found", 
  "message": "Item with ID 999 does not exist"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Data Schema

Each item has the following structure:

```javascript
{
  "id": number,        // Auto-generated unique identifier
  "name": string,      // Item name (required)
  "category": string,  // Item category (required)  
  "price": number,     // Item price (required)
  "inStock": boolean   // Availability status (optional, defaults to true)
}
```

## CORS Support

The API includes full CORS support with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Demo Application 🏪

### Items Store Manager - Web Interface

A complete web-based demo application that provides an intuitive interface for managing items through the REST API.

**Quick Start:**
```bash
# Start both API server and demo application
./start-demo.sh

# Or manually:
node server.js    # Terminal 1 - API server (port 3000)
node index.js     # Terminal 2 - Demo app (port 8080)
```

**Open in browser:** `http://localhost:8080`

### Features

- 📱 **Responsive Web Interface** - Works on desktop and mobile
- 📊 **Real-time Statistics** - Total items, in-stock count, out-of-stock count
- ➕ **Add Items** - Form-based item creation with validation
- ✏️ **Edit Items** - Click-to-edit functionality with pre-filled forms
- 🗑️ **Delete Items** - One-click deletion with confirmation
- 🔄 **Reset to Default** - Restore original sample data
- 🎯 **Visual Feedback** - Success/error messages and loading states
- 🔍 **Auto-Detection** - Checks API server status automatically

### Demo Application Architecture

```
Web Browser (localhost:8080)
    ↕ HTTP Requests
Demo Server (index.js)
    ↕ Proxy/Static Files
REST API Server (server.js - localhost:3000)
    ↕ CRUD Operations
In-Memory Data Store
```

### Available Scripts

```bash
# Quick start (recommended)
./start-demo.sh start     # Start both servers
./start-demo.sh stop      # Stop both servers
./start-demo.sh status    # Check server status
./start-demo.sh test      # Run API tests
./start-demo.sh open      # Open demo in browser

# NPM scripts
npm run dev               # Start both servers
npm run api              # Start only API server
npm run demo             # Start only demo application
npm run test-api         # Run automated API tests
npm run demo-bash        # Run bash-based API demo
```

## Project Structure

```
node-rest-api/
├── server.js           # REST API server (port 3000)
├── index.js            # Demo application server (port 8080)
├── index.html          # Demo web interface
├── items.json          # Initial data (5 sample items)
├── test-endpoints.js   # Automated Node.js test script
├── demo.sh             # Bash script for API testing
├── start-demo.sh       # Complete startup script
├── package.json        # Project metadata with scripts
└── README.md          # This documentation
```

## Notes

Started as [Coursera short course](https://www.coursera.org/learn/node-js-restful-api-backend-app/ungradedLab/sn2al/apis-in-node-js-write-a-restful-api-backend-app); massively extended with full CRUD operations.

## Future Enhancements

- [ ] Persistent data storage (database integration)
- [ ] Authentication and authorization
- [ ] Input validation and sanitization
- [ ] Rate limiting
- [ ] API versioning
- [ ] Logging and monitoring
