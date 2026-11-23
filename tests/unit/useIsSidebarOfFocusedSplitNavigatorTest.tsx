import {act, render} from '@testing-library/react-native';

import useIsSidebarOfFocusedSplitNavigator from '@hooks/useIsSidebarOfFocusedSplitNavigator';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import SCREENS from '@src/SCREENS';

import type {NavigatorScreenParams} from '@react-navigation/native';

import {createNavigationContainerRef, NavigationContainer, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';

type SplitParamList = {
    [SCREENS.WORKSPACE.INITIAL]: undefined;
    Central: undefined;
};

type RootParamList = {
    Split: NavigatorScreenParams<SplitParamList>;
    Other: undefined;
};

const RootStack = createPlatformStackNavigator<RootParamList>();
const SplitStack = createPlatformStackNavigator<SplitParamList>();
const navigationRef = createNavigationContainerRef<RootParamList>();

let sidebarReading: boolean | undefined;

function Sidebar() {
    const route = useRoute();
    const navigation = useNavigation();
    const isSidebarOfFocusedSplitNavigator = useIsSidebarOfFocusedSplitNavigator(route.name, navigation);
    useEffect(() => {
        sidebarReading = isSidebarOfFocusedSplitNavigator;
    });
    return null;
}

function EmptyScreen() {
    return null;
}

function SplitNavigator() {
    return (
        <SplitStack.Navigator initialRouteName={SCREENS.WORKSPACE.INITIAL}>
            <SplitStack.Screen
                name={SCREENS.WORKSPACE.INITIAL}
                component={Sidebar}
            />
            <SplitStack.Screen
                name="Central"
                component={EmptyScreen}
            />
        </SplitStack.Navigator>
    );
}

function renderSplitWithCentralOpen() {
    render(
        <NavigationContainer ref={navigationRef}>
            <RootStack.Navigator>
                <RootStack.Screen
                    name="Split"
                    component={SplitNavigator}
                />
                <RootStack.Screen
                    name="Other"
                    component={EmptyScreen}
                />
            </RootStack.Navigator>
        </NavigationContainer>,
    );
    act(() => {
        navigationRef.navigate('Split', {screen: 'Central'});
    });
}

describe('useIsSidebarOfFocusedSplitNavigator', () => {
    it('follows its navigator losing and regaining focus by itself, since the screen it runs in need not re-render when that happens', () => {
        // Given the workspace sidebar beside one of its pages
        renderSplitWithCentralOpen();

        // When a screen outside the workspace opens over it
        act(() => {
            navigationRef.navigate('Other');
        });

        // Then the sidebar no longer counts
        expect(sidebarReading).toBe(false);

        // When that screen closes
        act(() => {
            navigationRef.goBack();
        });

        // Then it counts again, without anything else re-rendering it
        expect(sidebarReading).toBe(true);
    });
});
