import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import PeekSurfaceContext from '@components/Navigation/PeekSurfaceContext';
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
    return ({menuItems, onModalShow, onModalHide}: {menuItems: PopoverMenuItem[]; onModalShow?: () => void; onModalHide?: () => void}) => (
        <>
            <MockText onPress={() => onModalShow?.()}>Menu shown</MockText>
            <MockText onPress={() => onModalHide?.()}>Menu gone</MockText>
            {menuItems.map((menuItem) => (
                <MockText
                    key={menuItem.text}
                    onPress={() => menuItem.onSelected?.()}
                >
                    {menuItem.text}
                </MockText>
            ))}
        </>
    );
});

const RENAME = 'Rename';
const SHARE = 'Share';

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

    describe('holding the peek while the menu shows', () => {
        function renderMenuInPeekingSurface() {
            const holdPeek = jest.fn();
            const releasePeek = jest.fn();
            const view = render(
                <PeekSurfaceContext.Provider value={{holdPeek, releasePeek}}>
                    <SavedSearchItemThreeDotMenu
                        menuItems={[{text: SHARE, onSelected: jest.fn(), shouldCloseModalOnSelect: false, sentryLabel: CONST.SENTRY_LABEL.TEST.LABEL}]}
                        isDisabledItem={false}
                    />
                </PeekSurfaceContext.Provider>,
            );
            return {holdPeek, releasePeek, ...view};
        }

        it('should hold the peek while the menu shows and release it once the menu is gone, as after Share closes the menu by itself', () => {
            // Given a menu inside a peeking surface
            const {holdPeek, releasePeek} = renderMenuInPeekingSurface();

            // When the menu shows and the user picks Share, which keeps the menu open to show the link was copied
            fireEvent.press(screen.getByText('Menu shown'));
            fireEvent.press(screen.getByText(SHARE));

            // Then the surface holds the peek, because ending it now would unmount the menu while it still shows the copied state
            expect(holdPeek).toHaveBeenCalledTimes(1);
            expect(releasePeek).not.toHaveBeenCalled();

            // When the menu's modal is gone, for example after the Share timer closed it under a still pointer
            fireEvent.press(screen.getByText('Menu gone'));

            // Then the hold is released, so the surface can read the pointer and end the peek
            expect(releasePeek).toHaveBeenCalledTimes(1);
        });

        it('should hold the peek only once however often the menu shows, and release it only once', () => {
            // Given a menu inside a peeking surface
            const {holdPeek, releasePeek} = renderMenuInPeekingSurface();

            // When the menu reports it shows twice in a row and is then gone twice in a row
            fireEvent.press(screen.getByText('Menu shown'));
            fireEvent.press(screen.getByText('Menu shown'));
            fireEvent.press(screen.getByText('Menu gone'));
            fireEvent.press(screen.getByText('Menu gone'));

            // Then the surface sees one hold and one release, so the menu never ends a peek another menu holds
            expect(holdPeek).toHaveBeenCalledTimes(1);
            expect(releasePeek).toHaveBeenCalledTimes(1);
        });

        it('should release the hold when the menu unmounts while it shows', () => {
            // Given a menu that holds the peek of its surface
            const {releasePeek, unmount} = renderMenuInPeekingSurface();
            fireEvent.press(screen.getByText('Menu shown'));

            // When the menu goes away without a modal hide, for example because a pick collapsed the sidebar
            unmount();

            // Then the hold is released, so the surface does not stay open for good
            expect(releasePeek).toHaveBeenCalledTimes(1);
        });

        it('should not release anything when it never held the peek', () => {
            // Given a menu that never showed
            const {releasePeek, unmount} = renderMenuInPeekingSurface();

            // When the popover reports a hide without a matching show, and the menu then unmounts
            fireEvent.press(screen.getByText('Menu gone'));
            unmount();

            // Then it releases nothing, which would otherwise end a peek another menu holds
            expect(releasePeek).not.toHaveBeenCalled();
        });

        it('should keep working outside a peeking surface', () => {
            // Given a menu rendered without a surface around it
            renderMenu();

            // When the menu shows and is gone
            // Then nothing throws, as there is no peek to hold
            expect(() => {
                fireEvent.press(screen.getByText('Menu shown'));
                fireEvent.press(screen.getByText('Menu gone'));
            }).not.toThrow();
        });
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
