# 🚀 Items Store Manager - Complete Demo Setup

This document provides a comprehensive guide to using the Items Store Manager demo application, which showcases a complete REST API with a modern web interface.

## 📋 Quick Start Guide

### 1. Easy Setup (Recommended)
```bash
# Navigate to the project directory
cd node-rest-api

# Start everything with one command
./start-demo.sh start

# Open in browser
# The script will display the URL: http://localhost:8080
```

### 2. Manual Setup
```bash
# Terminal 1: Start REST API server
node server.js

# Terminal 2: Start demo application
node index.js

# Browser: Open http://localhost:8080
```

### 3. Using NPM Scripts
```bash
# Start both servers (may not work on all systems)
npm run dev

# Or start individually
npm run api    # REST API server
npm run demo   # Demo application
```

## 🏪 Demo Application Features

### Main Interface Components

1. **📊 Statistics Dashboard**
   - Total items count
   - In-stock items count  
   - Out-of-stock items count
   - Real-time updates

2. **📦 Items Inventory List**
   - Scrollable list of all items
   - Visual indicators for stock status
   - Individual item actions (edit/delete)
   - Auto-refresh functionality

3. **✏️ Item Management Form**
   - Add new items
   - Edit existing items
   - Form validation
   - Category selection dropdown

4. **🔧 Control Actions**
   - Refresh data
   - Reset to default items
   - API status monitoring

### Supported Operations

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| View All Items | GET | `/items` | Display all items in inventory |
| View Item Details | GET | `/items/:id` | Show specific item information |
| Create New Item | POST | `/items` | Add new item to inventory |
| Update Item | PUT | `/items/:id` | Modify existing item |
| Delete Item | DELETE | `/items/:id` | Remove item from inventory |
| Reset Data | Multiple | Custom | Restore original sample data |

## 🎯 Testing the Demo

### 1. Browser Testing
1. Open `http://localhost:8080` in your browser
2. Use the web interface to perform CRUD operations
3. Watch real-time updates in the statistics and item list

### 2. API Testing
```bash
# Test with the automated script
./start-demo.sh test

# Or use the Node.js test script
node test-endpoints.js

# Or use the bash demo script
./demo.sh
```

### 3. Manual API Testing
```bash
# Get all items
curl -H "Accept: application/json" http://localhost:3000/items

# Create new item
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Mango","category":"Fruit","price":1.2,"inStock":true}'

# Update item
curl -X PUT http://localhost:3000/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Red Apple","price":0.7}'

# Delete item
curl -X DELETE http://localhost:3000/items/2
```

## 🔧 Advanced Usage

### Server Management
```bash
# Check server status
./start-demo.sh status

# Stop all servers
./start-demo.sh stop

# Restart servers
./start-demo.sh restart

# Open demo in browser
./start-demo.sh open
```

### Health Monitoring
```bash
# Check health endpoint
curl http://localhost:8080/health

# View status page
curl http://localhost:8080/status
```

### Development Tips
1. **Debugging**: Use browser developer tools to monitor API requests
2. **CORS**: The API includes CORS headers for cross-origin requests  
3. **Data Persistence**: Data is stored in memory and resets on server restart
4. **Port Configuration**: Default ports are 3000 (API) and 8080 (demo)

## 🎨 Demo Application Screenshots

### Main Interface
- Clean, modern design with gradient backgrounds
- Responsive layout that works on desktop and mobile
- Real-time statistics cards at the top
- Scrollable items list with visual stock indicators
- Intuitive form interface for item management

### Features in Action
- **Adding Items**: Fill out the form and click "Add Item"
- **Editing Items**: Click "Edit" button on any item to pre-fill the form
- **Deleting Items**: Click "Delete" with confirmation prompt
- **Resetting Data**: "Reset to Default" button restores original 5 items
- **Status Feedback**: Success and error messages for all operations

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 8080
   lsof -ti:3000 | xargs kill -9
   lsof -ti:8080 | xargs kill -9
   ```

2. **API Server Not Running**
   - Check if `node server.js` is running in another terminal
   - Visit `http://localhost:8080/status` to see server status

3. **CORS Issues**
   - The API includes proper CORS headers
   - Make sure both servers are running on correct ports

4. **Browser Caching**
   - Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+R)
   - Clear browser cache if needed

### Error Messages
- **"Server not accessible"**: REST API server (port 3000) is not running
- **"Failed to load items"**: Network connectivity issue or server error
- **"Item not found"**: Attempting to access/modify non-existent item ID

## 🎓 Learning Objectives

This demo demonstrates:

1. **REST API Design**: Proper HTTP methods and status codes
2. **CRUD Operations**: Complete Create, Read, Update, Delete functionality  
3. **Error Handling**: Comprehensive error responses and user feedback
4. **CORS Support**: Cross-origin resource sharing for web applications
5. **Frontend Integration**: Modern JavaScript fetch API usage
6. **Form Validation**: Client and server-side data validation
7. **User Experience**: Loading states, success/error messaging
8. **Responsive Design**: Mobile-friendly interface
9. **State Management**: Real-time data synchronization

## 📚 API Documentation

For complete API documentation, see the main README.md file or visit:
- **HTML Documentation**: `http://localhost:3000/` (when API server is running)
- **JSON Responses**: Use `Accept: application/json` header

## 🤝 Contributing

To extend this demo:
1. Add new API endpoints in `server.js`
2. Enhance the UI in `index.html`
3. Add new features to the demo server in `index.js`
4. Update tests in `test-endpoints.js`
5. Modify startup scripts as needed

## 📄 License

MIT, author: Oliver Schafeld, 2025, (with Github Copilot and Claude in Agent mode).
