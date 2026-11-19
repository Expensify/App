import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import {COLLAPSE_SURFACE, useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import SavedSearchItemThreeDotMenu from '@pages/Search/SavedSearchItemThreeDotMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ThreeDotsMenu', () => {
    // The factory is hoisted above the imports, so it loads what it renders itself.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {Text: MockText} = require('react-native');
    return ({menuItems}: {menuItems: PopoverMenuItem[]}) =>
        menuItems.map((menuItem) => (
            <MockText
                key={menuItem.text}
                onPress={() => menuItem.onSelected?.()}
            >
                {menuItem.text}
            </MockText>
        ));
});

const RENAME = 'Rename';

function renderMenu(collapseSurface?: (typeof COLLAPSE_SURFACE)[keyof typeof COLLAPSE_SURFACE]) {
    const onRename = jest.fn();
    render(
        <SavedSearchItemThreeDotMenu
            menuItems={[{text: RENAME, onSelected: onRename, sentryLabel: CONST.SENTRY_LABEL.TEST.LABEL}]}
            isDisabledItem={false}
            collapseSurface={collapseSurface}
        />,
    );
    return onRename;
}

async function startPeekOn(surface: (typeof COLLAPSE_SURFACE)[keyof typeof COLLAPSE_SURFACE]) {
    const hook = renderHook(() => useSearchSidebarCollapse(surface));
    await waitForBatchedUpdatesWithAct();
    act(() => hook.result.current.startPeek());
    return hook;
}

describe('SavedSearchItemThreeDotMenu', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        // Release any peek left over, so each test starts with no surface peeking.
        for (const surface of Object.values(COLLAPSE_SURFACE)) {
            const {result} = renderHook(() => useSearchSidebarCollapse(surface));
            act(() => result.current.endPeek());
        }
    });

    it('should end the peek of the navigation bar when the menu lives there', async () => {
        // Given the collapsed navigation bar peeks, with the menu on one of its rows
        const navigationBar = await startPeekOn(COLLAPSE_SURFACE.NAVIGATION_BAR);
        const onRename = renderMenu(COLLAPSE_SURFACE.NAVIGATION_BAR);
        expect(navigationBar.result.current.isPeeking).toBe(true);

        // When the user picks an item, which opens a page that takes the pointer away without a mouse leave
        fireEvent.press(screen.getByText(RENAME));

        // Then the bar stops peeking instead of staying stuck open, and the item still runs
        expect(navigationBar.result.current.isPeeking).toBe(false);
        expect(onRename).toHaveBeenCalled();
    });

    it('should end the peek of the Spend sidebar by default', async () => {
        // Given the collapsed Spend sidebar peeks, with the menu on one of its saved searches
        const searchSidebar = await startPeekOn(COLLAPSE_SURFACE.SEARCH_SIDEBAR);
        renderMenu();

        // When the user picks an item
        fireEvent.press(screen.getByText(RENAME));

        // Then the sidebar stops peeking, as before the surface could be chosen
        expect(searchSidebar.result.current.isPeeking).toBe(false);
    });

    it('should leave another surface peeking', async () => {
        // Given the Spend sidebar peeks while the menu lives in the navigation bar
        const searchSidebar = await startPeekOn(COLLAPSE_SURFACE.SEARCH_SIDEBAR);
        renderMenu(COLLAPSE_SURFACE.NAVIGATION_BAR);

        // When the user picks an item
        fireEvent.press(screen.getByText(RENAME));

        // Then the sidebar keeps peeking, since each surface peeks on its own
        expect(searchSidebar.result.current.isPeeking).toBe(true);
    });
});
