const {APP_PACKAGE} = require('../config');
const execAsync = require('./execAsync');

function killApp(platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`killApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to kill the app
    return execAsync(`adb shell am force-stop ${APP_PACKAGE}`);
}

module.exports = killApp;
