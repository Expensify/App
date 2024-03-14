import config from '../config';
import type {PromiseWithAbort} from './execAsync';
import execAsync from './execAsync';

function androidReversePort(platform = 'android'): PromiseWithAbort {
    if (platform === 'android') {
        return execAsync(`adb reverse tcp:${config.SERVER_PORT} tcp:${config.SERVER_PORT}`);
    }

    return Promise.resolve();
}

export default androidReversePort;
