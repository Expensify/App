import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

// eslint-disable-next-line rulesdir/no-inline-named-export, @typescript-eslint/consistent-type-definitions
export interface Spec extends TurboModule {
    isHybridApp: () => boolean;
    closeReactNativeApp: (shouldSignOut: boolean, shouldSetNVP: boolean) => void;
    completeOnboarding: (status: boolean) => void;
    switchAccount: (newDotCurrentAccountEmail: string, authToken: string, policyID: string, accountID: string) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeHybridApp');
