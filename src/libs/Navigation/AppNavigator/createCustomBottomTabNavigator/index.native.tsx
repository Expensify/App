import type {DefaultNavigatorOptions, ParamListBase, StackActionHelpers, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import {createNavigatorFactory, StackRouter, useNavigationBuilder} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NativeStackView} from '@react-navigation/native-stack';
import type {StackNavigationEventMap} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationStateRoute} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import BottomTabBar from './BottomTabBar';

type CustomNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, PlatformStackNavigationOptions, StackNavigationEventMap> & {
    initialRouteName: string;
};

function getStateToRender(state: StackNavigationState<ParamListBase>): StackNavigationState<ParamListBase> {
    const routesToRender = [state.routes.at(-1)] as NavigationStateRoute[];

    // We need to render at least one HOME screen to make sure everything load properly. This may be not necessary after changing how IS_SIDEBAR_LOADED is handled.
    // Currently this value will be switched only after the first HOME screen is rendered.
    if (routesToRender[0].name !== SCREENS.HOME) {
        const routeToRender = state.routes.find((route) => route.name === SCREENS.HOME);
        if (routeToRender) {
            routesToRender.unshift(routeToRender);
        }
    }

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}

function createCustomBottomTabNavigator<TStackParams extends ParamListBase>() {
    function CustomBottomTabNavigator({initialRouteName, children, screenOptions, ...props}: CustomNavigatorProps) {
        const nativeScreenOptions = withNativeNavigationOptions(screenOptions);

        const {state, navigation, descriptors, NavigationContent} = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            StackRouterOptions,
            StackActionHelpers<ParamListBase>,
            NativeStackNavigationOptions,
            NativeStackNavigationEventMap
        >(StackRouter, {
            children,
            screenOptions: nativeScreenOptions,
            initialRouteName,
        });

        const styles = useThemeStyles();
        const stateToRender = getStateToRender(state);

        return (
            <ScreenWrapper
                testID={CustomBottomTabNavigator.displayName}
                shouldShowOfflineIndicator={false}
            >
                <View style={styles.flex1}>
                    <NavigationContent>
                        <NativeStackView
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...props}
                            state={stateToRender}
                            descriptors={descriptors}
                            navigation={navigation}
                        />
                    </NavigationContent>
                    <BottomTabBar />
                </View>
            </ScreenWrapper>
        );
    }

    CustomBottomTabNavigator.displayName = 'CustomBottomTabNavigator';

    return createNavigatorFactory<PlatformStackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof CustomBottomTabNavigator>(
        CustomBottomTabNavigator,
    );
}

export default createCustomBottomTabNavigator;
