import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React, {useRef} from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CustomRouter from './CustomRouter';
import type {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';

function ResponsiveStackNavigator(props: ResponsiveStackNavigatorProps) {
    const {isSmallScreenWidth} = useWindowDimensions();

    const isSmallScreenWidthRef = useRef(isSmallScreenWidth);

    isSmallScreenWidthRef.current = isSmallScreenWidth;

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

ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory<StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap, typeof ResponsiveStackNavigator>(ResponsiveStackNavigator);
