import config from '../config';
import execAsync from './execAsync';

function androidReversePort(): Promise<void> {
    return execAsync(`adb reverse tcp:${config.SERVER_PORT} tcp:${config.SERVER_PORT}`);
}

export default androidReversePort;
