//
//  Copyright 2017-present Muflihun Labs
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

"use strict";

const fs = require('fs');
const socket = require('socket.io');
const includes = require('lodash.includes');
const Server = require('./lib/server.js');

function resitailf(options) {
    this.config = options.config;
    this.server_info = options.serverInfo;

    const server = new Server(this.config);
    this.io = server.io;

    this.connected_clients = [];

    this.set_recent = (recent) => {
        this.recent = recent;
    }

    this.send = (data) => {
        const logger_id = data.logger_id || data.channel_name;
        const client_id = data.client_id || data.channel_name;

        for (var i = 0; i < this.connected_clients.length; ++i) {
            if (this.connected_clients[i].ignore_loggers_list.indexOf(logger_id) === -1 &&
                    this.connected_clients[i].ignore_clients_list.indexOf(client_id) === -1) {
                const data_ = {
                    data
                };
                if (this.config.type_map) {
                    for (let i = 0; i < this.config.type_map.length; ++i) {
                        for (let j = 0; j < this.config.type_map[i].input.length; ++j) {
                            if (data.line.indexOf(this.config.type_map[i].input[j]) > -1) {
                                data_.log_type = this.config.type_map[i].type;
                            }
                        }
                    }
                }
                this.io.sockets.connected[this.connected_clients[i].socket].emit("data", data_);
            }
        }
    }

    // https://stackoverflow.com/questions/523266
    this.parse_query = (str) => {

        var obj_url = {};

        str.replace(
            new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
            function( $0, $1, $2, $3 ){
                obj_url[ $1 ] = $3;
            }
        );
        return obj_url;
    }

    server.io.sockets.on('connection', (socket) => {
        const _this = this;

        socket.on('client-ready', function() {
            _this.connected_clients.push({
                socket: socket.id,
                ignore_clients_list: [],
                ignore_loggers_list: [],
            });
            socket.emit("server-ready", {
                server_info: _this.server_info,
                max_lines: _this.config.max_lines,
            });

            if (_this.recent) {
                if (_this.recent.loggers) {
                    _this.recent.loggers.forEach(element => {
                        if (!includes(_this.config.loggers_ignore_list, element.channel_name)) {
                            _this.send(element);
                        }
                    });
                }
                if (_this.recent.clients) {
                    _this.recent.clients.forEach(element => {
                        if (!includes(_this.config.clients_ignore_list, element.channel_name)) {
                            _this.send(element);
                        }
                    });
                }
            }
        });

        socket.on('stop-client', function(data) {
            for (var i = 0; i < _this.connected_clients.length; ++i) {
                if (_this.connected_clients[i].socket === socket.id) {
                    if (_this.connected_clients[i].ignore_clients_list.indexOf(data.id) === -1) {
                        _this.connected_clients[i].ignore_clients_list.push(data.id);
                    }
                    break;
                }
            }
        });

        socket.on('stop-logger', function(data) {
            for (var i = 0; i < _this.connected_clients.length; ++i) {
                if (_this.connected_clients[i].socket === socket.id) {
                    if (_this.connected_clients[i].ignore_loggers_list.indexOf(data.id) === -1) {
                        _this.connected_clients[i].ignore_loggers_list.push(data.id);
                    }
                    break;
                }
            }
        });

        socket.on('start-client', function(data) {
            for (var i = 0; i < _this.connected_clients.length; ++i) {
                if (_this.connected_clients[i].socket === socket.id) {
                    const idx = _this.connected_clients[i].ignore_clients_list.indexOf(data.id);
                    if (idx !== -1) {
                        _this.connected_clients[i].ignore_clients_list.splice(idx, 1);
                    }
                    break;
                }
            }
        });

        socket.on('start-logger', function(data) {
            for (var i = 0; i < _this.connected_clients.length; ++i) {
                if (_this.connected_clients[i].socket === socket.id) {
                    const idx = _this.connected_clients[i].ignore_loggers_list.indexOf(data.id);
                    if (idx !== -1) {
                        _this.connected_clients[i].ignore_loggers_list.splice(idx, 1);
                    }
                    break;
                }
            }
        });

        socket.on('disconnect', function() {
            for (var i = 0; i < _this.connected_clients.length; ++i) {
                if (_this.connected_clients[i].socket === socket.id) {
                    _this.connected_clients.splice(i, 1);
                    break;
                }
            }
        });
    });
}

module.exports = (options) => new resitailf(options);
