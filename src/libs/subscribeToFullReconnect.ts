import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {reconnectApp} from './actions/App';
import Log from './Log';

let lastFullReconnectTime = '';
Onyx.connect({
    key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
    callback: (value) => {
        lastFullReconnectTime = value ?? '';
        doFullReconnectIfNecessary();
    },
});

let reconnectAppIfFullReconnectBefore = '';
Onyx.connect({
    key: ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE,
    callback: (value) => {
        reconnectAppIfFullReconnectBefore = value ?? '';
        doFullReconnectIfNecessary();
    },
});

function doFullReconnectIfNecessary() {
    if (lastFullReconnectTime >= reconnectAppIfFullReconnectBefore) {
        return;
    }

    Log.info('Full reconnect triggered', false, {lastFullReconnectTime, reconnectAppIfFullReconnectBefore});
    reconnectApp();
}
