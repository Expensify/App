const execAsync = require('./execAsync');

module.exports = function () {
    // Use adb to kill the app
    return execAsync(`adb shell getprop sys.boot_completed | tr -d '\r'`);
};
