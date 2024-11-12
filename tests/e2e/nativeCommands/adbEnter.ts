import execAsync from '../utils/execAsync';
import * as Logger from '../utils/logger';

const adbBackspace = (): Promise<boolean> => {
    Logger.log(`↳ Pressing enter`);
    return execAsync(`adb shell input keyevent KEYCODE_ENTER`).then(() => true);
};

export default adbBackspace;
