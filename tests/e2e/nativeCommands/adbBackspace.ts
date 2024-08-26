import execAsync from '../utils/execAsync';
import * as Logger from '../utils/logger';

const adbBackspace = (): Promise<boolean> => {
    Logger.log(`🔙 Pressing backspace`);
    return execAsync(`adb shell input keyevent KEYCODE_DEL`).then(() => true);
};

export default adbBackspace;
