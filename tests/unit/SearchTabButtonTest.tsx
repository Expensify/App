import {fireEvent, render, screen} from '@testing-library/react-native';

import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import SearchTabButton from '@components/Navigation/NavigationTabBar/SearchTabButton';

import {clearSearchTabContentReady, getIsSearchTabHovered, markSearchTabContentReady, setIsSearchTabHovered} from '@libs/Navigation/helpers/searchTabPreloadStore';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {ComponentType, ReactNode} from 'react';

import React from 'react';

const mockStartSpan = jest.fn();
const mockNavigate = jest.fn();

let mockRootState: unknown;

type PressableProps = {
    accessibilityLabel: string;
    children: ReactNode | ((state: {hovered: boolean}) => ReactNode);
    onPress: () => void;
    onHoverIn?: () => void;
    onHoverOut?: () => void;
};

type ReactActual = {
    createElement: typeof React.createElement;
};

type ReactNativeActual = {
    View: ComponentType<{accessibilityLabel: string; onPress: () => void; onHoverIn?: () => void; onHoverOut?: () => void; testID: string}>;
};

jest.mock('@components/Pressable', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {View} = jest.requireActual<ReactNativeActual>('react-native');

    return {
        PressableWithFeedback: ({accessibilityLabel, onPress, onHoverIn, onHoverOut}: PressableProps) =>
            createElement(View, {
                accessibilityLabel,
                onPress,
                onHoverIn,
                onHoverOut,
                testID: 'search-tab-button',
            }),
    };
});

jest.mock('@components/Navigation/NavigationTabBar/TabBarItem', () => () => null);
jest.mock('@components/Navigation/NavigationTabBar/getLastRoute', () => () => undefined);
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({ReceiptMultiple: 'receipt-icon'})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {},
    leftNavigationTabBarItem: {},
    navigationTabBarItem: {},
    navigationTabBarItemHovered: {},
}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@libs/interceptAnonymousUser', () => (callback: () => void) => callback());
jest.mock('@libs/clearSelectedText/clearSelectedText', () => () => {});

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: () => mockRootState,
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (route: string) => {
            mockNavigate(route);
        },
    },
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    startSpan: (...args: unknown[]) => {
        mockStartSpan(...args);
        return undefined;
    },
}));

function buildRootState(preloadedRouteKeys: string[]) {
    return {
        key: 'root-state',
        index: 0,
        routes: [
            {
                key: 'tab-route',
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    key: 'tab-state',
                    index: 0,
                    preloadedRouteKeys,
                    routes: [
                        {key: 'home-route', name: SCREENS.HOME},
                        {key: 'search-route', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                    ],
                },
            },
        ],
    };
}

describe('SearchTabButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        clearSearchTabContentReady();
        setIsSearchTabHovered(false);
    });

    it.each([
        ['tags the spans of a tap that reveals a built preloaded Spend tab', ['search-route'], true, true],
        // The background build has not put content on screen yet, so the tap still builds the screen itself.
        ['does not tag a tap that lands while the preloaded tab is still building', ['search-route'], false, false],
        ['does not tag a tap that has to build the Spend tab', [], false, false],
    ])('%s', (_description: string, preloadedRouteKeys: string[], isContentReady: boolean, expectedIsPreloaded: boolean) => {
        // Given the Spend tab is or is not preloaded behind Home, with or without its first content on screen
        mockRootState = buildRootState(preloadedRouteKeys);
        if (isContentReady) {
            markSearchTabContentReady();
        }
        render(
            <SearchTabButton
                selectedTab={NAVIGATION_TABS.HOME}
                isWideLayout
            />,
        );

        // When the user taps the Spend tab
        fireEvent.press(screen.getByTestId('search-tab-button'));

        // Then every navigate-to-Reports span carries whether the tap only revealed an already built screen, so dashboards
        // can tell those visits apart from the ones that build the screen on the tap
        const startedSpans = mockStartSpan.mock.calls.map(([spanId, options]: [string, {attributes?: Record<string, unknown>}]) => [spanId, options.attributes]);
        expect(startedSpans).toEqual([
            [CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_PRELOADED]: expectedIsPreloaded}],
            [CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT, {[CONST.TELEMETRY.ATTRIBUTE_IS_PRELOADED]: expectedIsPreloaded}],
            [CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD, {[CONST.TELEMETRY.ATTRIBUTE_IS_PRELOADED]: expectedIsPreloaded}],
        ]);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('reports the pointer resting on the wide-layout button', () => {
        // Given the wide-layout Spend tab button
        mockRootState = buildRootState(['search-route']);
        render(
            <SearchTabButton
                selectedTab={NAVIGATION_TABS.HOME}
                isWideLayout
            />,
        );

        // When the pointer moves onto the button
        fireEvent(screen.getByTestId('search-tab-button'), 'hoverIn');

        // Then the preloaded Spend tab hears about it, so it can catch up on skipped updates before the click
        expect(getIsSearchTabHovered()).toBe(true);

        // And when the pointer leaves, it can freeze again
        fireEvent(screen.getByTestId('search-tab-button'), 'hoverOut');
        expect(getIsSearchTabHovered()).toBe(false);
    });

    it('drops the hover when the button goes away while hovered', () => {
        // Given the pointer rests on the wide-layout Spend tab button
        mockRootState = buildRootState(['search-route']);
        const {unmount} = render(
            <SearchTabButton
                selectedTab={NAVIGATION_TABS.HOME}
                isWideLayout
            />,
        );
        fireEvent(screen.getByTestId('search-tab-button'), 'hoverIn');

        // When the button unmounts with no hover out, e.g. on a switch to the narrow layout
        unmount();

        // Then the preloaded Spend tab is no longer kept unfrozen by a pointer that is not there
        expect(getIsSearchTabHovered()).toBe(false);
    });
});
