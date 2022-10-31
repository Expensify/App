const {APP_PACKAGE} = require('../config');
const execAsync = require('./execAsync');

function launchApp(platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`launchApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to start the app
    return execAsync(`adb shell monkey -p ${APP_PACKAGE} -c android.intent.category.LAUNCHER 1`);
}

module.exports = launchApp;
