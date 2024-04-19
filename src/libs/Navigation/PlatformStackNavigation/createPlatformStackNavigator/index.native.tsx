import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackNavigatorProps,
    PlatformStackScreenOptionsWithoutNavigation,
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

    const transformScreenProps = <RouteName extends keyof TStackParams>(screenOptions: PlatformStackScreenOptionsWithoutNavigation<TStackParams, RouteName>) =>
        withNativeNavigationOptions<TStackParams, RouteName>(screenOptions);

    return createNavigatorFactory<
        PlatformStackNavigationState<TStackParams>,
        PlatformStackNavigationOptions,
        PlatformStackNavigationEventMap,
        typeof PlatformStackNavigator,
        NativeStackNavigationOptions
    >(PlatformStackNavigator)<TStackParams>(transformScreenProps);
}

export default createPlatformStackNavigator;
