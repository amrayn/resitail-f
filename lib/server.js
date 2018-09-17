const express = require('express');
const basicAuth = require('express-basic-auth');
const md5 = require('md5');
const path = require('path');
const http = require('http');
const io = require('socket.io');

function Server(config) {
    const app = express();

    if (config.auth && config.auth.user && config.auth.pwd_hash) {
      console.log('Enabling basic auth...');
      app.use(basicAuth({
        authorizer: (user, pwd) =>
          (user === config.auth.user && md5(pwd) === config.auth.pwd_hash),
        challenge: true,
      }));
    }

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
