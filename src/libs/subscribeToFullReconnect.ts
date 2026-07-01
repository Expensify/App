import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {triggerFullReconnect} from './actions/App';
import {shouldTriggerFullReconnect} from './FullReconnectUtils';
import Log from './Log';

// This watches the two Onyx values that decide a full reconnect (see FullReconnectUtils) and fires
// one when the app is stale. Neither value is shown in the UI, so we read them with
// connectWithoutView. Do not copy this into a component: use useOnyx there so the UI updates.

let lastFullReconnectTime = '';
Onyx.connectWithoutView({
    key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
    callback: (value) => {
        lastFullReconnectTime = value ?? '';
        doFullReconnectIfNecessary();
    },
});

let serverReconnectCutoff = '';
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE,
    callback: (value) => {
        serverReconnectCutoff = value ?? '';
        doFullReconnectIfNecessary();
    },
});

function doFullReconnectIfNecessary() {
    if (!shouldTriggerFullReconnect(lastFullReconnectTime, serverReconnectCutoff)) {
        return;
    }

    Log.info('Full reconnect triggered', false, {lastFullReconnectTime, serverReconnectCutoff});
    triggerFullReconnect(serverReconnectCutoff);
}
