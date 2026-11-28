import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import getMoreTabItemID from '@libs/Navigation/MoreMenu/getMoreTabItemID';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

describe('getMoreTabItemID', () => {
    it.each([
        [SCREENS.INSIGHTS, undefined, MORE_MENU.ITEM.INSIGHTS],
        [NAVIGATORS.WORKSPACE_NAVIGATOR, undefined, MORE_MENU.ITEM.WORKSPACES],
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, FLAT_NAV.SECTION.ACCOUNTING, MORE_MENU.ITEM.ACCOUNTING],
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, FLAT_NAV.SECTION.SAVED, MORE_MENU.ITEM.SAVED],
    ] as const)('should show the More menu entry of %s with section %s', (focusedTabRouteName, activeFlatNavSectionID, expectedItemID) => {
        // Given the user on a page the More menu opens
        const focus = {focusedTabRouteName, activeFlatNavSectionID};

        // When the More item is resolved
        const itemID = getMoreTabItemID(focus);

        // Then it shows that entry, so the bar tells where the user is
        expect(itemID).toBe(expectedItemID);
    });

    it.each([
        [SCREENS.HOME, undefined],
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, undefined],
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, undefined],
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, FLAT_NAV.SECTION.EXPENSES],
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, FLAT_NAV.SECTION.REPORTS],
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, FLAT_NAV.SECTION.TRAVEL],
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, undefined],
        [undefined, undefined],
    ] as const)('should show no entry on %s with section %s', (focusedTabRouteName, activeFlatNavSectionID) => {
        // Given the user on a page that has its own bar item, or none
        const focus = {focusedTabRouteName, activeFlatNavSectionID};

        // When the More item is resolved
        const itemID = getMoreTabItemID(focus);

        // Then it shows no entry, so the item goes back to the plain More chevron as soon as the user leaves
        expect(itemID).toBeUndefined();
    });

    it('should ignore an Accounting section left over while another tab is focused', () => {
        // Given an Accounting search still held by the Search navigator while the user is on Home
        const focus = {focusedTabRouteName: SCREENS.HOME, activeFlatNavSectionID: FLAT_NAV.SECTION.ACCOUNTING};

        // When the More item is resolved
        const itemID = getMoreTabItemID(focus);

        // Then it shows no entry, because the section only counts while Search is on screen
        expect(itemID).toBeUndefined();
    });
});
