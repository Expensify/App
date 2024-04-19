import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NativeStackView} from '@react-navigation/native-stack';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackScreenOptionsWithoutNavigation,
} from '@libs/Navigation/PlatformStackNavigation/types';
import CustomRouter from './CustomRouter';
import type {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';
import useCommonLogic from './useCommonLogic';

function createCustomStackNavigator<TStackParams extends ParamListBase>() {
    function ResponsiveStackNavigator(props: ResponsiveStackNavigatorProps) {
        const styles = useThemeStyles();

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

        const {stateToRender, searchRoute} = useCommonLogic(state);

        return (
            <NavigationContent>
                <NativeStackView
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    state={stateToRender}
                    descriptors={descriptors}
                    navigation={navigation}
                />
                {searchRoute && <View style={styles.dNone}>{descriptors[searchRoute.key].render()}</View>}
            </NavigationContent>
        );
    }
    ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

    const transformScreenProps = <RouteName extends keyof TStackParams>(screenOptions: PlatformStackScreenOptionsWithoutNavigation<TStackParams, RouteName>) =>
        withNativeNavigationOptions<TStackParams, RouteName>(screenOptions);

    return createNavigatorFactory<
        PlatformStackNavigationState<TStackParams>,
        PlatformStackNavigationOptions,
        PlatformStackNavigationEventMap,
        typeof ResponsiveStackNavigator,
        NativeStackNavigationOptions
    >(ResponsiveStackNavigator)<TStackParams>(transformScreenProps);
}

export default createCustomStackNavigator;
