import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import {NativeStackView} from '@react-navigation/native-stack';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import React, {useRef} from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CustomRouter from './CustomRouter';
import type {ResponsiveNativeStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';

function ResponsiveStackNavigator(props: ResponsiveNativeStackNavigatorProps) {
    const {isSmallScreenWidth} = useWindowDimensions();

    const isSmallScreenWidthRef = useRef(isSmallScreenWidth);

    isSmallScreenWidthRef.current = isSmallScreenWidth;

    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        StackNavigationState<ParamListBase>,
        ResponsiveStackNavigatorRouterOptions,
        StackActionHelpers<ParamListBase>,
        NativeStackNavigationOptions,
        NativeStackNavigationEventMap
    >(CustomRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
    });

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

ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory<StackNavigationState<ParamListBase>, NativeStackNavigationOptions, NativeStackNavigationEventMap, typeof ResponsiveStackNavigator>(
    ResponsiveStackNavigator,
);
