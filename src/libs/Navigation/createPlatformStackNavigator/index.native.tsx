import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigator, PlatformStackNavigatorProps} from './types';

function createPlatformStackNavigator<TStackParams extends ParamListBase>() {
    const NativeStack = createNativeStackNavigator<TStackParams>();
    function PlatformStackNavigator({screenOptions, initialRouteName, children}: PlatformStackNavigatorProps<TStackParams>) {
        return (
            <NativeStack.Navigator
                screenOptions={screenOptions}
                initialRouteName={initialRouteName}
            >
                {children}
            </NativeStack.Navigator>
        );
    }

    return createNavigatorFactory<StackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, PlatformStackNavigator<TStackParams>>(
        PlatformStackNavigator,
    )();
}

export default createPlatformStackNavigator;
