const http = require('http');
const itemsJson = require('./items.json');

http.createServer(function (req, res) {

    console.log('req.method: ' + req.method);

    if (req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Content-Type', 'text/html');
        res.write('<html><body><h1>This is a fruit list.</h1><ul>');

        itemsJson.forEach(item => {
            res.write(`<li>${item.name} - $${item.price}</li>`);
        });

        res.write('</ul></body></html>\n');
        res.end();
    }

}).listen(3000, () => {
  console.log('Server running at http://127.0.0.1:3000/');
});

