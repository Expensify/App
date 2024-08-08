import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import SplitStackRouter from './SplitStackRouter';
import type {SplitStackNavigatorProps, SplitStackNavigatorRouterOptions} from './types';
import useNavigationReset from './useNavigationReset';
import usePrepareSplitStackNavigatorChildren from './usePrepareSplitStackNavigatorChildren';

function SplitStackNavigator<ParamList extends ParamListBase>(props: SplitStackNavigatorProps<ParamList>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = getRootNavigatorScreenOptions(isSmallScreenWidth, styles, StyleUtils);

    const children = usePrepareSplitStackNavigatorChildren(props.children, props.sidebarScreen, screenOptions.homeScreen);

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
        initialCentralPaneScreen: props.initialCentralPaneScreen,
    });

    useNavigationReset(navigation, isSmallScreenWidth);

    return (
        <FocusTrapForScreens>
            <View style={styles.rootNavigatorContainerStyles(isSmallScreenWidth)}>
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
