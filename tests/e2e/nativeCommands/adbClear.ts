import execAsync from '../utils/execAsync';
import * as Logger from '../utils/logger';

const adbClear = (): Promise<boolean> => {
    Logger.log(`🧹 Clearing the typed text`);
    return execAsync(`
      function clear_input() {
          adb shell input keyevent KEYCODE_MOVE_END
          # delete up to 2 characters per 1 press, so 1..3 will delete up to 6 characters
          adb shell input keyevent --longpress $(printf 'KEYCODE_DEL %.0s' {1..3})
      }

      clear_input
    `).then(() => true);
};

export default adbClear;
