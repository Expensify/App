const {APP_PACKAGE} = require('../config');
const execAsync = require('./execAsync');

module.exports = function (platform = 'android', packageName = APP_PACKAGE) {
    if (platform !== 'android') {
        throw new Error(`killApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to kill the app
    return execAsync(`adb shell am force-stop ${packageName}`);
};
