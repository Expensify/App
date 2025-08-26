import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {reconnectApp} from './actions/App';
import Log from './Log';

let lastFullReconnectTime = '';
// We do not depend on updates on the UI to determine the last full reconnect time,
// so we can use `connectWithoutView` here.
Onyx.connectWithoutView({
    key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
    callback: (value) => {
        lastFullReconnectTime = value ?? '';
        doFullReconnectIfNecessary();
    },
});

let reconnectAppIfFullReconnectBefore = '';
// We do not depend on updates on the UI to determine if we should reconnect the app,
// so we can use `connectWithoutView` here.
Onyx.connectWithoutView({
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
