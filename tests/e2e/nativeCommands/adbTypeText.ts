import execAsync from '../utils/execAsync';
import * as Logger from '../utils/logger';

const adbTypeText = (text: string) => {
    Logger.log(`📝 Typing text: ${text}`);
    return execAsync(`adb shell input text "${text}"`).then(() => true);
};

export default adbTypeText;
