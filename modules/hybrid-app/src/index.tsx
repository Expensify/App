import ReactNativeHybridApp from './NativeReactNativeHybridApp';

const HybridAppModule = {
    isHybridApp: ReactNativeHybridApp.isHybridApp,
    closeReactNativeApp: ReactNativeHybridApp.closeReactNativeApp,
    completeOnboarding: ReactNativeHybridApp.completeOnboarding,
    switchAccount: ReactNativeHybridApp.switchAccount,
};

export default HybridAppModule;
