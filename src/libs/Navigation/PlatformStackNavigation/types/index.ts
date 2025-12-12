import type {
    DefaultNavigatorOptions,
    EventMapBase,
    NavigationListBase,
    NavigationProp,
    ParamListBase,
    RouteProp,
    RouterFactory,
    ScreenOptionsOrCallback,
    StackNavigationState,
    StackRouterOptions,
} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type CommonProperties from '@src/types/utils/CommonProperties';
import type {PlatformStackNavigationOptions} from './NavigationOptions';

// Represents the navigation state type for a platform-specific stack.
type PlatformStackNavigationState<ParamList extends ParamListBase> = StackNavigationState<ParamList>;

// Common event map merged from both stack and native-stack navigations.
type CommonStackNavigationEventMap = CommonProperties<StackNavigationEventMap, NativeStackNavigationEventMap>;

// Represents the event map that can be used in the PlatformStackNavigation (only common events).
type PlatformStackNavigationEventMap = CommonStackNavigationEventMap;

// Used to represent platform-specific event maps.
type PlatformSpecificEventMap = StackNavigationOptions | NativeStackNavigationOptions;

// Router options used in the PlatformStackNavigation
type PlatformStackRouterOptions = StackRouterOptions & {parentRoute?: RouteProp<ParamListBase>};

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
    ParamList extends ParamListBase = ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList,
    NavigatorID extends string | undefined = undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
    NavigationPropType extends PlatformStackNavigationProp<ParamList, RouteName, NavigatorID> | any = PlatformStackNavigationProp<ParamList, RouteName, NavigatorID>,
> = {
    route: PlatformStackRouteProp<ParamList, RouteName>;
    navigation: NavigationPropType;
};

// Props to configure the the PlatformStackNavigator
type PlatformStackNavigatorProps<ParamList extends ParamListBase, RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions> = DefaultNavigatorOptions<
    ParamList,
    string | undefined,
    PlatformStackNavigationState<ParamList>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap & EventMapBase,
    NavigationListBase<ParamList>
> &
    RouterOptions &
    StackNavigationOptions & {
        persistentScreens?: Array<Extract<keyof ParamList, string>>;
        defaultCentralScreen?: Extract<keyof ParamList, string>;
        sidebarScreen?: Extract<keyof ParamList, string>;
    };

// The "screenOptions" and "defaultScreenOptions" can either be an object of navigation options or
// a factory function that returns the navigation options based on route and navigation props.
// These types are used to represent the screen options and their factory functions.
function isRouteBasedScreenOptions<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList>(
    screenOptions: ScreenOptionsOrCallback<PlatformStackNavigationOptions, ParamList, RouteName> | undefined,
): screenOptions is (props: PlatformStackScreenProps<ParamList, RouteName>) => PlatformStackNavigationOptions {
    return typeof screenOptions === 'function';
}

export {isRouteBasedScreenOptions};

export type {
    PlatformStackNavigationState,
    PlatformStackNavigationEventMap,
    PlatformSpecificEventMap,
    PlatformStackRouterOptions,
    PlatformStackRouterFactory,
    PlatformStackNavigationProp,
    PlatformStackRouteProp,
    PlatformStackScreenProps,
    PlatformStackNavigatorProps,
};

// eslint-disable-next-line @typescript-eslint/consistent-type-exports
export * from './NavigationBuilder';
// eslint-disable-next-line @typescript-eslint/consistent-type-exports
export * from './NavigationOptions';
// eslint-disable-next-line @typescript-eslint/consistent-type-exports
export * from './NavigatorComponent';
