/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type {TargetedEvent} from 'react-native';
import type {BootSplashModule} from '@libs/BootSplash/types';
import type {EnvironmentCheckerModule} from '@libs/Environment/betaChecker/types';
import type {NavBarButtonStyle, NavigationBarType} from '@libs/NavBarManager/types';
import type {ShareActionHandlerModule} from '@libs/ShareActionHandlerModule';
import type {ShortcutManagerModule} from '@libs/ShortcutManager';
import type StartupTimer from '@libs/StartupTimer/types';

type RNTextInputResetModule = {
    resetKeyboardInput: (nodeHandle: number | null) => void;
};

type RNNavBarManagerModule = {
    setButtonStyle: (style: NavBarButtonStyle) => void;
    getType(): NavigationBarType;
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
        StartupTimer: StartupTimer;
        RNTextInputReset: RNTextInputResetModule;
        RNNavBarManager: RNNavBarManagerModule;
        EnvironmentChecker: EnvironmentCheckerModule;
        ShortcutManager: ShortcutManagerModule;
        ShareActionHandler: ShareActionHandlerModule;
    }

    namespace Animated {
        interface AnimatedInterpolation<OutputT extends number | string> extends AnimatedWithChildren {
            interpolate(config: InterpolationConfigType): AnimatedInterpolation<OutputT>;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __getValue: () => OutputT;
        }
    }
}
