import type {NavigationProp, ParamListBase, RouteProp, RouterFactory, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type CommonProperties from '@src/types/utils/CommonProperties';

// Represents the navigation state type for a platform-specific stack.
type PlatformStackNavigationState<ParamList extends ParamListBase> = StackNavigationState<ParamList>;

// Common navigation options merged from both stack and native-stack navigations.
type CommonStackNavigationOptions = CommonProperties<StackNavigationOptions, NativeStackNavigationOptions>;

// Expanded navigation options including possible custom properties for platform-specific implementations.
type GeneralPlatformStackNavigationOptions = {
    keyboardHandlingEnabled?: boolean;

    // Stack
    // animationEnabled?: boolean;
    // animationTypeForReplace?: 'push' | 'pop';
    // Native stack
    // animation?: ScreenProps['stackAnimation']; // The animation used for transitions
    // animationDuration?: number;
    animation?: 'slide_from_left' | 'slide_from_right' | 'modal' | 'none';

    // Native stack
    // headerBackImageSource?: ImageSourcePropType;
    // headerBackTitleStyle?: StyleProp<{ fontFamily?: string; fontSize?: number; }>;
    // headerBackVisible?: boolean;
    // headerBlurEffect?: ScreenStackHeaderConfigProps['blurEffect'];
    // headerLargeStyle?: StyleProp<{ backgroundColor?: string; }>;
    // headerLargeTitle?: boolean;
    // headerLargeTitleShadowVisible?: boolean;
    // headerLargeTitleStyle?: StyleProp<{ fontFamily?: string; fontSize?: number; fontWeight?: string; color?: string; }>;
    // headerShadowVisible?: boolean;
    // headerTitleAlign?: 'left' | 'center';
    // headerBackButtonMenuEnabled?: boolean;
    header?: unknown;

    // Native stack
    // statusBarAnimation?: ScreenProps['statusBarAnimation'];
    // statusBarColor?: string;
    // statusBarHidden?: boolean;
    // statusBarStyle?: ScreenProps['statusBarStyle'];
    // statusBarTranslucent?: boolean;
    statusBar?: unknown;

    // Stack
    // presentation?: 'card' | 'modal' | 'transparentModal';
    // Native stack
    // presentation?: Exclude<ScreenProps['stackPresentation'], 'push'> | 'card';
    presentation?: 'card' | 'modal' | 'transparentModal';

    // Native stack
    // gestureEnabled?: boolean;
    // gestureResponseDistance?: number;
    // gestureVelocityImpact?: number;
    // gestureDirection?: ScreenProps['swipeDirection'];
    gesture?: unknown;

    // // Unique to StackNavigationOptions
    // cardOverlay?: (props: { style: Animated.WithAnimatedValue<StyleProp<ViewStyle>> }) => React.ReactNode;
    // cardOverlayEnabled?: boolean;
    // cardShadowEnabled?: boolean;
    // cardStyle?: StyleProp<ViewStyle>;
    // detachPreviousScreen?: boolean;
    // keyboardHandlingEnabled?: boolean;
    // freezeOnBlur?: boolean;

    // // Unique to NativeStackNavigationOptions
    // autoHideHomeIndicator?: boolean;
    // contentStyle?: StyleProp<ViewStyle>;
    // customAnimationOnGesture?: boolean;
    // fullScreenGestureEnabled?: boolean;
    // navigationBarColor?: string;
    // navigationBarHidden?: boolean;
    // orientation?: ScreenProps['screenOrientation'];
};

// Combines common and general platform-specific options for PlatformStackNavigation.
type PlatformStackNavigationOptions = CommonStackNavigationOptions & GeneralPlatformStackNavigationOptions;

// Used to represent platform-specific navigation options.
type PlatformSpecificNavigationOptions = StackNavigationOptions | NativeStackNavigationOptions;

// Common event map merged from both stack and native-stack navigations.
type CommonStackNavigationEventMap = CommonProperties<StackNavigationEventMap, NativeStackNavigationEventMap>;

// Represents the event map that can be used in the PlatformStackNavigation (only common events).
type PlatformStackNavigationEventMap = CommonStackNavigationEventMap;

// Used to represent platform-specific event maps.
type PlatformSpecificEventMap = StackNavigationOptions | NativeStackNavigationOptions;

// Router options used in the PlatformStackNavigation
type PlatformStackRouterOptions = StackRouterOptions;

// Factory function type for creating a router specific to the PlatformStackNavigation
type PlatformStackRouterFactory<ParamList extends ParamListBase, RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions> = RouterFactory<
    PlatformStackNavigationState<ParamList>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    RouterOptions
>;

// Represents the navigation prop for passed to screens and "screenOptions" factory functions using the types from PlatformStackNavigation
type PlatformStackNavigationProp<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList, NavigatorID extends string | undefined = undefined> = NavigationProp<
    ParamList,
    RouteName,
    NavigatorID,
    PlatformStackNavigationState<ParamList>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
>;

// Represents the route prop for passed to screens and "screenOptions" factory functions using the types from PlatformStackNavigation
type PlatformStackRouteProp<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList> = RouteProp<ParamList, RouteName>;

type PlatformStackScreenProps<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList,
    NavigatorID extends string | undefined = undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
    NavigationProp extends PlatformStackNavigationProp<ParamList, RouteName, NavigatorID> | any = PlatformStackNavigationProp<ParamList, RouteName, NavigatorID>,
> = {
    route: PlatformStackRouteProp<ParamList, RouteName>;
    navigation: NavigationProp;
};

export type {
    CommonStackNavigationOptions,
    CommonStackNavigationEventMap,
    PlatformStackNavigationState,
    PlatformStackNavigationOptions,
    PlatformSpecificNavigationOptions,
    PlatformStackNavigationEventMap,
    PlatformSpecificEventMap,
    PlatformStackRouterOptions,
    PlatformStackRouterFactory,
    PlatformStackNavigationProp,
    PlatformStackRouteProp,
    PlatformStackScreenProps,
};
