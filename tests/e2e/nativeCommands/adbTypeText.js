import execAsync from '../utils/execAsync';
import Logger from '../utils/logger';

const adbTypeText = async (text) => {
    Logger.log(`📝 Typing text: ${text}`);
    execAsync(`adb shell input text "${text}"`);
    return true;
};

export default adbTypeText;
