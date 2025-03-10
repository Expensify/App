import Log from '@libs/Log';
import type HybridAppModuleType from './types';

const HybridAppModule: HybridAppModuleType = {
    isHybridApp() {
        return false;
    },
    closeReactNativeApp() {
        Log.warn('HybridAppModule: `closeReactNativeApp` should never be called on web');
    },
    completeOnboarding() {
        Log.warn('HybridAppModule: `completeOnboarding` should never be called on web');
    },
    switchAccount() {
        Log.warn('HybridAppModule: `switchAccount` should never be called on web');
    },
};

export default HybridAppModule;
