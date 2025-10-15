#!/usr/bin/env node

/**
 * Test script for REST API endpoints
 * Run this after starting the server to test all HTTP methods
 */

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testAPI() {
    const baseURL = 'http://localhost:3000';
    
    console.log('🚀 Testing REST API Endpoints...\n');

    try {
        // Test 1: OPTIONS - CORS preflight
        console.log('1️⃣  Testing OPTIONS (CORS preflight)');
        const optionsResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/items',
            method: 'OPTIONS'
        });
        console.log(`   Status: ${optionsResponse.statusCode}`);
        console.log(`   CORS Headers: ${optionsResponse.headers['access-control-allow-methods']}\n`);

        // Test 2: GET all items
        console.log('2️⃣  Testing GET /items (all items)');
        const getAllResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/items',
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        console.log(`   Status: ${getAllResponse.statusCode}`);
        const allItems = JSON.parse(getAllResponse.body);
        console.log(`   Found ${allItems.count} items\n`);

        // Test 3: GET specific item
        console.log('3️⃣  Testing GET /items/1 (specific item)');
        const getOneResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/items/1',
            method: 'GET'
        });
        console.log(`   Status: ${getOneResponse.statusCode}`);
        if (getOneResponse.statusCode === 200) {
            const item = JSON.parse(getOneResponse.body);
            console.log(`   Item: ${item.item.name} - $${item.item.price}\n`);
        } else {
            console.log(`   Error: ${JSON.parse(getOneResponse.body).message}\n`);
        }

        // Test 4: POST - Create new item
        console.log('4️⃣  Testing POST /items (create new item)');
        const newItem = {
            name: "Orange",
            category: "Fruit",
            price: 0.8,
            inStock: true
        };
        const postResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/items',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, newItem);
        console.log(`   Status: ${postResponse.statusCode}`);
        if (postResponse.statusCode === 201) {
            const created = JSON.parse(postResponse.body);
            console.log(`   Created: ${created.item.name} with ID ${created.item.id}\n`);
        } else {
            console.log(`   Error: ${JSON.parse(postResponse.body).message}\n`);
        }

        // Test 5: PUT - Update item
        console.log('5️⃣  Testing PUT /items/1 (update item)');
        const updateData = {
            name: "Green Apple",
            price: 0.6
        };
        const putResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/items/1',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        }, updateData);
        console.log(`   Status: ${putResponse.statusCode}`);
        if (putResponse.statusCode === 200) {
            const updated = JSON.parse(putResponse.body);
            console.log(`   Updated: ${updated.item.name} - $${updated.item.price}\n`);
        } else {
            console.log(`   Error: ${JSON.parse(putResponse.body).message}\n`);
        }

        // Test 6: DELETE - Delete item
        console.log('6️⃣  Testing DELETE /items/2 (delete item)');
        const deleteResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/items/2',
            method: 'DELETE'
        });
        console.log(`   Status: ${deleteResponse.statusCode}`);
        if (deleteResponse.statusCode === 200) {
            const deleted = JSON.parse(deleteResponse.body);
            console.log(`   Deleted: ${deleted.deletedItem.name}\n`);
        } else {
            console.log(`   Error: ${JSON.parse(deleteResponse.body).message}\n`);
        }

        // Test 7: GET all items again to see changes
        console.log('7️⃣  Testing GET /items (check final state)');
        const finalGetResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/items',
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        console.log(`   Status: ${finalGetResponse.statusCode}`);
        const finalItems = JSON.parse(finalGetResponse.body);
        console.log(`   Final count: ${finalItems.count} items`);
        finalItems.items.forEach(item => {
            console.log(`     - ${item.name} (ID: ${item.id}) - $${item.price}`);
        });

        console.log('\n✅ All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running: node server.js');
    }
}

// Run tests if server is accessible
console.log('🔍 Checking if server is running...');
makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 2000
}).then(() => {
    testAPI();
}).catch(() => {
    console.log('❌ Server not accessible. Please start the server first:');
    console.log('   node server.js');
    console.log('\nThen run this test script:');
    console.log('   node test-endpoints.js');
});