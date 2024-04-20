import {createNavigatorFactory, StackRouter, useNavigationBuilder} from '@react-navigation/native';
import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import type {NativeStackNavigationEventMap} from '@react-navigation/native-stack';
import type {StackNavigationOptions} from '@react-navigation/stack';
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

function createPlatformStackNavigator<TStackParams extends ParamListBase>() {
    function PlatformStackNavigator({screenOptions, children, ...props}: PlatformStackNavigatorProps<TStackParams>) {
        const webScreenOptions = withWebNavigationOptions(screenOptions);

        const transformScreenProps = <TStackParams2 extends ParamListBase, RouteName extends keyof TStackParams2>(
            options: PlatformStackScreenOptionsWithoutNavigation<TStackParams2, RouteName>,
        ) => withWebNavigationOptions<TStackParams2, RouteName>(options);

        const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            PlatformStackNavigationRouterOptions,
            StackActionHelpers<ParamListBase>,
            PlatformStackNavigationOptions,
            NativeStackNavigationEventMap,
            StackNavigationOptions
        >(
            StackRouter,
            {
                children: props.children,
                screenOptions: webScreenOptions,
                initialRouteName: props.initialRouteName,
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

    return createNavigatorFactory<PlatformStackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof PlatformStackNavigator>(
        PlatformStackNavigator,
    )<TStackParams>();
}

export default createPlatformStackNavigator;
