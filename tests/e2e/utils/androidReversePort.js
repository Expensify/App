import config from '../config';
import execAsync from './execAsync';

export default function () {
    return execAsync(`adb reverse tcp:${config.SERVER_PORT} tcp:${config.SERVER_PORT}`);
}
