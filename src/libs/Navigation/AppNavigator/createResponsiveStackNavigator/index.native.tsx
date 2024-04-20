import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NativeStackView} from '@react-navigation/native-stack';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackScreenOptionsWithoutNavigation,
} from '@libs/Navigation/PlatformStackNavigation/types';
import CustomRouter from './CustomRouter';
import type {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';
import useStateWithSearch from './useStateWithSearch';

function ResponsiveStackNavigator({id, initialRouteName, children, screenOptions, screenListeners, ...props}: ResponsiveStackNavigatorProps) {
    const styles = useThemeStyles();

    const nativeScreenOptions = withNativeNavigationOptions(screenOptions);
    const transformScreenProps = <ParamList2 extends ParamListBase, RouteName extends keyof ParamList2>(options: PlatformStackScreenOptionsWithoutNavigation<ParamList2, RouteName>) =>
        withNativeNavigationOptions<ParamList2, RouteName>(options);

    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        PlatformStackNavigationState<ParamListBase>,
        ResponsiveStackNavigatorRouterOptions,
        StackActionHelpers<ParamListBase>,
        PlatformStackNavigationOptions,
        NativeStackNavigationEventMap,
        NativeStackNavigationOptions
    >(
        CustomRouter,
        {
            id,
            children,
            screenOptions: nativeScreenOptions,
            screenListeners,
            initialRouteName,
        },
        transformScreenProps,
    );

    const {stateToRender, searchRoute} = useStateWithSearch(state);

    return (
        <NavigationContent>
            <NativeStackView
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

function createResponsiveStackNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof ResponsiveStackNavigator>(
        ResponsiveStackNavigator,
    )<ParamList>();
}

export default createResponsiveStackNavigator;
