import {DeviceEventEmitter, NativeModules} from 'react-native';
import CONST from '@src/CONST';
import {setIsSigningIn} from './actions/HybridApp';
import type {Init} from './ActiveClientManager/types';
import Log from './Log';

const init: Init = () => {
    if (!NativeModules.HybridAppModule) {
        return;
    }

    // Setup event listeners
    DeviceEventEmitter.addListener(CONST.EVENTS.HYBRID_APP.ON_SIGN_IN_FINISHED, () => {
        Log.info('[HybridApp] `onSignInFinished` event received', true);
        setIsSigningIn(false);
    });
};

export {init};
