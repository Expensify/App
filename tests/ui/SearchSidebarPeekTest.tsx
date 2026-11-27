import {act, render, renderHook} from '@testing-library/react-native';

import type {PeekSurfaceContextValue} from '@components/Navigation/PeekSurfaceContext';
import SearchSidebar from '@components/Navigation/SearchSidebar';
import {useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import type * as UseEndPeekOnFocusLeaveModule from '@components/Navigation/useEndPeekOnFocusLeave';

import ONYXKEYS from '@src/ONYXKEYS';

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
jest.mock('@components/Navigation/useSearchLoadingBarVisibility', () => () => false);
jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({lastSearchType: undefined, currentSearchResults: undefined}),
    useSearchResultsActions: () => ({setLastSearchType: () => {}}),
}));
// Jest resolves the native variant, which does nothing, so the web one is loaded by its file name.
jest.mock('@components/Navigation/useEndPeekOnFocusLeave', () => jest.requireActual<typeof UseEndPeekOnFocusLeaveModule>('@components/Navigation/useEndPeekOnFocusLeave/index.ts'));
let mockIsElementHovered = false;
let mockHasKeyboardFocusInside = false;
// Jest has no DOM, so the element the sidebar reads the pointer against counts as one as long as it can answer matches().
jest.mock('@libs/isHTMLElement', () => ({
    __esModule: true,
    default: (val: unknown): val is HTMLElement => typeof val === 'object' && val !== null && 'matches' in val,
}));
// A button in the sidebar, a menu item that the menu's portal places outside the sidebar's DOM, and a node on the page.
const mockSidebarButtonNode = document.createElement('button');
const menuItemNode = document.createElement('button');
const pageNode = document.createElement('div');
document.body.append(mockSidebarButtonNode, menuItemNode, pageNode);

function focus(node: Element) {
    node.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
}

let mockOuterHoverOut: (() => void) | undefined;
let mockInnerHoverIn: (() => void) | undefined;
// Hands the sidebar an element whose hover and keyboard focus state the test controls, the way the DOM node reports them on web.
jest.mock('@components/Hoverable', () => {
    const {useImperativeHandle} = jest.requireActual<typeof React>('react');
    return ({children, onHoverIn, onHoverOut, ref}: {children: React.ReactNode; onHoverIn?: () => void; onHoverOut?: () => void; ref?: React.Ref<unknown>}) => {
        useImperativeHandle(ref, () => ({
            matches: (selector: string) => mockIsElementHovered && selector === ':hover',
            querySelector: (selector: string) => (mockHasKeyboardFocusInside && selector === ':focus-visible' ? {} : null),
            contains: (node: unknown) => node === mockSidebarButtonNode,
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

async function renderPeekingSidebar() {
    const collapse = renderHook(() => useSearchSidebarCollapse());
    render(<SearchSidebar />);
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
        mockHasKeyboardFocusInside = false;
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

    it('keeps peeking once a menu is gone if keyboard focus is inside the sidebar, even with the pointer off it', async () => {
        // Given a peeking sidebar whose saved search menu was closed with Escape, so focus went back to the menu's button,
        // while the pointer rested over the part of the menu outside the sidebar
        const collapse = await renderPeekingSidebar();
        mockHasKeyboardFocusInside = true;

        // When the menu's modal is gone
        act(() => {
            mockPeekSurface?.endPeekIfPointerLeft();
        });

        // Then the sidebar stays peeking, because collapsing would unmount the focused button and drop keyboard focus
        expect(collapse.result.current.isPeeking).toBe(true);
    });

    it('ends a peek held by keyboard focus once focus lands outside the sidebar', async () => {
        // Given a peeking sidebar held open by keyboard focus on a menu's button, after the menu closed with the pointer off the sidebar
        const collapse = await renderPeekingSidebar();
        act(() => {
            focus(mockSidebarButtonNode);
        });
        mockHasKeyboardFocusInside = true;
        act(() => {
            mockPeekSurface?.endPeekIfPointerLeft();
        });
        expect(collapse.result.current.isPeeking).toBe(true);

        // When the user tabs out of the sidebar, or clicks the page, which focuses the page's container
        act(() => {
            focus(pageNode);
        });

        // Then the sidebar collapses, because neither the pointer nor focus is in it and no hover-out will ever come
        expect(collapse.result.current.isPeeking).toBe(false);
    });

    it('keeps peeking when focus moves into a menu the sidebar opened', async () => {
        // Given a peeking sidebar with a saved search's menu open and the pointer resting on the menu's part outside the sidebar
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeekUntilMenuCloses();
        });

        // When focus moves into the menu, whose portal places it outside the sidebar's DOM
        act(() => {
            focus(menuItemNode);
        });

        // Then the sidebar keeps peeking, because the open menu holds it and collapsing would unmount the menu the user is in
        expect(collapse.result.current.isPeeking).toBe(true);
    });

    it('ends the peek when focus leaves the sidebar after a menu that held it is gone', async () => {
        // Given a peeking sidebar whose open menu held the peek while focus was inside the menu
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeekUntilMenuCloses();
            focus(menuItemNode);
        });

        // When the menu closes with Escape, which returns keyboard focus to the menu's button, and the user then tabs out of the sidebar
        mockHasKeyboardFocusInside = true;
        act(() => {
            mockPeekSurface?.endPeekIfPointerLeft();
            focus(mockSidebarButtonNode);
        });
        expect(collapse.result.current.isPeeking).toBe(true);
        act(() => {
            focus(pageNode);
        });

        // Then the sidebar collapses, because the menu released its hold once it was gone and focus is no longer in the sidebar
        expect(collapse.result.current.isPeeking).toBe(false);
    });

    it('keeps peeking when focus lands outside the sidebar while the pointer is over it', async () => {
        // Given a peeking sidebar with the pointer over it
        const collapse = await renderPeekingSidebar();
        mockIsElementHovered = true;

        // When focus lands on the page, as when a clicked row opens a page that takes focus
        act(() => {
            focus(pageNode);
        });

        // Then the sidebar keeps peeking, because the pointer is still on it and leaving it will send a hover-out
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

    it('keeps peeking when the pointer leaves the window while a menu is open', async () => {
        // Given a peeking sidebar with a saved search's menu open
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeekUntilMenuCloses();
        });

        // When the pointer leaves the window from the menu's backdrop, which React reports to the sidebar as a hover-out through the menu's portal
        act(() => {
            mockOuterHoverOut?.();
        });

        // Then the sidebar keeps peeking, because collapsing it would unmount the open menu
        expect(collapse.result.current.isPeeking).toBe(true);
    });

    it('ends the peek once a held menu is gone with the pointer off the sidebar', async () => {
        // Given a peeking sidebar whose open menu held the peek through a hover-out
        const collapse = await renderPeekingSidebar();
        act(() => {
            mockPeekSurface?.holdPeekUntilMenuCloses();
            mockOuterHoverOut?.();
        });

        // When the menu's modal is gone
        act(() => {
            mockPeekSurface?.endPeekIfPointerLeft();
        });

        // Then the sidebar collapses, and the next hover-out is no longer held
        expect(collapse.result.current.isPeeking).toBe(false);
    });
});
