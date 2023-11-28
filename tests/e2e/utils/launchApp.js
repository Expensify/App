const {APP_PACKAGE} = require('../config');
const execAsync = require('./execAsync');

module.exports = function (platform = 'android', packageName = APP_PACKAGE) {
    if (platform !== 'android') {
        throw new Error(`launchApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to start the app
    return execAsync(`adb shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`);
};
