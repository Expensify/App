import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import withNativeOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeOptions';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationOptionsRouteProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigatorProps} from '@libs/Navigation/PlatformStackNavigation/types';

function createPlatformStackNavigator<TStackParams extends ParamListBase>() {
    const NativeStack = createNativeStackNavigator<TStackParams>();

    function PlatformStackNavigator({screenOptions, initialRouteName, children}: PlatformStackNavigatorProps<TStackParams>) {
        const nativeScreenOptions = isRouteBasedScreenOptions(screenOptions)
            ? (props: NavigationOptionsRouteProps<TStackParams>) => {
                  const routeBasedScreenOptions = screenOptions(props);
                  return withNativeOptions(routeBasedScreenOptions);
              }
            : withNativeOptions(screenOptions);

        return (
            <NativeStack.Navigator
                screenOptions={nativeScreenOptions}
                initialRouteName={initialRouteName}
            >
                {children}
            </NativeStack.Navigator>
        );
    }

    return createNavigatorFactory<StackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof PlatformStackNavigator>(
        PlatformStackNavigator,
    )<TStackParams>();
}

export default createPlatformStackNavigator;
