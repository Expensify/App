import type {ParamListBase, StackActionHelpers, StackRouterOptions} from '@react-navigation/native';
import {createNavigatorFactory, StackRouter, useNavigationBuilder} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NativeStackView} from '@react-navigation/native-stack';
import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import BottomTabBar from './BottomTabBar';
import type CustomBottomTabNavigatorProps from './types';
import {defaultScreenOptions, getStateToRender} from './utils';

function createCustomBottomTabNavigator<TStackParams extends ParamListBase>() {
    function CustomBottomTabNavigator({initialRouteName, children, screenOptions, ...props}: CustomBottomTabNavigatorProps) {
        const nativeScreenOptions = withNativeNavigationOptions(screenOptions, defaultScreenOptions);

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
    )<TStackParams>();
}

export default createCustomBottomTabNavigator;
