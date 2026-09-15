import {act, renderHook} from '@testing-library/react-native';

import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import Navigation from '@libs/Navigation/Navigation';

import createPlatformStackNavigator from '@navigation/PlatformStackNavigation/createPlatformStackNavigator';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {ReactNode} from 'react';

import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import React from 'react';

type TestParamList = {
    Bound: undefined;
    Stacked: undefined;
};

const CARD_DETAILS = DYNAMIC_ROUTES.EXPENSIFY_CARD_DETAILS.getRoute('789', 'A1B2C3D4E5F6');
const REPORT_PATH = ROUTES.REPORT_WITH_ID.getRoute('1234');

// Not one of EXPENSIFY_CARD_DETAILS.entryScreens, so a route built against it resolves to the not-found page.
const UNRELATED_PATH = ROUTES.SETTINGS_DISPLAY_NAME;

const Stack = createPlatformStackNavigator<TestParamList>();
const navigationRef = createNavigationContainerRef<TestParamList>();

function StackedScreen() {
    return null;
}

// Bound is mounted underneath Stacked from the very first render, so it never receives focus.
function UnfocusedScreenWrapper({children}: {children: ReactNode}) {
    return (
        <NavigationContainer
            ref={navigationRef}
            initialState={{
                index: 1,
                routes: [{name: 'Bound', path: REPORT_PATH}, {name: 'Stacked'}],
            }}
        >
            <Stack.Navigator>
                <Stack.Screen name="Bound">{() => children}</Stack.Screen>
                <Stack.Screen
                    name="Stacked"
                    component={StackedScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

function ScreenWrapper({children}: {children: ReactNode}) {
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator>
                <Stack.Screen name="Bound">{() => children}</Stack.Screen>
                <Stack.Screen
                    name="Stacked"
                    component={StackedScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// Bound is focused and carries the path it was matched from, like a screen cold-loaded from a deep link.
function FocusedScreenWithPathWrapper({children}: {children: ReactNode}) {
    return (
        <NavigationContainer
            ref={navigationRef}
            initialState={{
                index: 0,
                routes: [{name: 'Bound', path: REPORT_PATH}],
            }}
        >
            <Stack.Navigator>
                <Stack.Screen name="Bound">{() => children}</Stack.Screen>
                <Stack.Screen
                    name="Stacked"
                    component={StackedScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const renderOnScreen = () => renderHook(() => useScreenBoundDynamicRoute(), {wrapper: ScreenWrapper});

describe('useScreenBoundDynamicRoute', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('binds the route to the screen it was focused on', () => {
        jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(REPORT_PATH);

        const {result} = renderOnScreen();

        expect(result.current(CARD_DETAILS)).toBe(`${REPORT_PATH}/${CARD_DETAILS}`);
    });

    it('keeps the base path once another screen is stacked over it', () => {
        const getActiveRoute = jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(REPORT_PATH);

        const {result} = renderOnScreen();

        getActiveRoute.mockReturnValue(UNRELATED_PATH);
        act(() => navigationRef.navigate('Stacked'));

        const boundRoute = result.current(CARD_DETAILS);
        expect(boundRoute).toBe(`${REPORT_PATH}/${CARD_DETAILS}`);
        expect(JSON.stringify(getStateFromPath(boundRoute))).not.toContain('not-found');

        // Without the binding the suffix lands on whatever screen is active instead.
        expect(JSON.stringify(getStateFromPath(createDynamicRoute(CARD_DETAILS)))).toContain('not-found');
    });

    it('captures the whole path when the screen is itself a dynamic route', () => {
        const issueNewPath = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.path, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute('A1B2C3D4E5F6'));
        jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(issueNewPath);

        const {result} = renderOnScreen();

        expect(result.current(CARD_DETAILS)).toBe(`${issueNewPath}/${CARD_DETAILS}`);
    });

    it('stays bound when the screen re-renders', () => {
        const getActiveRoute = jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(REPORT_PATH);

        const {result, rerender} = renderOnScreen();

        getActiveRoute.mockReturnValue(UNRELATED_PATH);
        rerender({});

        expect(result.current(CARD_DETAILS)).toBe(`${REPORT_PATH}/${CARD_DETAILS}`);
    });

    it('re-binds when the screen is focused again', () => {
        const getActiveRoute = jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(REPORT_PATH);

        const {result} = renderOnScreen();

        act(() => navigationRef.navigate('Stacked'));
        const refocusedPath = ROUTES.REPORT_WITH_ID.getRoute('5678');
        getActiveRoute.mockReturnValue(refocusedPath);
        act(() => navigationRef.goBack());

        expect(result.current(CARD_DETAILS)).toBe(`${refocusedPath}/${CARD_DETAILS}`);
    });

    it('falls back to the screen route when the active route is empty because navigation is not ready yet', () => {
        // Navigation.getActiveRoute returns an empty string until the navigation container is ready.
        jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue('');

        const {result} = renderHook(() => useScreenBoundDynamicRoute(), {wrapper: FocusedScreenWithPathWrapper});

        expect(result.current(CARD_DETAILS)).toBe(`${REPORT_PATH}/${CARD_DETAILS}`);
    });

    it('falls back to the screen route when the screen mounts without ever being focused', () => {
        jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(UNRELATED_PATH);

        const {result} = renderHook(() => useScreenBoundDynamicRoute(), {wrapper: UnfocusedScreenWrapper});

        expect(result.current(CARD_DETAILS)).toBe(`${REPORT_PATH}/${CARD_DETAILS}`);
    });
});
