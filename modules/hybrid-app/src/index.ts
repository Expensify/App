const HybridAppModule = {
    isHybridApp() {
        return false;
    },
    /* eslint-disable @typescript-eslint/no-unused-vars */
    closeReactNativeApp(shouldSignOut: boolean, shouldSetNVP: boolean) {},
    completeOnboarding(status: boolean) {},
    switchAccount(newDotCurrentAccountEmail: string, authToken: string, policyID: string, accountID: string) {},
};

export default HybridAppModule;
