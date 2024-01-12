const execAsync = require('../utils/execAsync');
const Logger = require('../utils/logger');

const adbTypeText = async (text) => {
    Logger.log(`📝 Typing text: ${text}`);
    execAsync(`adb shell input text "${text}"`);
    return true;
};

module.exports = adbTypeText;
