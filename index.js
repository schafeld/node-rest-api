const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

/**
 * Simple web server to serve the Items Store Manager demo application
 * This serves the HTML interface that connects to the REST API server
 */

const PORT = 8080;
const API_PORT = 3000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

// Helper function to check if API server is running
async function checkApiServer() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: API_PORT,
            path: '/items',
            method: 'GET',
            timeout: 2000,
            headers: { 'Accept': 'application/json' }
        }, (res) => {
            resolve(true);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => resolve(false));
        req.end();
    });
}

// Serve static files
function serveStaticFile(res, filePath) {
    const fullPath = path.join(__dirname, filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
            <head><title>404 - Not Found</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>404 - File Not Found</h1>
                <p>The requested file <code>${filePath}</code> was not found.</p>
                <p><a href="/">← Back to Home</a></p>
            </body>
            </html>
        `);
        return;
    }

    // Get file extension and MIME type
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'text/plain';

    // Read and serve file
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                <head><title>500 - Server Error</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>500 - Internal Server Error</h1>
                    <p>Error reading file: ${err.message}</p>
                    <p><a href="/">← Back to Home</a></p>
                </body>
                </html>
            `);
            return;
        }

        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
}

// Serve status page
async function serveStatusPage(res) {
    const apiStatus = await checkApiServer();
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Demo Application Status</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                    max-width: 800px; 
                    margin: 50px auto; 
                    padding: 20px; 
                    line-height: 1.6;
                }
                .status-card { 
                    border: 1px solid #ddd; 
                    border-radius: 10px; 
                    padding: 20px; 
                    margin: 20px 0; 
                    background: #f9f9f9;
                }
                .status-ok { border-left: 5px solid #28a745; }
                .status-error { border-left: 5px solid #dc3545; }
                .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 5px;
                }
                .btn:hover { background: #0056b3; }
                pre { 
                    background: #f1f1f1; 
                    padding: 15px; 
                    border-radius: 5px; 
                    overflow-x: auto; 
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <h1>🚀 Items Store Manager - Demo Status</h1>
            
            <div class="status-card ${apiStatus ? 'status-ok' : 'status-error'}">
                <h3>REST API Server Status</h3>
                <p><strong>URL:</strong> http://localhost:${API_PORT}</p>
                <p><strong>Status:</strong> ${apiStatus ? '✅ Running' : '❌ Not Running'}</p>
                ${!apiStatus ? '<p><strong>Action needed:</strong> Start the REST API server first</p>' : ''}
            </div>

            <div class="status-card status-ok">
                <h3>Demo Application Server Status</h3>
                <p><strong>URL:</strong> http://localhost:${PORT}</p>
                <p><strong>Status:</strong> ✅ Running (you\'re here!)</p>
            </div>

            <div class="status-card">
                <h3>🎯 Quick Actions</h3>
                ${apiStatus ? 
                    '<a href="/" class="btn">🏪 Open Items Store Manager</a>' : 
                    '<p style="color: #dc3545;">Start the REST API server to access the demo application</p>'
                }
                <a href="/status" class="btn">🔄 Refresh Status</a>
            </div>

            <div class="status-card">
                <h3>📚 Setup Instructions</h3>
                <p><strong>Step 1:</strong> Start the REST API server</p>
                <pre>cd ${path.basename(__dirname)}
node server.js</pre>
                
                <p><strong>Step 2:</strong> Start this demo application (if not already running)</p>
                <pre>node index.js</pre>
                
                <p><strong>Step 3:</strong> Open the Items Store Manager</p>
                <pre>Open http://localhost:${PORT} in your browser</pre>
            </div>

            <div class="status-card">
                <h3>🔧 Available Endpoints</h3>
                <p><strong>Demo Application:</strong></p>
                <ul>
                    <li><code>GET /</code> - Items Store Manager Interface</li>
                    <li><code>GET /status</code> - This status page</li>
                    <li><code>GET /index.html</code> - Direct access to HTML file</li>
                </ul>
                
                <p><strong>REST API Server (port ${API_PORT}):</strong></p>
                <ul>
                    <li><code>GET /items</code> - Get all items</li>
                    <li><code>GET /items/:id</code> - Get specific item</li>
                    <li><code>POST /items</code> - Create new item</li>
                    <li><code>PUT /items/:id</code> - Update item</li>
                    <li><code>DELETE /items/:id</code> - Delete item</li>
                    <li><code>OPTIONS</code> - CORS preflight</li>
                </ul>
            </div>

            <div class="status-card">
                <h3>💡 Tips</h3>
                <ul>
                    <li>Make sure both servers are running on different ports</li>
                    <li>The demo app (port ${PORT}) connects to the API server (port ${API_PORT})</li>
                    <li>Use the browser's developer tools to see API requests</li>
                    <li>Try the API directly with curl or Postman for testing</li>
                </ul>
            </div>
        </body>
        </html>
    `);
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`${req.method} ${pathname}`);

    // Enable CORS for API requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        switch (pathname) {
            case '/':
                // Check if API is running before serving main app
                const apiRunning = await checkApiServer();
                if (apiRunning) {
                    serveStaticFile(res, 'index.html');
                } else {
                    // Redirect to status page if API is not running
                    res.writeHead(302, { 'Location': '/status' });
                    res.end();
                }
                break;

            case '/status':
                serveStatusPage(res);
                break;

            case '/index.html':
                serveStaticFile(res, 'index.html');
                break;

            case '/health':
                // Health check endpoint
                const isHealthy = await checkApiServer();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'ok',
                    demoServer: 'running',
                    apiServer: isHealthy ? 'running' : 'not running',
                    timestamp: new Date().toISOString()
                }));
                break;

            default:
                // Try to serve as static file
                if (pathname.startsWith('/')) {
                    serveStaticFile(res, pathname.substring(1));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                        <head><title>404 - Not Found</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>404 - Page Not Found</h1>
                            <p>The requested path <code>${pathname}</code> was not found.</p>
                            <p><a href="/">← Back to Home</a> | <a href="/status">📊 Check Status</a></p>
                        </body>
                        </html>
                    `);
                }
                break;
        }
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
            <head><title>500 - Server Error</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>500 - Internal Server Error</h1>
                <p>An unexpected error occurred: ${error.message}</p>
                <p><a href="/">← Back to Home</a></p>
            </body>
            </html>
        `);
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Items Store Manager Demo running at http://localhost:${PORT}/`);
    console.log(`📊 Status page: http://localhost:${PORT}/status`);
    console.log(`🔧 Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('📋 Setup checklist:');
    console.log(`   1. ✅ Demo server started (port ${PORT})`);
    console.log(`   2. ⏳ Start REST API server: node server.js (port ${API_PORT})`);
    console.log(`   3. 🌐 Open http://localhost:${PORT} in your browser`);
    console.log('');
    console.log('💡 The demo will automatically check if the API server is running');
    console.log('   and guide you through the setup process.');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down demo server...');
    server.close(() => {
        console.log('✅ Demo server stopped');
        process.exit(0);
    });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});