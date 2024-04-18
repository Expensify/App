import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import withWebNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withWebNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackNavigatorProps,
} from '@libs/Navigation/PlatformStackNavigation/types';

function createPlatformStackNavigator<TStackParams extends ParamListBase>() {
    const Stack = createStackNavigator<TStackParams>();

    function PlatformStackNavigator({screenOptions, children, ...props}: PlatformStackNavigatorProps<TStackParams>) {
        const webScreenOptions = withWebNavigationOptions(screenOptions);

        return (
            <Stack.Navigator
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                screenOptions={webScreenOptions}
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
