#!/usr/bin/env bash

# Demo script showing all REST API endpoints
# Make sure to start the server first: node server.js

echo "🚀 Node.js REST API Demo"
echo "========================"
echo ""

# Check if server is running
echo "🔍 Checking server status..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Server is running on http://localhost:3000"
else
    echo "❌ Server is not running. Please start it first:"
    echo "   node server.js"
    echo ""
    exit 1
fi

echo ""
echo "📋 Available Endpoints:"
echo "-----------------------"

# 1. GET all items (JSON)
echo ""
echo "1️⃣  GET /items (JSON format)"
echo "Command: curl -H \"Accept: application/json\" http://localhost:3000/items"
echo "Response:"
curl -s -H "Accept: application/json" http://localhost:3000/items | jq '.' 2>/dev/null || curl -s -H "Accept: application/json" http://localhost:3000/items

echo ""
echo "2️⃣  GET /items/1 (specific item)"
echo "Command: curl http://localhost:3000/items/1"
echo "Response:"
curl -s http://localhost:3000/items/1 | jq '.' 2>/dev/null || curl -s http://localhost:3000/items/1

echo ""
echo "3️⃣  POST /items (create new item)"
echo "Command: curl -X POST http://localhost:3000/items -H \"Content-Type: application/json\" -d '{\"name\":\"Orange\",\"category\":\"Fruit\",\"price\":0.8,\"inStock\":true}'"
echo "Response:"
curl -s -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Orange","category":"Fruit","price":0.8,"inStock":true}' | jq '.' 2>/dev/null || \
curl -s -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Orange","category":"Fruit","price":0.8,"inStock":true}'

echo ""
echo "4️⃣  PUT /items/1 (update item)"
echo "Command: curl -X PUT http://localhost:3000/items/1 -H \"Content-Type: application/json\" -d '{\"name\":\"Green Apple\",\"price\":0.6}'"
echo "Response:"
curl -s -X PUT http://localhost:3000/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Green Apple","price":0.6}' | jq '.' 2>/dev/null || \
curl -s -X PUT http://localhost:3000/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Green Apple","price":0.6}'

echo ""
echo "5️⃣  DELETE /items/2 (delete item)"
echo "Command: curl -X DELETE http://localhost:3000/items/2"
echo "Response:"
curl -s -X DELETE http://localhost:3000/items/2 | jq '.' 2>/dev/null || curl -s -X DELETE http://localhost:3000/items/2

echo ""
echo "6️⃣  OPTIONS /items (CORS preflight)"
echo "Command: curl -I -X OPTIONS http://localhost:3000/items"
echo "Response headers:"
curl -I -s -X OPTIONS http://localhost:3000/items | grep -E "(HTTP|Access-Control)"

echo ""
echo "7️⃣  Final state - GET /items"
echo "Command: curl -H \"Accept: application/json\" http://localhost:3000/items"
echo "Response:"
curl -s -H "Accept: application/json" http://localhost:3000/items | jq '.' 2>/dev/null || curl -s -H "Accept: application/json" http://localhost:3000/items

echo ""
echo "✅ Demo completed!"
echo ""
echo "💡 You can also visit http://localhost:3000 in your browser to see the HTML interface."