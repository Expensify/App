/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type {TargetedEvent} from 'react-native';
import type {BootSplashModule} from '@libs/BootSplash/types';
import type {EnvironmentCheckerModule} from '@libs/Environment/betaChecker/types';
import type StartupTimer from '@libs/StartupTimer/types';
import type Response from '@src/types/onyx/Response';

type HybridAppModule = {
    closeReactNativeApp: (shouldSignOut: boolean) => void;
    completeOnboarding: (status: boolean) => void;
    reauthenticate: () => Promise<Response>;
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
    }

    namespace Animated {
        interface AnimatedInterpolation<OutputT extends number | string> extends AnimatedWithChildren {
            interpolate(config: InterpolationConfigType): AnimatedInterpolation<OutputT>;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __getValue: () => OutputT;
        }
    }
}
