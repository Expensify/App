import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigator, PlatformStackNavigatorProps} from './types';

function createPlatformStackNavigator<TStackParams extends ParamListBase>() {
    const Stack = createStackNavigator<TStackParams>();
    function PlatformStackNavigator({screenOptions, initialRouteName, children}: PlatformStackNavigatorProps<TStackParams>) {
        return (
            <Stack.Navigator
                screenOptions={screenOptions}
                initialRouteName={initialRouteName}
            >
                {children}
            </Stack.Navigator>
        );
    }

    return createNavigatorFactory<StackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, PlatformStackNavigator<TStackParams>>(
        PlatformStackNavigator,
    )();
}

export default createPlatformStackNavigator;
