import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {isFullScreenRoute} from '@libs/NavigationUtils';
import CustomRouter from './CustomRouter';
import type {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';

function getStateToRender(state: StackNavigationState<ParamListBase>): StackNavigationState<ParamListBase> {
    // @ts-expect-error TODO: Fix this utility function types.
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenRoute(route));
    const routes = state.routes.slice(Math.max(0, lastSplitIndex - 1), state.routes.length);

    return {
        ...state,
        routes,
        index: routes.length - 1,
    };
}

function ResponsiveStackNavigator(props: ResponsiveStackNavigatorProps) {
    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        StackNavigationState<ParamListBase>,
        ResponsiveStackNavigatorRouterOptions,
        StackActionHelpers<ParamListBase>,
        StackNavigationOptions,
        StackNavigationEventMap
    >(CustomRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
    });

    const stateToRender = useMemo(() => getStateToRender(state), [state]);

    return (
        <NavigationContent>
            <StackView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                state={stateToRender}
                descriptors={descriptors}
                navigation={navigation}
            />
        </NavigationContent>
    );
}

ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory<StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap, typeof ResponsiveStackNavigator>(ResponsiveStackNavigator);
