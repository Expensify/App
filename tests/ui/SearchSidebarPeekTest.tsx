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
let mockHadTabNavigation = false;
// Lets the test choose whether the user navigates with the keyboard.
jest.mock('@libs/hadTabNavigation', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/hadTabNavigation'),
    __esModule: true,
    default: () => mockHadTabNavigation,
}));
// Jest has no DOM, so the element the sidebar reads the pointer against counts as one as long as it can answer matches().
jest.mock('@libs/isHTMLElement', () => ({
    __esModule: true,
    default: (val: unknown): val is HTMLElement => typeof val === 'object' && val !== null && 'matches' in val,
}));
let mockOuterHoverOut: (() => void) | undefined;
const mockNodeInsideSidebar = document.createElement('button');
const nodeOutsideSidebar = document.createElement('button');
document.body.append(mockNodeInsideSidebar, nodeOutsideSidebar);

// Fires the focusin a focused element sends up to the document, without moving the real focus.
function focusNode(node: HTMLElement) {
    node.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
}
let mockInnerHoverIn: (() => void) | undefined;
// Hands the sidebar an element whose hover and keyboard focus state the test controls, the way the DOM node reports them on web.
jest.mock('@components/Hoverable', () => {
    const {useImperativeHandle} = jest.requireActual<typeof React>('react');
    return ({children, onHoverIn, onHoverOut, ref}: {children: React.ReactNode; onHoverIn?: () => void; onHoverOut?: () => void; ref?: React.Ref<unknown>}) => {
        useImperativeHandle(ref, () => ({
            matches: (selector: string) => mockIsElementHovered && selector === ':hover',
            contains: (node: unknown) => node === mockNodeInsideSidebar,
        }));
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
        mockHadTabNavigation = false;
        await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
        await waitForBatchedUpdatesWithAct();
    });

    it('ends the peek once a menu is gone if the pointer is off the sidebar, as after Share closes the menu by itself', async () => {
        // Given a peeking sidebar whose saved search menu shows, with the pointer outside the sidebar
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeek();
        });

        // When the menu's modal is gone without the pointer moving, so no hover-out reaches the sidebar
        act(() => {
            mockPeekSurface?.releasePeek();
        });

        // Then the sidebar collapses without waiting for the pointer to enter and leave it again
        expect(collapse.result.current.isPeeking).toBe(false);
    });

    it('keeps peeking once a menu is gone if the pointer is over the sidebar', async () => {
        // Given a peeking sidebar with a menu showing and the pointer over the sidebar
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeek();
        });
        mockIsElementHovered = true;

        // When the menu's modal is gone
        act(() => {
            mockPeekSurface?.releasePeek();
        });

        // Then the sidebar stays peeking, because the pointer is genuinely inside it
        expect(collapse.result.current.isPeeking).toBe(true);
    });

    it('keeps peeking once a menu is gone if the user navigates with the keyboard, even with the pointer off it', async () => {
        // Given a peeking sidebar whose saved search menu a keyboard user closed with Escape, or that Share closed by itself,
        // while the pointer rested over the part of the menu outside the sidebar
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeek();
        });
        mockHadTabNavigation = true;

        // When the menu's modal is gone, before the focus is returned to the menu's button
        act(() => {
            mockPeekSurface?.releasePeek();
        });

        // Then the sidebar stays peeking, because collapsing would unmount the menu's button, where the next Tab continues from
        expect(collapse.result.current.isPeeking).toBe(true);
    });

    it('keeps peeking when the pointer leaves the sidebar while a menu shows', async () => {
        // Given a peeking sidebar with a saved search menu showing, which opens partly outside the sidebar
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeek();
        });

        // When the pointer leaves the sidebar, for example by moving just past the menu's edge
        act(() => {
            mockOuterHoverOut?.();
        });

        // Then the sidebar stays peeking, so the menu is not unmounted from under the pointer
        expect(collapse.result.current.isPeeking).toBe(true);

        // When the menu closes with the pointer still off the sidebar, for example after a click outside
        act(() => {
            mockPeekSurface?.releasePeek();
        });

        // Then the sidebar collapses, since the hover-out it skipped will not come again
        expect(collapse.result.current.isPeeking).toBe(false);
    });

    it('keeps peeking until every showing menu is gone', async () => {
        // Given a peeking sidebar with two menus holding the peek and the pointer off the sidebar
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeek();
            mockPeekSurface?.holdPeek();
        });
        act(() => {
            mockOuterHoverOut?.();
        });

        // When one of them is gone
        act(() => {
            mockPeekSurface?.releasePeek();
        });

        // Then the other still holds the peek
        expect(collapse.result.current.isPeeking).toBe(true);

        // When the other is gone too
        act(() => {
            mockPeekSurface?.releasePeek();
        });

        // Then the sidebar collapses
        expect(collapse.result.current.isPeeking).toBe(false);
    });

    it('still ends the peek when the pointer leaves the sidebar with no menu showing', async () => {
        // Given a peeking sidebar
        const collapse = await renderPeekingSidebar();

        // When the pointer leaves it
        act(() => {
            mockOuterHoverOut?.();
        });

        // Then the sidebar collapses, as before menus could hold the peek
        expect(collapse.result.current.isPeeking).toBe(false);
    });

    it('ends the peek when focus lands elsewhere on the page after a keyboard user closed a menu with the pointer off the sidebar', async () => {
        // Given a peeking sidebar a keyboard user holds after closing a menu over its part outside the sidebar, with focus left on the body
        const collapse = await renderPeekingSidebar();
        mockHadTabNavigation = true;
        act(() => {
            mockPeekSurface?.holdPeek();
            mockPeekSurface?.releasePeek();
        });
        expect(collapse.result.current.isPeeking).toBe(true);

        // When the user tabs on past the sidebar or clicks the page, which sends no hover-out because the pointer is already outside
        act(() => {
            focusNode(nodeOutsideSidebar);
        });

        // Then the sidebar collapses instead of covering the page the focus moved to
        expect(collapse.result.current.isPeeking).toBe(false);
    });

    it('keeps peeking when focus lands in the sidebar', async () => {
        // Given a peeking sidebar with the pointer off it
        const collapse = await renderPeekingSidebar();

        // When focus moves to a saved search's menu button, as the next Tab after a menu closed does
        act(() => {
            focusNode(mockNodeInsideSidebar);
        });

        // Then the sidebar stays peeking, because the focus is inside it
        expect(collapse.result.current.isPeeking).toBe(true);
    });

    it('keeps peeking when focus lands elsewhere with the pointer over the sidebar', async () => {
        // Given a peeking sidebar with the pointer over it
        const collapse = await renderPeekingSidebar();
        mockIsElementHovered = true;

        // When focus lands elsewhere on the page
        act(() => {
            focusNode(nodeOutsideSidebar);
        });

        // Then the sidebar stays peeking, since the pointer holds it and its hover-out settles it later
        expect(collapse.result.current.isPeeking).toBe(true);
    });

    it('keeps peeking when focus moves into a showing menu', async () => {
        // Given a peeking sidebar with a saved search menu showing and the pointer off the sidebar
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeek();
        });

        // When focus moves into the menu, which is portaled outside the sidebar
        act(() => {
            focusNode(nodeOutsideSidebar);
        });

        // Then the sidebar stays peeking, so the menu stays mounted
        expect(collapse.result.current.isPeeking).toBe(true);
    });
});
