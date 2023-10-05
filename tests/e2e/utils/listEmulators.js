const execAsync = require('./execAsync');

module.exports = function (platform = 'android') {
    if (platform !== 'android') {
        throw new Error(`rebootEmulator() missing implementation for platform: ${platform}`);
    }

    return execAsync(`emulator -list-avds`);
};
