const execAsync = require('./execAsync');

module.exports = function (platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`rebootEmulator() missing implementation for platform: ${platform}`);
    }

    // Use adb to kill the app
    return execAsync(`adb -e reboot`);
};
