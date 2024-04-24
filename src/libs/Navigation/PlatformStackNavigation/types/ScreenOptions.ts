import type {ParamListBase} from '@react-navigation/native';
import type {PlatformStackNavigationOptions} from '.';
import type {PlatformStackScreenProps} from '.';
import type PlatformStackNavigatorProps from './PlatformStackNavigator';

// The "screenOptions" and "defaultScreenOptions" can either be an object of configuration settings or
// a factory function that returns the configuration settings based on route and navigation props.
// These types are used to represent the screen options and their factory functions.

type PlatformStackScreenOptions<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList> = PlatformStackNavigatorProps<ParamList, RouteName>['screenOptions'];

// type PlatformStackScreenOptionsWithoutNavigation<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList> =
//     | PlatformStackNavigationOptions
//     | ((props: PlatformScreenOptionsFactoryFunctionProps<ParamList, RouteName>) => PlatformStackNavigationOptions)
//     | undefined;

function isRouteBasedScreenOptions<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList>(
    screenOptions: PlatformStackScreenOptions<ParamList, RouteName>,
): screenOptions is (props: PlatformStackScreenProps<ParamList, RouteName>) => PlatformStackNavigationOptions {
    return typeof screenOptions === 'function';
}

export {isRouteBasedScreenOptions};
export type {PlatformStackScreenOptions};
