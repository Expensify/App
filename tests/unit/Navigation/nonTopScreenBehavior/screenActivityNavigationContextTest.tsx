import {act, render, screen} from '@testing-library/react-native';

import AlwaysPaintedView from '@components/AlwaysPaintedView';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';

import CONST from '@src/CONST';

import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import findAncestorByType from '../../../utils/findAncestorByType';

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
    const wrapper = findAncestorByType(screen.getByTestId('inner-content', {includeHiddenElements: true}), [ScreenActivityWrapper]);
    if (!wrapper) {
        throw new Error('Inner screen was not wrapped with ScreenActivityWrapper');
    }
    return wrapper;
}

function findAlwaysPaintedView(node: ReturnType<typeof screen.getByTestId>): ReturnType<typeof screen.getByTestId> | undefined {
    for (const child of node.children) {
        if (typeof child === 'string') {
            continue;
        }
        if (child.type === AlwaysPaintedView) {
            return child;
        }
        const nestedAlwaysPaintedView = findAlwaysPaintedView(child);
        if (nestedAlwaysPaintedView) {
            return nestedAlwaysPaintedView;
        }
    }
    return undefined;
}

// The cover state is read from the wrapper's own AlwaysPaintedView, because a stack hides its non-top screens
// from accessibility on its own and an assertion on the rendered content would pass without the wrapper doing
// anything.
function getInnerScreenCoveredState() {
    const alwaysPaintedView = findAlwaysPaintedView(getInnerActivityWrapper());
    const inert: unknown = alwaysPaintedView?.props.inert;
    if (typeof inert !== 'boolean') {
        throw new Error('ScreenActivityWrapper did not render AlwaysPaintedView with an inert state');
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
        // Given an inner navigator that is the focused route, so its own screen starts out uncovered
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

        // When a route above the whole navigator takes focus
        act(() => testNavigationRef.navigate(RHP));

        // Then the inner screen counts as covered, because the wrapper follows the navigation context and not only its own blur state
        expect(screen.getByTestId('rhp-content')).toBeOnTheScreen();
        expect(getInnerActivityWrapper().props.isScreenBlurred).toBe(false);
        expect(getInnerScreenCoveredState()).toBe(true);
    });
});
