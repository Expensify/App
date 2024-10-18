import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder, useRoute} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import SplitStackRouter from './SplitStackRouter';
import type {SplitStackNavigatorProps, SplitStackNavigatorRouterOptions} from './types';
import useHandleScreenResize from './useHandleScreenResize';
import usePrepareSplitStackNavigatorChildren from './usePrepareSplitStackNavigatorChildren';
import usePreserveSplitNavigatorState from './usePreserveSplitNavigatorState';

function getStateToRender(state: StackNavigationState<ParamListBase>, isSmallScreenWidth: boolean): StackNavigationState<ParamListBase> {
    const sidebarScreenRoute = state.routes.at(0);

    if (!sidebarScreenRoute) {
        return state;
    }

    const centralScreenRoutes = state.routes.slice(1);
    const routes = isSmallScreenWidth ? state.routes.slice(-2) : [sidebarScreenRoute, ...centralScreenRoutes.slice(-2)];

    return {
        ...state,
        routes,
        index: routes.length - 1,
    };
}

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

    // We need to copy the state to the params so that the state is preserved when the root navigator unmount this route for performance reasons.
    usePreserveSplitNavigatorState(route, state);
    useHandleScreenResize(navigation);

    const stateToRender = useMemo(() => getStateToRender(state, shouldUseNarrowLayout), [state, shouldUseNarrowLayout]);

    return (
        <FocusTrapForScreens>
            <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout)}>
                <NavigationContent>
                    <StackView
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        state={stateToRender}
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
