import execAsync from '../utils/execAsync';
import * as Logger from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/require-await
const adbBackspace = async () => {
    Logger.log(`🔙 Pressing backspace`);
    execAsync(`adb shell input keyevent KEYCODE_DEL`);
    return true;
};

export default adbBackspace;
