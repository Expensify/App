import execAsync from '../utils/execAsync';
import Logger from '../utils/logger';

const adbBackspace = async () => {
    Logger.log(`🔙 Pressing backspace`);
    execAsync(`adb shell input keyevent KEYCODE_DEL`);
    return true;
};

export default adbBackspace;
