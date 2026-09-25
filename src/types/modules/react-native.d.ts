import type {BootSplashModule} from '@libs/BootSplash/types';
import type {EnvironmentCheckerModule} from '@libs/Environment/betaChecker/types';
import type {NavBarButtonStyle, NavigationBarType} from '@libs/NavBarManager/types';
import type {ShareActionHandlerModule} from '@libs/ShareActionHandlerModule';
import type {ShortcutManagerModule} from '@libs/ShortcutManager';

/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type {TargetedEvent} from 'react-native';

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

type GpsTripServiceModule = {
    startService: (title: string, body: string, deepLink: string) => void;
    stopService: () => void;
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
    // The Strict API exports these as type aliases. `expo/types/react-native-web.d.ts` (pulled in by
    // `types: ["react-native-web"]`) redeclares them as interfaces, and augmenting a type alias with
    // an interface erases every property. Web CSS that react-native-web accepts is added as its own
    // exported type instead, and composed at the call site.
    type WebViewStyle = {
        backdropFilter?: string;
        animationDelay?: string | string[] | number | number[];
        animationDirection?: string | string[];
        animationDuration?: string | string[] | number | number[];
        animationFillMode?: string | string[];
        animationName?: string | Record<string, unknown> | (string | Record<string, unknown>)[];
        animationIterationCount?: number | 'infinite' | (number | 'infinite')[];
        animationPlayState?: string | string[];
        animationTimingFunction?: string | string[];
        backgroundAttachment?: string;
        backgroundBlendMode?: string;
        backgroundClip?: string;
        backgroundImage?: string;
        backgroundOrigin?: 'border-box' | 'content-box' | 'padding-box';
        backgroundPosition?: string;
        backgroundRepeat?: string;
        backgroundSize?: string;
        boxSizing?: string;
        clip?: string;
        gridAutoColumns?: string;
        gridAutoFlow?: string;
        gridAutoRows?: string;
        gridColumnEnd?: string;
        gridColumnGap?: string;
        gridColumnStart?: string;
        gridRowEnd?: string;
        gridRowGap?: string;
        gridRowStart?: string;
        gridTemplateColumns?: string;
        gridTemplateRows?: string;
        gridTemplateAreas?: string;
        outline?: string;
        overflowX?: string;
        overflowY?: string;
        overscrollBehavior?: 'auto' | 'contain' | 'none';
        overscrollBehaviorX?: 'auto' | 'contain' | 'none';
        overscrollBehaviorY?: 'auto' | 'contain' | 'none';
        perspective?: string;
        perspectiveOrigin?: string;
        touchAction?: string;
        transitionDelay?: string | string[];
        transitionDuration?: string | string[] | number;
        transitionProperty?: string | string[];
        transitionTimingFunction?: string | Function | (string | Function)[];
        userSelect?: string;
        visibility?: string;
        willChange?: string;
        position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
        whiteSpace?: string;
        textOverflow?: string;
        wordBreak?: string;
        WebkitUserSelect?: string;
        WebkitTouchCallout?: string;
        transformOrigin?: string;
    };

    type WebTextStyle = WebViewStyle & {
        textIndent?: string;
        textRendering?: string;
        unicodeBidi?: string;
        wordWrap?: string;
        verticalAlign?: string;
    };

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
        GpsTripServiceModule: GpsTripServiceModule;
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
