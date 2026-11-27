import {render} from '@testing-library/react-native';

import FlatNavMoreTabButton from '@components/Navigation/NavigationTabBar/FlatNavMoreTabButton';
import FlatNavSpendTabButton from '@components/Navigation/NavigationTabBar/FlatNavSpendTabButton';
import FlatNavTabBarItems from '@components/Navigation/NavigationTabBar/FlatNavTabBarItems';
import HomeTabButton from '@components/Navigation/NavigationTabBar/HomeTabButton';
import InboxTabButton from '@components/Navigation/NavigationTabBar/InboxTabButton';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useFlatNavTabBarFocus from '@components/Navigation/NavigationTabBar/useFlatNavTabBarFocus';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type FlatNavTabBarFocus from '@libs/Navigation/FlatNavTabBar/FlatNavTabBarFocus';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';
import MoreMenuStateContext from '@libs/Navigation/MoreMenu/MoreMenuStateContext';
import type {MoreMenuState} from '@libs/Navigation/MoreMenu/MoreMenuStateContext';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React from 'react';

jest.mock('@components/Navigation/NavigationTabBar/HomeTabButton', () => jest.fn(() => null));
jest.mock('@components/Navigation/NavigationTabBar/InboxTabButton', () => jest.fn(() => null));
jest.mock('@components/Navigation/NavigationTabBar/FlatNavSpendTabButton', () => jest.fn(() => null));
jest.mock('@components/Navigation/NavigationTabBar/FlatNavMoreTabButton', () => jest.fn(() => null));
jest.mock('@components/Navigation/NavigationTabBar/useFlatNavTabBarFocus', () => jest.fn());

type SelectedItems = {
    home: boolean | undefined;
    inbox: boolean | undefined;
    expenses: boolean | undefined;
    reports: boolean | undefined;
    more: boolean | undefined;
};

function renderItems(selectedTab: ValueOf<typeof NAVIGATION_TABS>, focus: FlatNavTabBarFocus, moreMenuState: MoreMenuState = 'closed') {
    jest.mocked(useFlatNavTabBarFocus).mockReturnValue(focus);
    render(
        <MoreMenuStateContext.Provider value={[moreMenuState, jest.fn()]}>
            <FlatNavTabBarItems selectedTab={selectedTab} />
        </MoreMenuStateContext.Provider>,
    );
}

function getSelectedItems(): SelectedItems {
    const spendCalls = jest.mocked(FlatNavSpendTabButton).mock.calls.map(([props]) => props);
    return {
        home: jest.mocked(HomeTabButton).mock.lastCall?.[0].isSelected,
        inbox: jest.mocked(InboxTabButton).mock.lastCall?.[0].isSelected,
        expenses: spendCalls.findLast((props) => props.searchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES)?.isSelected,
        reports: spendCalls.findLast((props) => props.searchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS)?.isSelected,
        more: jest.mocked(FlatNavMoreTabButton).mock.lastCall?.[0].isSelected,
    };
}

describe('FlatNavTabBarItems', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('selects Reports while Search shows a search of the Reports section', () => {
        // Given Search on a search of the Reports section
        renderItems(NAVIGATION_TABS.SEARCH, {focusedTabRouteName: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, activeFlatNavSectionID: FLAT_NAV.SECTION.REPORTS});

        // Then only Reports is selected, as the native bar selects the slot of the section
        expect(getSelectedItems()).toEqual({home: false, inbox: false, expenses: false, reports: true, more: false});
    });

    it('selects More with the Accounting entry while Search shows an Accounting search', () => {
        // Given Search on a search of the Accounting section, which only the More menu lists
        renderItems(NAVIGATION_TABS.SEARCH, {focusedTabRouteName: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, activeFlatNavSectionID: FLAT_NAV.SECTION.ACCOUNTING});

        // Then More is selected and shows the Accounting entry, so the bar tells where the user is
        expect(getSelectedItems()).toEqual({home: false, inbox: false, expenses: false, reports: false, more: true});
        expect(jest.mocked(FlatNavMoreTabButton).mock.lastCall?.[0].moreTabItemID).toBe(MORE_MENU.ITEM.ACCOUNTING);
    });

    it('selects More with the Insights entry on Insights', () => {
        // Given the Insights tab, which has no item of its own in the flat nav bar
        renderItems(NAVIGATION_TABS.INSIGHTS, {focusedTabRouteName: SCREENS.INSIGHTS, activeFlatNavSectionID: undefined});

        // Then More stands for it and shows its entry
        expect(getSelectedItems().more).toBe(true);
        expect(jest.mocked(FlatNavMoreTabButton).mock.lastCall?.[0].moreTabItemID).toBe(MORE_MENU.ITEM.INSIGHTS);
    });

    it('selects More over the screen under it while the More menu is open', () => {
        // Given the More menu open over Home
        renderItems(NAVIGATION_TABS.HOME, {focusedTabRouteName: SCREENS.HOME, activeFlatNavSectionID: undefined}, 'open');

        // Then More is selected instead of Home, as on the native bar
        expect(getSelectedItems()).toEqual({home: false, inbox: false, expenses: false, reports: false, more: true});
    });

    it('gives the selection back to the screen once the menu starts closing without a pick', () => {
        // Given the More menu closing over Inbox after a tap outside it
        renderItems(NAVIGATION_TABS.INBOX, {focusedTabRouteName: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, activeFlatNavSectionID: undefined}, 'closing');

        // Then Inbox is selected again, while the card is still fading out
        expect(getSelectedItems()).toEqual({home: false, inbox: true, expenses: false, reports: false, more: false});
    });
});
