const {execSync} = require('node:child_process');
const {SERVER_PORT} = require('../config');

module.exports = function () {
    execSync(`adb reverse tcp:${SERVER_PORT} tcp:${SERVER_PORT}`);
};
