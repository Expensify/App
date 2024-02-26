import config from '../config';
import type {PromiseWithAbort} from './execAsync';
import execAsync from './execAsync';

function androidReversePort(): PromiseWithAbort {
    return execAsync(`adb reverse tcp:${config.SERVER_PORT} tcp:${config.SERVER_PORT}`);
}

export default androidReversePort;
