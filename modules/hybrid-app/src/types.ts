type HybridAppModuleType = {
    isHybridApp: () => boolean;
    shouldUseStaging: (isStaging: boolean) => void;
    closeReactNativeApp: (args: {shouldSignOut: boolean; shouldSetNVP: boolean}) => void;
    completeOnboarding: (args: {status: boolean}) => void;
    switchAccount: (args: {newDotCurrentAccountEmail: string; authToken: string; policyID: string; accountID: string}) => void;
    sendAuthToken: (args: {authToken: string}) => void;
};

export default HybridAppModuleType;
