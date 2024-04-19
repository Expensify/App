import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {createNavigatorFactory, StackRouter, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import withWebNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withWebNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationRouterOptions,
    PlatformStackNavigationState,
} from '@libs/Navigation/PlatformStackNavigation/types';
import BottomTabBar from './BottomTabBar';
import type CustomBottomTabNavigatorProps from './types';
import {defaultScreenOptions, getStateToRender} from './utils';

function createCustomBottomTabNavigator<TStackParams extends ParamListBase>() {
    function CustomBottomTabNavigator({initialRouteName, children, screenOptions, ...props}: CustomBottomTabNavigatorProps) {
        const webScreenOptions = withWebNavigationOptions(screenOptions, defaultScreenOptions);

        const {state, navigation, descriptors, NavigationContent} = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            PlatformStackNavigationRouterOptions,
            StackActionHelpers<ParamListBase>,
            StackNavigationOptions,
            StackNavigationEventMap
        >(StackRouter, {
            children,
            screenOptions: webScreenOptions,
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
                        <StackView
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
    )<TStackParams>();
}

export default createCustomBottomTabNavigator;
