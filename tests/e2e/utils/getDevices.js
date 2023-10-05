const execAsync = require('./execAsync');

module.exports = function () {
    return execAsync(`adb devices`);
};
