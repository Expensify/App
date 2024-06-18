import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import SplitRouter from './SplitRouter';
import type {SplitNavigatorProps, SplitNavigatorRouterOptions} from './types';
import useNavigationReset from './useNavigationReset';
import usePrepareSplitNavigatorChildren from './usePrepareSplitNavigatorChildren';

function SplitNavigator<ParamList extends ParamListBase>(props: SplitNavigatorProps<ParamList>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const screenOptions = getRootNavigatorScreenOptions(shouldUseNarrowLayout, styles, StyleUtils);

    const children = usePrepareSplitNavigatorChildren(props.children, props.sidebarScreen, screenOptions.homeScreen);

    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        StackNavigationState<ParamListBase>,
        SplitNavigatorRouterOptions,
        StackActionHelpers<ParamListBase>,
        StackNavigationOptions,
        StackNavigationEventMap
    >(SplitRouter, {
        children,
        screenOptions: screenOptions.centralPaneNavigator,
        initialRouteName: props.initialRouteName,
        sidebarScreen: props.sidebarScreen,
        initialCentralPaneScreen: props.initialCentralPaneScreen,
    });

    useNavigationReset(navigation, shouldUseNarrowLayout);

    return (
        <FocusTrapForScreens>
            <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout)}>
                <NavigationContent>
                    <StackView
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        state={state}
                        descriptors={descriptors}
                        navigation={navigation}
                    />
                </NavigationContent>
            </View>
        </FocusTrapForScreens>
    );
}

SplitNavigator.displayName = 'SplitNavigator';

export default function <ParamList extends ParamListBase>() {
    return createNavigatorFactory<StackNavigationState<ParamList>, StackNavigationOptions, StackNavigationEventMap, React.ComponentType<SplitNavigatorProps<ParamList>>>(
        SplitNavigator,
    )<ParamList>();
}
