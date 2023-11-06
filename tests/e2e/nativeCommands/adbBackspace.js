const execAsync = require('../utils/execAsync');
const Logger = require('../utils/logger');

const adbBackspace = async () => {
    Logger.log(`🔙 Pressing backspace`);
    execAsync(`adb shell input keyevent KEYCODE_DEL`);
    return true;
};

module.exports = adbBackspace;
