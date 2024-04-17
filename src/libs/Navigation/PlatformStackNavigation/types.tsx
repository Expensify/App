import type {DefaultNavigatorOptions, ParamListBase, RouteProp, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type {StackNavigationConfig} from '@react-navigation/stack/lib/typescript/src/types';

type CommonStackNavigationOptions = StackNavigationOptions & NativeStackNavigationOptions;
type CommonStackNavigationEventMap = StackNavigationEventMap & NativeStackNavigationEventMap;

type PlatformStackNavigationOptions = Omit<CommonStackNavigationOptions, 'animation'> & {
    animation?: 'slide_from_left' | 'slide_from_right' | 'modal';
};
type PlatformStackNavigationEventMap = CommonStackNavigationEventMap;

type PlatformStackNavigatorProps<TStackParams extends ParamListBase> = DefaultNavigatorOptions<
    TStackParams,
    StackNavigationState<TStackParams>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
> &
    StackRouterOptions &
    StackNavigationConfig;

type PlatformStackNavigator<TStackParams extends ParamListBase> = (props: PlatformStackNavigatorProps<TStackParams>) => React.ReactElement;

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
    PlatformStackNavigatorProps,
    PlatformStackNavigator,
    NavigationOptionsRouteProps,
};
