import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';
import getFlatNavTabBarSlot from '@libs/Navigation/FlatNavTabBar/getFlatNavTabBarSlot';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

describe('getFlatNavTabBarSlot', () => {
    it.each([
        [SCREENS.HOME, FLAT_NAV_TAB_BAR_SLOT.HOME],
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, FLAT_NAV_TAB_BAR_SLOT.INBOX],
        [SCREENS.INSIGHTS, FLAT_NAV_TAB_BAR_SLOT.MORE],
        [NAVIGATORS.WORKSPACE_NAVIGATOR, FLAT_NAV_TAB_BAR_SLOT.MORE],
    ])('should map the %s tab to the %s slot whatever the active section', (focusedTabRouteName, slot) => {
        // Given a tab that is not the Search navigator, with a Reports section left over from an earlier visit to Search
        // When its slot is resolved
        const result = getFlatNavTabBarSlot({focusedTabRouteName, activeFlatNavSectionID: FLAT_NAV.SECTION.REPORTS});

        // Then the section is ignored, because it only says what Search would show and Search is not on screen
        expect(result).toBe(slot);
    });

    it('should not highlight any slot for Account', () => {
        // Given the Account tab, which opens from the top bar and has no slot in the flat nav bar
        // When its slot is resolved
        const result = getFlatNavTabBarSlot({focusedTabRouteName: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, activeFlatNavSectionID: undefined});

        // Then nothing is highlighted, since Account opens from the top bar and no slot stands for it
        expect(result).toBeUndefined();
    });

    it('should not highlight any slot before the tab navigator has a focused route', () => {
        // Given the tab navigator has not realized its state yet, with a section left over in Search
        // When the slot is resolved
        const result = getFlatNavTabBarSlot({focusedTabRouteName: undefined, activeFlatNavSectionID: FLAT_NAV.SECTION.ACCOUNTING});

        // Then nothing is highlighted rather than guessing a tab the user may not be on
        expect(result).toBeUndefined();
    });

    it.each([
        [FLAT_NAV.SECTION.EXPENSES, FLAT_NAV_TAB_BAR_SLOT.EXPENSES],
        [FLAT_NAV.SECTION.REPORTS, FLAT_NAV_TAB_BAR_SLOT.REPORTS],
        [FLAT_NAV.SECTION.ACCOUNTING, FLAT_NAV_TAB_BAR_SLOT.MORE],
        [FLAT_NAV.SECTION.SAVED, FLAT_NAV_TAB_BAR_SLOT.MORE],
        [FLAT_NAV.SECTION.TRAVEL, FLAT_NAV_TAB_BAR_SLOT.EXPENSES],
    ])('should map the active %s section to the %s slot', (activeFlatNavSectionID, slot) => {
        // Given the Search navigator showing a search of a visible flat nav section
        // When its slot is resolved
        const result = getFlatNavTabBarSlot({focusedTabRouteName: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, activeFlatNavSectionID});

        // Then the slot of that section is highlighted, so Expenses and Reports split the single Search route and the sections behind More highlight More
        expect(result).toBe(slot);
    });

    it('should fall back to the Expenses slot when Search shows no visible section', () => {
        // Given the Search navigator showing a search outside every visible section, such as an Insights chart search or a saved search while the Saved section is hidden
        // When its slot is resolved
        const result = getFlatNavTabBarSlot({focusedTabRouteName: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, activeFlatNavSectionID: undefined});

        // Then Expenses is highlighted, since the Search tab opens on it, and More is not highlighted with nothing active in its menu
        expect(result).toBe(FLAT_NAV_TAB_BAR_SLOT.EXPENSES);
    });
});
