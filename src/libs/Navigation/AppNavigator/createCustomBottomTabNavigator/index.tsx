import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import React from 'react';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import BottomTabBar from './BottomTabBar';
import BottomTabNavigationContentWrapper from './BottomTabNavigationContentWrapper';
import transformState from './transformState';

const defaultScreenOptions: PlatformStackNavigationOptions = {
    animation: 'none',
};

const CustomBottomTabNavigatorComponent = createPlatformStackNavigatorComponent('CustomBottomTabNavigator', {
    transformState,
    defaultScreenOptions,
    NavigationContentWrapper: BottomTabNavigationContentWrapper,
    ExtraContent: ({stateToRender}) => {
        const selectedTab = stateToRender.routes.at(-1)?.name;
        return <BottomTabBar selectedTab={selectedTab} />;
    },
});

function createCustomBottomTabNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof CustomBottomTabNavigatorComponent>(
        CustomBottomTabNavigatorComponent,
    )<ParamList>();
}

export default createCustomBottomTabNavigator;
