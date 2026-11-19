import {act, render, renderHook} from '@testing-library/react-native';

import type {PeekSurfaceContextValue} from '@components/Navigation/PeekSurfaceContext';
import SearchSidebar from '@components/Navigation/SearchSidebar';
import {useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';

import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ParamListBase} from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockPeekSurface: PeekSurfaceContextValue | undefined;
// Reads the peek surface from the same context a saved search's menu does.
jest.mock('@pages/Search/SearchTypeMenuWide', () => () => {
    // The factory is hoisted above the imports, so it loads what it needs itself.
    /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const {useContext} = require('react');
    const PeekSurfaceContext = require('@components/Navigation/PeekSurfaceContext').default;
    mockPeekSurface = useContext(PeekSurfaceContext);
    /* eslint-enable */
    return null;
});
jest.mock(
    '@components/Navigation/TopBar',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/Tooltip',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar', () => () => false);
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useInFlightRequests', () => ({useLoadingBarVisibility: () => false}));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({lastSearchType: undefined, currentSearchResults: undefined}),
    useSearchResultsActions: () => ({setLastSearchType: () => {}}),
}));
let mockIsElementHovered = false;
// Jest has no DOM, so the element the sidebar reads the pointer against counts as one as long as it can answer matches().
jest.mock('@libs/isHTMLElement', () => ({
    __esModule: true,
    default: (val: unknown): val is HTMLElement => typeof val === 'object' && val !== null && 'matches' in val,
}));
let mockOuterHoverOut: (() => void) | undefined;
let mockInnerHoverIn: (() => void) | undefined;
// Hands the sidebar an element whose hover state the test controls, the way the DOM node reports it on web.
jest.mock('@components/Hoverable', () => {
    const {useImperativeHandle} = jest.requireActual<typeof React>('react');
    return ({children, onHoverIn, onHoverOut, ref}: {children: React.ReactNode; onHoverIn?: () => void; onHoverOut?: () => void; ref?: React.Ref<unknown>}) => {
        useImperativeHandle(ref, () => ({matches: (selector: string) => mockIsElementHovered && selector === ':hover'}));
        if (onHoverOut) {
            mockOuterHoverOut = onHoverOut;
        }
        if (onHoverIn) {
            mockInnerHoverIn = onHoverIn;
        }
        return children;
    };
});

const NAVIGATION_STATE: PlatformStackNavigationState<ParamListBase> = {key: 'Search', index: 0, routeNames: [], routes: [], type: 'stack', stale: false, preloadedRoutes: []};

async function renderPeekingSidebar() {
    render(<SearchSidebar state={NAVIGATION_STATE} />);
    const collapse = renderHook(() => useSearchSidebarCollapse());
    await waitForBatchedUpdatesWithAct();
    act(() => {
        mockInnerHoverIn?.();
    });
    expect(collapse.result.current.isPeeking).toBe(true);
    return collapse;
}

describe('SearchSidebar peek', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockPeekSurface = undefined;
        mockIsElementHovered = false;
        await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
        await waitForBatchedUpdatesWithAct();
    });

    it('ends the peek once a menu is gone if the pointer is off the sidebar, as after Share closes the menu by itself', async () => {
        // Given a peeking sidebar whose saved search menu was left with the pointer outside the sidebar
        const collapse = await renderPeekingSidebar();

        // When the menu's modal is gone without the pointer moving, so no hover-out reaches the sidebar
        act(() => {
            mockPeekSurface?.endPeekIfPointerLeft();
        });

        // Then the sidebar collapses without waiting for the pointer to enter and leave it again
        expect(collapse.result.current.isPeeking).toBe(false);
    });

    it('keeps peeking once a menu is gone if the pointer is over the sidebar', async () => {
        // Given a peeking sidebar with the pointer over it
        const collapse = await renderPeekingSidebar();
        mockIsElementHovered = true;

        // When the menu's modal is gone
        act(() => {
            mockPeekSurface?.endPeekIfPointerLeft();
        });

        // Then the sidebar stays peeking, because the pointer is genuinely inside it
        expect(collapse.result.current.isPeeking).toBe(true);
    });

    it('still ends the peek when the pointer leaves the sidebar', async () => {
        // Given a peeking sidebar
        const collapse = await renderPeekingSidebar();

        // When the pointer leaves it
        act(() => {
            mockOuterHoverOut?.();
        });

        // Then the sidebar collapses, as before menus could settle the peek
        expect(collapse.result.current.isPeeking).toBe(false);
    });
});
