import {DeviceEventEmitter, NativeModules} from 'react-native';
import Onyx, {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {HybridApp} from '@src/types/onyx';
import {setIsSigningIn, setOldDotSignInError, setOldDotSignInState, setReadyToSwitchToClassicExperience} from './actions/HybridApp';
import type {Init} from './ActiveClientManager/types';
import Log from './Log';

let currentHybridApp: OnyxEntry<HybridApp>;
Onyx.connect({
    key: ONYXKEYS.HYBRID_APP,
    callback: (hybridApp) => {
        if (currentHybridApp?.oldDotSignInState === CONST.HYBRID_APP_SIGN_IN_STATE.RETRYING_AFTER_FAILURE && hybridApp?.oldDotSignInState === CONST.HYBRID_APP_SIGN_IN_STATE.FINISHED) {
            if (hybridApp?.oldDotSignInError) {
                setOldDotSignInState(CONST.HYBRID_APP_SIGN_IN_STATE.FAILED_AGAIN);
            } else {
                NativeModules.HybridAppModule.closeReactNativeApp(false, true);
            }
        }
        currentHybridApp = hybridApp;
    },
});

const init: Init = () => {
    if (!NativeModules.HybridAppModule) {
        return;
    }

    // Setup event listeners
    DeviceEventEmitter.addListener(CONST.EVENTS.HYBRID_APP.ON_SIGN_IN_FINISHED, (data) => {
        Log.info(`[HybridApp] onSignInFinished event received with data: ${data}`, true);
        const eventData = JSON.parse(data as string) as {errorMessage: string};

        setIsSigningIn(false);
        setOldDotSignInError(eventData.errorMessage);
        setOldDotSignInState(CONST.HYBRID_APP_SIGN_IN_STATE.FINISHED);

        if (eventData.errorMessage === null) {
            setReadyToSwitchToClassicExperience(true);
        }
    });
};

export default {init};
