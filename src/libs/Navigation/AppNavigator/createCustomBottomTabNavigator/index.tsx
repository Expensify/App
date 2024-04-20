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
    PlatformStackScreenOptionsWithoutNavigation,
} from '@libs/Navigation/PlatformStackNavigation/types';
import BottomTabBar from './BottomTabBar';
import type CustomBottomTabNavigatorProps from './types';
import {defaultScreenOptions, getStateToRender} from './utils';

function createCustomBottomTabNavigator<ParamList extends ParamListBase>() {
    function CustomBottomTabNavigator({id, initialRouteName, children, screenOptions, screenListeners, ...props}: CustomBottomTabNavigatorProps) {
        const webScreenOptions = withWebNavigationOptions(screenOptions, defaultScreenOptions);

        const transformScreenProps = <ParamList2 extends ParamListBase, RouteName extends keyof ParamList2>(options: PlatformStackScreenOptionsWithoutNavigation<ParamList2, RouteName>) =>
            withWebNavigationOptions<ParamList2, RouteName>(options);

        const {state, navigation, descriptors, NavigationContent} = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            PlatformStackNavigationRouterOptions,
            StackActionHelpers<ParamListBase>,
            PlatformStackNavigationOptions,
            StackNavigationEventMap,
            StackNavigationOptions
        >(
            StackRouter,
            {
                id,
                children,
                screenOptions: webScreenOptions,
                screenListeners,
                initialRouteName,
            },
            transformScreenProps,
        );

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

    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof CustomBottomTabNavigator>(
        CustomBottomTabNavigator,
    )<ParamList>();
}

export default createCustomBottomTabNavigator;
