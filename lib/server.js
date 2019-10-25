//
//  Copyright 2017-present Amrayn Web Services
//  https://amrayn.com
//
//  Author: @abumusamq
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//

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
