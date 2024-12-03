import execAsync from '../utils/execAsync';
import * as Logger from '../utils/logger';

const adbBackspace = () => {
    Logger.log(`🔙 Pressing backspace`);
    execAsync(`adb shell input keyevent KEYCODE_DEL`);
    return true;
};

export default adbBackspace;
