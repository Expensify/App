import type {DefaultNavigatorOptions, NavigationProp, ParamListBase, RouteProp, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type {StackNavigationConfig} from '@react-navigation/stack/lib/typescript/src/types';

type PlatformStackNavigationState<ParamList extends ParamListBase> = StackNavigationState<ParamList>;

type OmitNever<T extends Record<string, unknown>> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K];
};
type CommonProperties<A, B> = OmitNever<Pick<A & B, keyof A & keyof B>>;

type CommonStackNavigationOptions = CommonProperties<StackNavigationOptions, NativeStackNavigationOptions>;

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

type PlatformStackNavigationOptions = CommonStackNavigationOptions & GeneralPlatformStackNavigationOptions;

type CommonStackNavigationEventMap = CommonProperties<StackNavigationEventMap, NativeStackNavigationEventMap>;
type PlatformStackNavigationEventMap = CommonStackNavigationEventMap;

type PlatformStackNavigationRouterOptions = StackRouterOptions;

type PlatformStackNavigatorProps<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList,
    RouterOptions extends PlatformStackNavigationRouterOptions = PlatformStackNavigationRouterOptions,
> = DefaultNavigatorOptions<ParamList, PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, RouteName> &
    RouterOptions &
    StackNavigationConfig;

type PlatformStackNavigationProp<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList, NavigatorID extends string | undefined = undefined> = NavigationProp<
    ParamList,
    RouteName,
    NavigatorID,
    PlatformStackNavigationState<ParamList>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
>;
type PlatformStackRouteProp<ParamList extends ParamListBase, RouteName extends keyof ParamList> = RouteProp<ParamList, RouteName>;

type PlatformStackScreenOptionsProps<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList, NavigatorID extends string | undefined = undefined> = {
    route: PlatformStackRouteProp<ParamList, RouteName>;
    navigation: PlatformStackNavigationProp<ParamList, RouteName, NavigatorID>;
};

type PlatformStackScreenOptionsPropsWithoutNavigation<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList> = {
    route: PlatformStackRouteProp<ParamList, RouteName>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigation: any;
};

type PlatformStackScreenOptions<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList> = PlatformStackNavigatorProps<ParamList, RouteName>['screenOptions'];

type PlatformStackScreenOptionsWithoutNavigation<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList> =
    | PlatformStackNavigationOptions
    | ((props: PlatformStackScreenOptionsPropsWithoutNavigation<ParamList, RouteName>) => PlatformStackNavigationOptions)
    | undefined;

function isRouteBasedScreenOptions<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList>(
    screenOptions: PlatformStackScreenOptions<ParamList, RouteName>,
): screenOptions is (props: PlatformStackScreenOptionsPropsWithoutNavigation<ParamList, RouteName>) => PlatformStackNavigationOptions {
    return typeof screenOptions === 'function';
}

export {isRouteBasedScreenOptions};
export type {
    CommonStackNavigationOptions,
    CommonStackNavigationEventMap,
    PlatformStackNavigationState,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap,
    PlatformStackNavigationRouterOptions,
    PlatformStackNavigationProp,
    PlatformStackRouteProp,
    PlatformStackScreenOptions,
    PlatformStackScreenOptionsWithoutNavigation,
    PlatformStackScreenOptionsProps,
    PlatformStackScreenOptionsPropsWithoutNavigation,
    PlatformStackNavigatorProps,
};
