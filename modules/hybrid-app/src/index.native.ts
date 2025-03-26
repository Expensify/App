import ReactNativeHybridApp from './NativeReactNativeHybridApp';
import type HybridAppModuleType from './types';

const HybridAppModule: HybridAppModuleType = {
    isHybridApp() {
        return ReactNativeHybridApp.isHybridApp();
    },
    closeReactNativeApp({shouldSignOut, shouldSetNVP}) {
        ReactNativeHybridApp.closeReactNativeApp(shouldSignOut, shouldSetNVP);
    },
    completeOnboarding({status}) {
        ReactNativeHybridApp.completeOnboarding(status);
    },
    switchAccount({newDotCurrentAccountEmail, authToken, policyID, accountID}) {
        ReactNativeHybridApp.switchAccount(newDotCurrentAccountEmail, authToken, policyID, accountID);
    },
};

export default HybridAppModule;
