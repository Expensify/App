import {createNavigatorFactory, StackRouter, useNavigationBuilder} from '@react-navigation/native';
import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NativeStackView} from '@react-navigation/native-stack';
import React from 'react';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationRouterOptions,
    PlatformStackNavigationState,
    PlatformStackNavigatorProps,
    PlatformStackScreenOptionsWithoutNavigation,
} from '@libs/Navigation/PlatformStackNavigation/types';

function PlatformStackNavigator({id, initialRouteName, screenOptions, screenListeners, children, ...props}: PlatformStackNavigatorProps<ParamListBase>) {
    const nativeScreenOptions = withNativeNavigationOptions(screenOptions);

    const transformScreenProps = <ParamList2 extends ParamListBase, RouteName extends keyof ParamList2>(options: PlatformStackScreenOptionsWithoutNavigation<ParamList2, RouteName>) =>
        withNativeNavigationOptions<ParamList2, RouteName>(options);

    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        PlatformStackNavigationState<ParamListBase>,
        PlatformStackNavigationRouterOptions,
        StackActionHelpers<ParamListBase>,
        PlatformStackNavigationOptions,
        NativeStackNavigationEventMap,
        NativeStackNavigationOptions
    >(
        StackRouter,
        {
            id,
            children,
            screenOptions: nativeScreenOptions,
            screenListeners,
            initialRouteName,
        },
        transformScreenProps,
    );

    return (
        <NavigationContent>
            <NativeStackView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                state={state}
                descriptors={descriptors}
                navigation={navigation}
            />
        </NavigationContent>
    );
}
PlatformStackNavigator.displayName = 'PlatformStackNavigator';

function createPlatformStackNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof PlatformStackNavigator>(
        PlatformStackNavigator,
    )<ParamList>();
}

export default createPlatformStackNavigator;
