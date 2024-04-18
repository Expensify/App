import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import withWebOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withWebOptions';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationOptionsRouteProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigatorProps} from '@libs/Navigation/PlatformStackNavigation/types';

function createPlatformStackNavigator<TStackParams extends ParamListBase>() {
    const Stack = createStackNavigator<TStackParams>();

    function PlatformStackNavigator({screenOptions, initialRouteName, children}: PlatformStackNavigatorProps<TStackParams>) {
        const webScreenOptions = isRouteBasedScreenOptions(screenOptions)
            ? (props: NavigationOptionsRouteProps<TStackParams>) => {
                  const routeBasedScreenOptions = screenOptions(props);
                  return withWebOptions(routeBasedScreenOptions);
              }
            : withWebOptions(screenOptions);
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
