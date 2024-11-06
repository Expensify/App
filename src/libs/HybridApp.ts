import {DeviceEventEmitter, NativeModules} from 'react-native';
import CONST from '@src/CONST';
import {setIsSigningIn, setOldDotSignInError, setReadyToSwitchToClassicExperience} from './actions/HybridApp';
import type {Init} from './ActiveClientManager/types';
import Log from './Log';

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
        setReadyToSwitchToClassicExperience(true);
    });
};

export default {init};
