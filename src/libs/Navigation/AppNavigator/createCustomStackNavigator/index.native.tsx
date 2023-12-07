import {createNavigatorFactory, ParamListBase, RouterFactory, StackActionHelpers, StackNavigationState, useNavigationBuilder} from '@react-navigation/native';
import {StackNavigationEventMap, StackNavigationOptions, StackView} from '@react-navigation/stack';
import React, {useRef} from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomRouterFactory<ParamList extends ParamListBase> = RouterFactory<StackNavigationState<ParamList>, any, ResponsiveStackNavigatorRouterOptions>;

function ResponsiveStackNavigatorFactory<ParamList extends ParamListBase>(customRouter: CustomRouterFactory<ParamList>) {
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
        >(customRouter, {
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
    return ResponsiveStackNavigator;
}

export default <ParamList extends ParamListBase>(customRouter: CustomRouterFactory<ParamList>) =>
    createNavigatorFactory<StackNavigationState<ParamList>, StackNavigationOptions, StackNavigationEventMap, (props: ResponsiveStackNavigatorProps) => React.JSX.Element>(
        ResponsiveStackNavigatorFactory(customRouter),
    )();
