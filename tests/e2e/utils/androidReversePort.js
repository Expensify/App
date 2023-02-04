const {SERVER_PORT} = require('../config');
const execAsync = require('./execAsync');

module.exports = function () {
    return execAsync(`adb reverse tcp:${SERVER_PORT} tcp:${SERVER_PORT}`);
};
