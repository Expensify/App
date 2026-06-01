/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type {TargetedEvent} from 'react-native';
import type {BootSplashModule} from '@libs/BootSplash/types';
import type {EnvironmentCheckerModule} from '@libs/Environment/betaChecker/types';
import type {NavBarButtonStyle, NavigationBarType} from '@libs/NavBarManager/types';
import type {ShareActionHandlerModule} from '@libs/ShareActionHandlerModule';
import type {ShortcutManagerModule} from '@libs/ShortcutManager';

type AppStateTrackerModule = {
    getWasAppRelaunchedFromIcon: () => Promise<boolean>;
};

type RNTextInputResetModule = {
    resetKeyboardInput: (nativeId: string) => void;
};

type RNNavBarManagerModule = {
    setButtonStyle: (style: NavBarButtonStyle) => void;
    getType: () => NavigationBarType;
};

type TestToolsBridge = {
    /**
     * "Soft" kills the app so that it can still run in the background
     */
    softKillApp: () => void;
};

type PushNotificationBridge = {
    /** Signal to native code that we're done processing a push notification. */
    finishBackgroundProcessing: () => void;
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

    interface LinkingImpl {
        setInitialURL: (url: string) => void;
    }

    interface NativeModulesStatic {
        AppStateTracker: AppStateTrackerModule;
        BootSplash: BootSplashModule;
        RNTextInputReset: RNTextInputResetModule;
        RNNavBarManager: RNNavBarManagerModule;
        EnvironmentChecker: EnvironmentCheckerModule;
        ShortcutManager: ShortcutManagerModule;
        ShareActionHandler: ShareActionHandlerModule;
        TestToolsBridge: TestToolsBridge;
        PushNotificationBridge?: PushNotificationBridge;
    }

    namespace Animated {
        interface AnimatedInterpolation<OutputT extends number | string> extends AnimatedWithChildren {
            interpolate(config: InterpolationConfigType): AnimatedInterpolation<OutputT>;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __getValue: () => OutputT;
        }
    }
}
