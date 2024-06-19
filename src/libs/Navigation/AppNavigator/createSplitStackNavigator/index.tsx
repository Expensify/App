import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder, useRoute} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import SplitStackRouter from './SplitStackRouter';
import type {SplitStackNavigatorProps, SplitStackNavigatorRouterOptions} from './types';
import useHandleScreenResize from './useHandleScreenResize';
import useNavigationReset from './useNavigationReset';
import usePrepareSplitStackNavigatorChildren from './usePrepareSplitStackNavigatorChildren';

function SplitStackNavigator<ParamList extends ParamListBase>(props: SplitStackNavigatorProps<ParamList>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const screenOptions = getRootNavigatorScreenOptions(shouldUseNarrowLayout, styles, StyleUtils);

    const children = usePrepareSplitStackNavigatorChildren(props.children, props.sidebarScreen, screenOptions.homeScreen);

    const route = useRoute();

    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        StackNavigationState<ParamListBase>,
        SplitStackNavigatorRouterOptions,
        StackActionHelpers<ParamListBase>,
        StackNavigationOptions,
        StackNavigationEventMap
    >(SplitStackRouter, {
        children,
        screenOptions: screenOptions.centralPaneNavigator,
        initialRouteName: props.initialRouteName,
        sidebarScreen: props.sidebarScreen,
        defaultCentralScreen: props.defaultCentralScreen,

        // @TODO figure out if we can end in a situation where the state and route are not in sync. If so, we may need to figure out a getter.
        parentRoute: route,
    });

    useHandleScreenResize(navigation);
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

SplitStackNavigator.displayName = 'SplitStackNavigator';

export default function <ParamList extends ParamListBase>() {
    return createNavigatorFactory<StackNavigationState<ParamList>, StackNavigationOptions, StackNavigationEventMap, React.ComponentType<SplitStackNavigatorProps<ParamList>>>(
        SplitStackNavigator,
    )<ParamList>();
}
