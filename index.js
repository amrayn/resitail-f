"use strict";

const fs = require('fs');

function resitailf (config, serverInfo) {
    this.config = config;
    this.serverInfo = serverInfo;
}

resitailf.prototype.send = (data) => {
    console.log('resitail-f is not ready yet, please contribute to the project @ https://github.com/muflihun/resitail-f');
    console.log(data);
}

module.exports = (config, serverInfo) => new resitailf(config, serverInfo);
