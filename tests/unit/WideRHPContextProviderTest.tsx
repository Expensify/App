import {render} from '@testing-library/react-native';

import type * as WideRHPContextProviderModule from '@components/WideRHPContextProvider';
import type {WideRHPStateContextType} from '@components/WideRHPContextProvider/types';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState} from '@react-navigation/native';

import React, {useEffect} from 'react';

type TestRoute = NavigationState['routes'][number];

let mockRootState: NavigationState | undefined;

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: <T,>(selector: (state: NavigationState | undefined) => T) => selector(mockRootState),
}));
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));
// Under jest both resolve to native no-ops, leaving the provider's Animated values undefined.
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () => ({__esModule: true, default: () => 465}));
jest.mock('@libs/Navigation/helpers/calculateSuperWideRHPWidth', () => ({__esModule: true, default: () => 1041}));

// Required by path: jest would resolve index.native.tsx, which has no wide RHP.
const {default: WideRHPContextProvider, useWideRHPState, useWideRHPActions, getRHPRouteWidth, getDisplayedRHPRouteWidth} = require<
    typeof WideRHPContextProviderModule
>('../../src/components/WideRHPContextProvider/index.tsx');

function buildRootState(routes: TestRoute[]): NavigationState {
    return {
        key: 'root',
        index: routes.length - 1,
        routeNames: routes.map((route) => route.name),
        routes,
        type: 'stack',
        stale: false,
    };
}

const reportsSplit: TestRoute = {key: 'split-1', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR};
const searchFullscreen: TestRoute = {key: 'search-1', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR};

/** A fresh state object for the same tree, as any navigation event hands the provider. */
function buildStateShowing(childKeys: string[]): NavigationState {
    return buildRootState([reportsSplit, {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, state: {routes: childKeys.map((key) => ({key, name: 'Screen'}))}} as TestRoute]);
}

function renderProvider() {
    const published: WideRHPStateContextType[] = [];

    function Capture() {
        published.push(useWideRHPState());
        return null;
    }

    function RegisterWideScreen() {
        const {setRHPWidth} = useWideRHPActions();
        // Re-registering the same width is a no-op, so this can run every render.
        useEffect(() => setRHPWidth({key: 'wideKey', name: 'Screen'}, 'wide'));
        return null;
    }

    // A fresh element each time, or React bails out of the subtree and the provider never re-derives.
    const buildTree = () => (
        <WideRHPContextProvider>
            <RegisterWideScreen />
            <Capture />
        </WideRHPContextProvider>
    );
    const utils = render(buildTree());
    return {published, navigate: () => utils.rerender(buildTree())};
}

describe('WideRHPContextProvider', () => {
    beforeEach(() => {
        mockRootState = buildStateShowing(['wideKey']);
    });

    it('publishes the same arrays across a navigation event that changes none of the keys, so consumers do not re-render', () => {
        // Given a wide screen the RHP is showing
        const {published, navigate} = renderProvider();
        const before = published.at(-1);
        expect(before?.wideRHPRouteKeys).toEqual(['wideKey']);

        // When navigation reports a new state object for the same tree
        mockRootState = buildStateShowing(['wideKey']);
        navigate();

        // Then the published arrays are the same ones
        const after = published.at(-1);
        expect(after?.wideRHPRouteKeys).toBe(before?.wideRHPRouteKeys);
        expect(after?.superWideRHPRouteKeys).toBe(before?.superWideRHPRouteKeys);
    });

    it('publishes new arrays once the keys themselves change', () => {
        // Given a wide screen the RHP is showing
        const {published, navigate} = renderProvider();
        const before = published.at(-1);
        expect(before?.wideRHPRouteKeys).toEqual(['wideKey']);

        // When a fullscreen navigator covers the RHP
        mockRootState = buildRootState([
            reportsSplit,
            {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, state: {routes: [{key: 'wideKey', name: 'Screen'}]}} as TestRoute,
            searchFullscreen,
        ]);
        navigate();

        // Then the change is published
        const after = published.at(-1);
        expect(after?.wideRHPRouteKeys).toEqual([]);
        expect(after?.wideRHPRouteKeys).not.toBe(before?.wideRHPRouteKeys);
    });

    it('keeps the width of a screen animating out for its layout, but stops reporting it as displayed', () => {
        // Given a wide screen the RHP is showing
        const {navigate} = renderProvider();
        navigate();
        expect(getRHPRouteWidth('wideKey')).toBe('wide');
        expect(getDisplayedRHPRouteWidth('wideKey')).toBe('wide');

        // When the RHP closes, while the screen is still mounted and sliding out
        mockRootState = buildRootState([reportsSplit]);
        navigate();

        // Then its layout keeps the width, but it is no longer displayed
        expect(getRHPRouteWidth('wideKey')).toBe('wide');
        expect(getDisplayedRHPRouteWidth('wideKey')).toBeUndefined();
    });
});
