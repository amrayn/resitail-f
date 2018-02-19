"use strict";

const fs = require('fs');

function resitailf (options) {
    this.config = options.config;
    this.serverInfo = options.serverInfo;
}

resitailf.prototype.send = (data) => {
    console.log('resitail-f is not ready yet, please contribute to the project @ https://github.com/muflihun/resitail-f');
    console.log(data);
}

module.exports = (options) => new resitailf(options);
