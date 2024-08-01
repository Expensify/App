import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import navigationRef from '@libs/Navigation/navigationRef';
import CustomFullScreenRouter from './CustomFullScreenRouter';
import type {FullScreenNavigatorProps, FullScreenNavigatorRouterOptions} from './types';

function CustomFullScreenNavigator(props: FullScreenNavigatorProps) {
    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        StackNavigationState<ParamListBase>,
        FullScreenNavigatorRouterOptions,
        StackActionHelpers<ParamListBase>,
        StackNavigationOptions,
        StackNavigationEventMap
    >(CustomFullScreenRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
    });

    const {isSmallScreenWidth} = useWindowDimensions();

    useEffect(() => {
        if (!navigationRef.isReady()) {
            return;
        }
        // We need to separately reset state of this navigator to trigger getRehydratedState.
        navigation.reset(navigation.getState());
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isSmallScreenWidth]);

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

CustomFullScreenNavigator.displayName = 'CustomFullScreenNavigator';

export default createNavigatorFactory<StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap, typeof CustomFullScreenNavigator>(CustomFullScreenNavigator);
