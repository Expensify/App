import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import {NativeStackView} from '@react-navigation/native-stack';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import React, {useRef} from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import CustomRouter from './CustomRouter';
import type {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';

function createCustomStackNavigator<TStackParams extends ParamListBase>() {
    function ResponsiveStackNavigator(props: ResponsiveStackNavigatorProps) {
        const {isSmallScreenWidth} = useWindowDimensions();
        const isSmallScreenWidthRef = useRef(isSmallScreenWidth);
        isSmallScreenWidthRef.current = isSmallScreenWidth;

        const nativeScreenOptions = withNativeNavigationOptions(props.screenOptions);

        const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            ResponsiveStackNavigatorRouterOptions,
            StackActionHelpers<ParamListBase>,
            NativeStackNavigationOptions,
            NativeStackNavigationEventMap
        >(CustomRouter, {
            children: props.children,
            screenOptions: nativeScreenOptions,
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

    return createNavigatorFactory<StackNavigationState<ParamListBase>, NativeStackNavigationOptions, NativeStackNavigationEventMap, typeof ResponsiveStackNavigator>(
        ResponsiveStackNavigator,
    )<TStackParams>();
}

export default createCustomStackNavigator;
