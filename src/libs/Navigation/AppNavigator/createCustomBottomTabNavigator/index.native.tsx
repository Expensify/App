import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {createNavigatorFactory, StackRouter, useNavigationBuilder} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NativeStackView} from '@react-navigation/native-stack';
import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationRouterOptions,
    PlatformStackNavigationState,
    PlatformStackScreenOptionsWithoutNavigation,
} from '@libs/Navigation/PlatformStackNavigation/types';
import BottomTabBar from './BottomTabBar';
import type CustomBottomTabNavigatorProps from './types';
import {defaultScreenOptions} from './utils';

function createCustomBottomTabNavigator<ParamList extends ParamListBase>() {
    function CustomBottomTabNavigator({id, initialRouteName, children, screenOptions, screenListeners, ...props}: CustomBottomTabNavigatorProps) {
        const nativeScreenOptions = withNativeNavigationOptions(screenOptions, defaultScreenOptions);

        const transformScreenProps = <ParamList2 extends ParamListBase, RouteName extends keyof ParamList2>(options: PlatformStackScreenOptionsWithoutNavigation<ParamList2, RouteName>) =>
            withNativeNavigationOptions<ParamList2, RouteName>(options);

        const {state, navigation, descriptors, NavigationContent} = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            PlatformStackNavigationRouterOptions,
            StackActionHelpers<ParamListBase>,
            PlatformStackNavigationOptions,
            NativeStackNavigationEventMap,
            NativeStackNavigationOptions
        >(
            StackRouter,
            {
                id,
                children,
                screenOptions: nativeScreenOptions,
                screenListeners,
                initialRouteName,
            },
            transformScreenProps,
        );

        const styles = useThemeStyles();

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
                            state={state}
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
