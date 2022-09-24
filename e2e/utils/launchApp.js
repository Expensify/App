const {execSync} = require('node:child_process');
const {APP_PACKAGE} = require('../config');

module.exports = function (platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`launchApp() missing implementation for platform: ${platform}`);
    }

    // use adb to start the app
    execSync(`adb shell monkey -p ${APP_PACKAGE} -c android.intent.category.LAUNCHER 1`);
};
