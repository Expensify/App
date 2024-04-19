import type {DefaultNavigatorOptions, NavigationProp, ParamListBase, RouteProp, StackActionHelpers, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type {StackNavigationConfig} from '@react-navigation/stack/lib/typescript/src/types';

type PlatformStackNavigationState<TStackParams extends ParamListBase> = StackNavigationState<TStackParams>;

type CommonStackNavigationOptions = StackNavigationOptions & NativeStackNavigationOptions;
type PlatformStackNavigationOptions = Omit<CommonStackNavigationOptions, 'animation'> & {
    animation?: 'slide_from_left' | 'slide_from_right' | 'modal';
};

type CommonStackNavigationEventMap = StackNavigationEventMap & NativeStackNavigationEventMap;
type PlatformStackNavigationEventMap = CommonStackNavigationEventMap;

type PlatformStackNavigationRouterOptions = StackRouterOptions;

type PlatformStackNavigatorProps<TStackParams extends ParamListBase, RouterOptions extends PlatformStackNavigationRouterOptions = StackRouterOptions> = DefaultNavigatorOptions<
    TStackParams,
    PlatformStackNavigationState<TStackParams>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
> &
    RouterOptions &
    StackNavigationConfig;

type NavigationOptionsRouteProps<TStackParams extends ParamListBase> = {
    route: RouteProp<TStackParams>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigation: any;
};

type PlatformStackNavigationProp<
    TStackParams extends ParamListBase,
    RouteName extends keyof TStackParams = keyof TStackParams,
    NavigatorID extends string | undefined = undefined,
> = NavigationProp<TStackParams, RouteName, NavigatorID, PlatformStackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap>;
type PlatformStackRouteProp<TStackParams extends ParamListBase, RouteName extends keyof TStackParams> = RouteProp<TStackParams, RouteName>;

type PlatformStackScreenProps<TStackParams extends ParamListBase, RouteName extends keyof TStackParams = keyof TStackParams, NavigatorID extends string | undefined = undefined> = {
    navigation: PlatformStackNavigationProp<TStackParams, RouteName, NavigatorID> & StackActionHelpers<TStackParams>;
    route: PlatformStackRouteProp<TStackParams, RouteName>;
};

function isRouteBasedScreenOptions<TStackParams extends ParamListBase>(
    screenOptions: PlatformStackNavigatorProps<TStackParams>['screenOptions'],
): screenOptions is (props: NavigationOptionsRouteProps<TStackParams>) => PlatformStackNavigationOptions {
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
    PlatformStackScreenProps,
    PlatformStackNavigatorProps,
    NavigationOptionsRouteProps,
};
