import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import React from 'react';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import type {ExtraContentProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import BottomTabBar from './BottomTabBar';
import BottomTabNavigationContentWrapper from './BottomTabNavigationContentWrapper';
import useCustomState from './useCustomState';

const defaultScreenOptions: PlatformStackNavigationOptions = {
    animation: 'none',
};

function ExtraContent({state}: ExtraContentProps) {
    const selectedTab = state.routes.at(-1)?.name;
    return <BottomTabBar selectedTab={selectedTab} />;
}

const CustomBottomTabNavigatorComponent = createPlatformStackNavigatorComponent('CustomBottomTabNavigator', {
    useCustomState,
    defaultScreenOptions,
    NavigationContentWrapper: BottomTabNavigationContentWrapper,
    ExtraContent,
});

function createCustomBottomTabNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof CustomBottomTabNavigatorComponent>(
        CustomBottomTabNavigatorComponent,
    )<ParamList>();
}

export default createCustomBottomTabNavigator;
