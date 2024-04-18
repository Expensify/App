import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {createStackNavigator} from '@react-navigation/stack';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {
    CommonStackNavigationOptions,
    NavigationOptionsRouteProps,
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigatorProps,
} from '@libs/Navigation/PlatformStackNavigation/types';

const withPolyfills = (screenOptions?: PlatformStackNavigationOptions): StackNavigationOptions => {
    if (screenOptions === undefined) {
        return {};
    }

    const commonScreenOptions = (({animation, ...rest}) => rest)(screenOptions) satisfies CommonStackNavigationOptions;

    return commonScreenOptions;
};

function createPlatformStackNavigator<TStackParams extends ParamListBase>() {
    const Stack = createStackNavigator<TStackParams>();

    function PlatformStackNavigator({screenOptions, initialRouteName, children}: PlatformStackNavigatorProps<TStackParams>) {
        const webScreenOptions = isRouteBasedScreenOptions(screenOptions)
            ? (props: NavigationOptionsRouteProps<TStackParams>) => {
                  const routeBasedScreenOptions = screenOptions(props);
                  return withPolyfills(routeBasedScreenOptions);
              }
            : withPolyfills(screenOptions);
        return (
            <Stack.Navigator
                screenOptions={webScreenOptions}
                initialRouteName={initialRouteName}
            >
                {children}
            </Stack.Navigator>
        );
    }

    return createNavigatorFactory<StackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof PlatformStackNavigator>(
        PlatformStackNavigator,
    )<TStackParams>();
}

export default createPlatformStackNavigator;
