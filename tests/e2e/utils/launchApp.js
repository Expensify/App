/* eslint-disable rulesdir/prefer-underscore-method */
const {APP_PACKAGE, ACTIVITY_PATH} = require('../config');
const execAsync = require('./execAsync');

module.exports = function (platform = 'android', packageName = APP_PACKAGE, activityPath = ACTIVITY_PATH, launchArgs = {}) {
    if (platform !== 'android') {
        throw new Error(`launchApp() missing implementation for platform: ${platform}`);
    }

    // Use adb to start the app
    const launchArgsString = Object.keys(launchArgs)
        .map((key) => `${typeof launchArgs[key] === 'boolean' ? '--ez' : '--es'} ${key} ${launchArgs[key]}`)
        .join(' ');
    return execAsync(`adb shell am start -n ${packageName}/${activityPath} ${launchArgsString}`);
};
