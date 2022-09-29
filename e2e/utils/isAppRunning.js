const {APP_PACKAGE} = require('../config');
const execAsync = require('./execAsync');

module.exports = function () {
    // adb shell pidof
    const cmd = `adb shell pidof ${APP_PACKAGE}`;
    return execAsync(cmd);
};
