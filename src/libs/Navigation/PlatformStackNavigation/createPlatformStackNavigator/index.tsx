import {createNavigatorFactory, StackRouter, useNavigationBuilder} from '@react-navigation/native';
import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React from 'react';
import withWebNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withWebNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationRouterOptions,
    PlatformStackNavigationState,
    PlatformStackNavigatorProps,
    PlatformStackScreenOptionsWithoutNavigation,
} from '@libs/Navigation/PlatformStackNavigation/types';

function PlatformStackNavigator({id, initialRouteName, screenOptions, screenListeners, children, ...props}: PlatformStackNavigatorProps<ParamListBase>) {
    const webScreenOptions = withWebNavigationOptions(screenOptions);

    const transformScreenProps = <ParamList2 extends ParamListBase, RouteName extends keyof ParamList2>(options: PlatformStackScreenOptionsWithoutNavigation<ParamList2, RouteName>) =>
        withWebNavigationOptions<ParamList2, RouteName>(options);

    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        PlatformStackNavigationState<ParamListBase>,
        PlatformStackNavigationRouterOptions,
        StackActionHelpers<ParamListBase>,
        PlatformStackNavigationOptions,
        StackNavigationEventMap,
        StackNavigationOptions
    >(
        StackRouter,
        {
            id,
            children,
            screenOptions: webScreenOptions,
            screenListeners,
            initialRouteName,
        },
        transformScreenProps,
    );

    return (
        <NavigationContent>
            <StackView
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
