import type HybridAppModuleType from './types';

const HybridAppModule: HybridAppModuleType = {
    isHybridApp() {
        return false;
    },
    shouldUseStaging() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `shouldUseStaging` should never be called on web');
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
    getHybridAppSettings() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `getHybridAppSettings` should never be called on web');
        return Promise.resolve(null);
    },
    getInitialURL() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `getInitialURL` should never be called on web');
        return Promise.resolve(null);
    },
    onURLListenerAdded() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `onURLListenerAdded` should never be called on web');
    },
    signInToOldDot() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `signInToOldDot` should never be called on web');
    },
    signOutFromOldDot() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `signOutFromOldDot` should never be called on web');
    },
    clearOldDotAfterSignOut() {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `clearOldDotAfterSignOut` should never be called on web');
    },
};

export default HybridAppModule;
