import type {DefaultNavigatorOptions, NavigationProp, ParamListBase, RouteProp, StackActionHelpers, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type {StackNavigationConfig} from '@react-navigation/stack/lib/typescript/src/types';

type CommonStackNavigationOptions = StackNavigationOptions & NativeStackNavigationOptions;
type PlatformStackNavigationOptions = Omit<CommonStackNavigationOptions, 'animation'> & {
    animation?: 'slide_from_left' | 'slide_from_right' | 'modal';
};

type CommonStackNavigationEventMap = StackNavigationEventMap & NativeStackNavigationEventMap;
type PlatformStackNavigationEventMap = CommonStackNavigationEventMap;

type PlatformStackScreenProps<TStackParams extends ParamListBase, RouteName extends keyof TStackParams = keyof TStackParams, NavigatorID extends string | undefined = undefined> = {
    navigation: NavigationProp<TStackParams, RouteName, NavigatorID, StackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap> &
        StackActionHelpers<TStackParams>;
    route: RouteProp<TStackParams, RouteName>;
};

type PlatformStackNavigatorProps<TStackParams extends ParamListBase> = DefaultNavigatorOptions<
    TStackParams,
    StackNavigationState<TStackParams>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
> &
    StackRouterOptions &
    StackNavigationConfig;

type NavigationOptionsRouteProps<TStackParams extends ParamListBase> = {
    route: RouteProp<TStackParams>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigation: any;
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
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap,
    PlatformStackScreenProps,
    PlatformStackNavigatorProps,
    NavigationOptionsRouteProps,
};
