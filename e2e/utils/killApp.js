const {execSync} = require('node:child_process');
const {APP_PACKAGE} = require('../config');

module.exports = function (platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`killApp() missing implementation for platform: ${platform}`);
    }

    // use adb to kill the app
    execSync(`adb shell am force-stop ${APP_PACKAGE}`);
};
