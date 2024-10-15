/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type {TargetedEvent} from 'react-native';
import type {BootSplashModule} from '@libs/BootSplash/types';
import type {EnvironmentCheckerModule} from '@libs/Environment/betaChecker/types';
import type {ShortcutManagerModule} from '@libs/ShortcutManager';
import type StartupTimer from '@libs/StartupTimer/types';

type HybridAppModule = {
    closeReactNativeApp: (shouldSignOut: boolean, shouldSetNVP: boolean) => void;
    completeOnboarding: (status: boolean) => void;
    switchAccounts: (newDotCurrentAccount: string) => void;
    exitApp: () => void;
};

type RNTextInputResetModule = {
    resetKeyboardInput: (nodeHandle: number | null) => void;
};

declare module 'react-native' {
    interface TextInputFocusEventData extends TargetedEvent {
        text: string;
        eventCount: number;
        relatedTarget?: {
            id?: string;
        };
    }

    interface PressableStateCallbackType extends WebPressableStateCallbackType {
        readonly isScreenReaderActive: boolean;
        readonly isDisabled: boolean;
    }

    interface AppStateStatic {
        emitCurrentTestState: (status: string) => void;
    }

    interface LinkingStatic {
        setInitialURL: (url: string) => void;
    }

    interface NativeModulesStatic {
        BootSplash: BootSplashModule;
        HybridAppModule: HybridAppModule;
        StartupTimer: StartupTimer;
        RNTextInputReset: RNTextInputResetModule;
        EnvironmentChecker: EnvironmentCheckerModule;
        ShortcutManager: ShortcutManagerModule;
    }

    namespace Animated {
        interface AnimatedInterpolation<OutputT extends number | string> extends AnimatedWithChildren {
            interpolate(config: InterpolationConfigType): AnimatedInterpolation<OutputT>;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __getValue: () => OutputT;
        }
    }
}
