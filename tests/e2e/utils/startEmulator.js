const execAsync = require('./execAsync');

module.exports = function (emulatorName) {
    return execAsync(`emulator @${emulatorName} -no-snapstorage > /dev/null 2>&1 &`);
};
