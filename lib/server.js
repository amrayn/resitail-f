const express = require('express');
const path = require('path');
const http = require('http');
const io = require('socket.io');

function Server(config) {
    const app = express();

    // Serve static assets
    app.use(express.static(path.resolve(__dirname, '..', 'web')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'web', req.url));
    });

    const server = http.createServer(app);
    this.io = io.listen(server);
    
    server.listen(config.port, () => {
        console.log(`tail-f is listening on port ${config.port}!`);
    });
}

module.exports = Server;
