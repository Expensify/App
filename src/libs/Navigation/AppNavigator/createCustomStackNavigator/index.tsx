import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import withWebNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withWebNavigationOptions';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import CustomRouter from './CustomRouter';
import type {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';
import useCommonLogic from './useCommonLogic';

function createCustomStackNavigator<TStackParams extends ParamListBase>() {
    function ResponsiveStackNavigator(props: ResponsiveStackNavigatorProps) {
        const styles = useThemeStyles();

        const webScreenOptions = withWebNavigationOptions(props.screenOptions);

        const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            ResponsiveStackNavigatorRouterOptions,
            StackActionHelpers<ParamListBase>,
            StackNavigationOptions,
            StackNavigationEventMap
        >(CustomRouter, {
            children: props.children,
            screenOptions: webScreenOptions,
            initialRouteName: props.initialRouteName,
        });

        const {stateToRender, searchRoute} = useCommonLogic(state);

        return (
            <NavigationContent>
                <StackView
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

    return createNavigatorFactory<PlatformStackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof ResponsiveStackNavigator>(
        ResponsiveStackNavigator,
    )<TStackParams>();
}

export default createCustomStackNavigator;
