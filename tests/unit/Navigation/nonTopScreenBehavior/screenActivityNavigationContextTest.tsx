import {act, render, screen} from '@testing-library/react-native';

import DisplayContentsView from '@components/DisplayContentsView';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';

import CONST from '@src/CONST';

import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

const HOST = 'Host';
const INNER = 'Inner';
const RHP = 'RHP';

type RootParamList = {
    [HOST]: undefined;
    [RHP]: undefined;
};

type InnerParamList = {
    [INNER]: undefined;
};

const RootStack = createPlatformStackNavigator<RootParamList>();
const InnerStack = createPlatformStackNavigator<InnerParamList>();
const testNavigationRef = createNavigationContainerRef<RootParamList>();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

function InnerScreen() {
    return <View testID="inner-content" />;
}

function InnerNavigator() {
    return (
        <InnerStack.Navigator>
            <InnerStack.Screen
                name={INNER}
                component={InnerScreen}
                options={{nonTopScreenBehavior: 'activity'}}
            />
        </InnerStack.Navigator>
    );
}

function RHPScreen() {
    return <View testID="rhp-content" />;
}

function getInnerActivityWrapper() {
    let node: ReturnType<typeof screen.getByTestId> | null = screen.getByTestId('inner-content', {includeHiddenElements: true});
    while (node) {
        if (node.type === ScreenActivityWrapper) {
            return node;
        }
        node = node.parent;
    }
    throw new Error('Inner screen was not wrapped with ScreenActivityWrapper');
}

function findDisplayContentsView(node: ReturnType<typeof screen.getByTestId>): ReturnType<typeof screen.getByTestId> | undefined {
    for (const child of node.children) {
        if (typeof child === 'string') {
            continue;
        }
        if (child.type === DisplayContentsView) {
            return child;
        }
        const nestedDisplayContentsView = findDisplayContentsView(child);
        if (nestedDisplayContentsView) {
            return nestedDisplayContentsView;
        }
    }
    return undefined;
}

// The cover state is read from the wrapper's own DisplayContentsView, because a stack hides its non-top screens
// from accessibility on its own and an assertion on the rendered content would pass without the wrapper doing
// anything.
function getInnerScreenCoveredState() {
    const displayContentsView = findDisplayContentsView(getInnerActivityWrapper());
    const inert: unknown = displayContentsView?.props.inert;
    if (typeof inert !== 'boolean') {
        throw new Error('ScreenActivityWrapper did not render DisplayContentsView with an inert state');
    }
    return inert;
}

beforeEach(() => {
    jest.clearAllMocks();
    mockedUseResponsiveLayout.mockReturnValue(CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE);
});

describe('ScreenActivityWrapper navigation context', () => {
    // The inner navigator holds a single screen, so its own blur state can never turn on and the assertions below
    // pin the cover state to the navigation context of the route that hosts the whole navigator.
    it('covers the top screen of a navigator that lost focus to a route above it', () => {
        render(
            <NavigationContainer ref={testNavigationRef}>
                <RootStack.Navigator initialRouteName={HOST}>
                    <RootStack.Screen
                        name={HOST}
                        component={InnerNavigator}
                        options={{nonTopScreenBehavior: 'none'}}
                    />
                    <RootStack.Screen
                        name={RHP}
                        component={RHPScreen}
                        options={{nonTopScreenBehavior: 'none'}}
                    />
                </RootStack.Navigator>
            </NavigationContainer>,
        );

        expect(getInnerActivityWrapper().props.isScreenBlurred).toBe(false);
        expect(getInnerScreenCoveredState()).toBe(false);

        act(() => testNavigationRef.navigate(RHP));

        expect(screen.getByTestId('rhp-content')).toBeOnTheScreen();
        expect(getInnerActivityWrapper().props.isScreenBlurred).toBe(false);
        expect(getInnerScreenCoveredState()).toBe(true);
    });
});
