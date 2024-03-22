import execAsync from '../utils/execAsync';
import * as Logger from '../utils/logger';

const adbTypeText = (text: string) => {
    Logger.log(`📝 Typing text: ${text}`);
    execAsync(`adb shell input text "${text}"`);
    return true;
};

export default adbTypeText;
