import React, {useRef} from 'react';
import {useNavigationBuilder, createNavigatorFactory, ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {StackNavigationEventMap, StackNavigationOptions, StackView} from '@react-navigation/stack';
import CustomRouter from './CustomRouter';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from '../types';
import type {WindowDimensions} from '../../../../styles/getModalStyles';

function ResponsiveStackNavigator(props: ResponsiveStackNavigatorProps) {
    // TODO: remove type assertion when useWindowDimensions is migrated to TS
    const {isSmallScreenWidth} = useWindowDimensions() as WindowDimensions;

    const isSmallScreenWidthRef = useRef<boolean>(isSmallScreenWidth);

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
        // Options for useNavigationBuilder won't update on prop change, so we need to pass a getter for the router to have the current state of isSmallScreenWidth.
        getIsSmallScreenWidth: () => isSmallScreenWidthRef.current,
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
