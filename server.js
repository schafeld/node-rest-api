const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Load initial data from JSON file
let items = require('./items.json');

// Helper function to parse request body
function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Helper function to find item by ID
function findItemById(id) {
    return items.find(item => item.id === parseInt(id));
}

// Helper function to find item index by ID
function findItemIndexById(id) {
    return items.findIndex(item => item.id === parseInt(id));
}

// Helper function to generate next ID
function getNextId() {
    return Math.max(...items.map(item => item.id)) + 1;
}

// Helper function to set CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Helper function to send JSON response
function sendJsonResponse(res, statusCode, data) {
    setCorsHeaders(res);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data, null, 2));
}

// Helper function to send HTML response
function sendHtmlResponse(res, statusCode, html) {
    setCorsHeaders(res);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
}

http.createServer(async function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    console.log(`${method} ${pathname}`);

    try {
        // Handle OPTIONS method (CORS preflight)
        if (method === 'OPTIONS') {
            setCorsHeaders(res);
            res.statusCode = 200;
            res.end();
            return;
        }

        // Route: GET / or GET /items - Get all items
        if (method === 'GET' && (pathname === '/' || pathname === '/items')) {
            // Check if client wants JSON or HTML
            const acceptHeader = req.headers.accept || '';
            
            if (acceptHeader.includes('application/json')) {
                // Return JSON response
                sendJsonResponse(res, 200, {
                    message: 'Items retrieved successfully',
                    count: items.length,
                    items: items
                });
            } else {
                // Return HTML response (default)
                let html = `
                    <html>
                    <head>
                        <title>REST API Demo - Items</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 40px; }
                            .item { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
                            .item.out-of-stock { background-color: #ffe6e6; }
                            .actions { margin: 20px 0; }
                            .method { display: inline-block; margin: 5px; padding: 8px 16px; border-radius: 4px; color: white; text-decoration: none; }
                            .get { background-color: #28a745; }
                            .post { background-color: #007bff; }
                            .put { background-color: #ffc107; color: black; }
                            .delete { background-color: #dc3545; }
                        </style>
                    </head>
                    <body>
                        <h1>REST API Demo - Items Store</h1>
                        <h2>Available Items (${items.length} total)</h2>
                `;

                items.forEach(item => {
                    const stockClass = item.inStock ? '' : 'out-of-stock';
                    const stockText = item.inStock ? 'In Stock' : 'Out of Stock';
                    html += `
                        <div class="item ${stockClass}">
                            <strong>${item.name}</strong> (ID: ${item.id})<br>
                            Category: ${item.category}<br>
                            Price: $${item.price}<br>
                            Status: ${stockText}
                        </div>
                    `;
                });

                html += `
                        <div class="actions">
                            <h3>API Endpoints Demo:</h3>
                            <p>Try these endpoints with tools like curl, Postman, or your browser:</p>
                            <ul>
                                <li><span class="method get">GET</span> <code>/items</code> or <code>/</code> - Get all items</li>
                                <li><span class="method get">GET</span> <code>/items/1</code> - Get specific item by ID</li>
                                <li><span class="method post">POST</span> <code>/items</code> - Create new item</li>
                                <li><span class="method put">PUT</span> <code>/items/1</code> - Update item by ID</li>
                                <li><span class="method delete">DELETE</span> <code>/items/1</code> - Delete item by ID</li>
                                <li><span class="method post">POST</span> <code>/reset</code> - Reset to original data</li>
                            </ul>
                            
                            <h4>Example curl commands:</h4>
                            <pre>
# Get all items as JSON
curl -H "Accept: application/json" http://localhost:3000/items

# Get specific item
curl http://localhost:3000/items/1

# Create new item
curl -X POST http://localhost:3000/items \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Orange","category":"Fruit","price":0.8,"inStock":true}'

# Update item
curl -X PUT http://localhost:3000/items/1 \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Green Apple","category":"Fruit","price":0.6,"inStock":true}'

# Delete item
curl -X DELETE http://localhost:3000/items/1

# Reset data to original state
curl -X POST http://localhost:3000/reset
                            </pre>
                        </div>
                    </body>
                    </html>
                `;
                
                sendHtmlResponse(res, 200, html);
            }
            return;
        }

        // Route: GET /items/:id - Get specific item by ID
        if (method === 'GET' && pathname.startsWith('/items/')) {
            const itemId = pathname.split('/')[2];
            const item = findItemById(itemId);
            
            if (!item) {
                sendJsonResponse(res, 404, {
                    error: 'Item not found',
                    message: `Item with ID ${itemId} does not exist`
                });
                return;
            }
            
            sendJsonResponse(res, 200, {
                message: 'Item retrieved successfully',
                item: item
            });
            return;
        }

        // Route: POST /items - Create new item
        if (method === 'POST' && pathname === '/items') {
            try {
                const newItemData = await parseRequestBody(req);
                
                // Validate required fields
                if (!newItemData.name || !newItemData.category || newItemData.price === undefined) {
                    sendJsonResponse(res, 400, {
                        error: 'Bad Request',
                        message: 'Missing required fields: name, category, price',
                        required: ['name', 'category', 'price'],
                        optional: ['quantity', 'inStock']
                    });
                    return;
                }
                
                // Create new item with auto-generated ID
                const newItem = {
                    id: getNextId(),
                    name: newItemData.name,
                    category: newItemData.category,
                    price: parseFloat(newItemData.price),
                    quantity: newItemData.quantity !== undefined ? parseInt(newItemData.quantity) : 0,
                    inStock: newItemData.inStock !== undefined ? newItemData.inStock : true
                };
                
                // Add to items array
                items.push(newItem);
                
                sendJsonResponse(res, 201, {
                    message: 'Item created successfully',
                    item: newItem
                });
                return;
                
            } catch (error) {
                sendJsonResponse(res, 400, {
                    error: 'Bad Request',
                    message: 'Invalid JSON in request body'
                });
                return;
            }
        }

        // Route: PUT /items/:id - Update item by ID
        if (method === 'PUT' && pathname.startsWith('/items/')) {
            const itemId = pathname.split('/')[2];
            const itemIndex = findItemIndexById(itemId);
            
            if (itemIndex === -1) {
                sendJsonResponse(res, 404, {
                    error: 'Item not found',
                    message: `Item with ID ${itemId} does not exist`
                });
                return;
            }
            
            try {
                const updateData = await parseRequestBody(req);
                const currentItem = items[itemIndex];
                
                // Update item fields (only if provided)
                const updatedItem = {
                    id: currentItem.id, // ID should not change
                    name: updateData.name !== undefined ? updateData.name : currentItem.name,
                    category: updateData.category !== undefined ? updateData.category : currentItem.category,
                    price: updateData.price !== undefined ? parseFloat(updateData.price) : currentItem.price,
                    quantity: updateData.quantity !== undefined ? parseInt(updateData.quantity) : currentItem.quantity,
                    inStock: updateData.inStock !== undefined ? updateData.inStock : currentItem.inStock
                };
                
                // Update the item in array
                items[itemIndex] = updatedItem;
                
                sendJsonResponse(res, 200, {
                    message: 'Item updated successfully',
                    item: updatedItem
                });
                return;
                
            } catch (error) {
                sendJsonResponse(res, 400, {
                    error: 'Bad Request',
                    message: 'Invalid JSON in request body'
                });
                return;
            }
        }

        // Route: DELETE /items/:id - Delete item by ID
        if (method === 'DELETE' && pathname.startsWith('/items/')) {
            const itemId = pathname.split('/')[2];
            const itemIndex = findItemIndexById(itemId);
            
            if (itemIndex === -1) {
                sendJsonResponse(res, 404, {
                    error: 'Item not found',
                    message: `Item with ID ${itemId} does not exist`
                });
                return;
            }
            
            // Remove item from array
            const deletedItem = items.splice(itemIndex, 1)[0];
            
            sendJsonResponse(res, 200, {
                message: 'Item deleted successfully',
                deletedItem: deletedItem
            });
            return;
        }

        // Route: POST /reset - Reset data to original items.json
        if (method === 'POST' && pathname === '/reset') {
            try {
                // Reload original data from items.json file
                const originalData = JSON.parse(fs.readFileSync('./items.json', 'utf8'));
                items = [...originalData]; // Reset the items array
                
                sendJsonResponse(res, 200, {
                    message: 'Data reset to original state successfully',
                    itemCount: items.length,
                    items: items
                });
                return;
            } catch (error) {
                console.error('Error resetting data:', error);
                sendJsonResponse(res, 500, {
                    error: 'Internal Server Error',
                    message: 'Failed to reset data: ' + error.message
                });
                return;
            }
        }

        // Route not found
        sendJsonResponse(res, 404, {
            error: 'Not Found',
            message: `Route ${method} ${pathname} not found`,
            availableRoutes: [
                'GET /',
                'GET /items',
                'GET /items/:id',
                'POST /items',
                'PUT /items/:id',
                'DELETE /items/:id',
                'POST /reset',
                'OPTIONS (any route)'
            ]
        });

    } catch (error) {
        console.error('Server error:', error);
        sendJsonResponse(res, 500, {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }

}).listen(3000, () => {
    console.log('Server running at http://127.0.0.1:3000/');
    console.log('Available endpoints:');
    console.log('  GET    /           - Get all items (HTML)');
    console.log('  GET    /items      - Get all items (JSON with Accept header)');
    console.log('  GET    /items/:id  - Get specific item');
    console.log('  POST   /items      - Create new item');
    console.log('  PUT    /items/:id  - Update item');
    console.log('  DELETE /items/:id  - Delete item');
    console.log('  POST   /reset      - Reset to original data');
    console.log('  OPTIONS (any)      - CORS preflight');
});

