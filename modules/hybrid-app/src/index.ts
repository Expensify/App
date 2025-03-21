import type HybridAppModuleType from './types';

const HybridAppModule: HybridAppModuleType = {
    isHybridApp() {
        return false;
    },
    closeReactNativeApp() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `closeReactNativeApp` should never be called on web');
    },
    completeOnboarding() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `completeOnboarding` should never be called on web');
    },
    switchAccount() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `switchAccount` should never be called on web');
    },
    sendAuthToken() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `sendAuthToken` should never be called on web');
    },
};

export default HybridAppModule;
