import HybridAppModule from '@expensify/react-native-hybrid-app';
import Onyx from 'react-native-onyx';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';

function closeReactNativeApp({shouldSignOut, shouldSetNVP}: {shouldSignOut: boolean; shouldSetNVP: boolean}) {
    if (CONFIG.IS_HYBRID_APP) {
        Onyx.merge(ONYXKEYS.HYBRID_APP, {closingReactNativeApp: true});
    }
    // eslint-disable-next-line no-restricted-properties
    HybridAppModule.closeReactNativeApp({shouldSignOut, shouldSetNVP});
}

export default closeReactNativeApp;
