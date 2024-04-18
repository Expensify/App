import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackNavigatorProps,
} from '@libs/Navigation/PlatformStackNavigation/types';

function createPlatformStackNavigator<TStackParams extends ParamListBase>() {
    const Stack = createNativeStackNavigator<TStackParams>();

    function PlatformStackNavigator({screenOptions, children, ...props}: PlatformStackNavigatorProps<TStackParams>) {
        const nativeScreenOptions = withNativeNavigationOptions(screenOptions);

        return (
            <Stack.Navigator
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                screenOptions={nativeScreenOptions}
            >
                {children}
            </Stack.Navigator>
        );
    }

    return createNavigatorFactory<PlatformStackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof PlatformStackNavigator>(
        PlatformStackNavigator,
    )<TStackParams>();
}

export default createPlatformStackNavigator;
