import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Log} from '@src/types/onyx';

function addLog(log: Log) {
    Onyx.merge(ONYXKEYS.LOGS, {
        [log.time.getTime()]: log,
    });
}

export default addLog;
