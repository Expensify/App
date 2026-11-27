/**
 * The items of the flat nav bar on narrow web: Home, Inbox, Expenses, Reports and More, as on the native bar. Search
 * shows under Expenses, Reports or More by the section of its search, and Insights and Workspaces show under More.
 */
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';
import getFlatNavTabBarSlot from '@libs/Navigation/FlatNavTabBar/getFlatNavTabBarSlot';
import getMoreTabItemID from '@libs/Navigation/MoreMenu/getMoreTabItemID';
import MoreMenuStateContext, {isMoreItemSelectedByMenu} from '@libs/Navigation/MoreMenu/MoreMenuStateContext';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React, {useContext} from 'react';

import FlatNavMoreTabButton from './FlatNavMoreTabButton';
import FlatNavSpendTabButton from './FlatNavSpendTabButton';
import HomeTabButton from './HomeTabButton';
import InboxTabButton from './InboxTabButton';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import useFlatNavTabBarFocus from './useFlatNavTabBarFocus';

type FlatNavTabBarItemsProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

function FlatNavTabBarItems({selectedTab}: FlatNavTabBarItemsProps) {
    const focus = useFlatNavTabBarFocus(selectedTab);
    const [moreMenuState] = useContext(MoreMenuStateContext);
    // While the More menu is up the bar shows More as selected over the screen the user is on.
    const selectedSlot = isMoreItemSelectedByMenu(moreMenuState) ? FLAT_NAV_TAB_BAR_SLOT.MORE : getFlatNavTabBarSlot(focus);
    const isSearchFocused = selectedTab === NAVIGATION_TABS.SEARCH;

    return (
        <>
            <HomeTabButton
                selectedTab={selectedTab}
                isSelected={selectedSlot === FLAT_NAV_TAB_BAR_SLOT.HOME}
            />
            <InboxTabButton
                selectedTab={selectedTab}
                isWideLayout={false}
                isSelected={selectedSlot === FLAT_NAV_TAB_BAR_SLOT.INBOX}
            />
            <FlatNavSpendTabButton
                searchKey={CONST.SEARCH.SEARCH_KEYS.EXPENSES}
                isSearchFocused={isSearchFocused}
                isSelected={selectedSlot === FLAT_NAV_TAB_BAR_SLOT.EXPENSES}
            />
            <FlatNavSpendTabButton
                searchKey={CONST.SEARCH.SEARCH_KEYS.REPORTS}
                isSearchFocused={isSearchFocused}
                isSelected={selectedSlot === FLAT_NAV_TAB_BAR_SLOT.REPORTS}
            />
            <FlatNavMoreTabButton
                isSelected={selectedSlot === FLAT_NAV_TAB_BAR_SLOT.MORE}
                moreTabItemID={getMoreTabItemID(focus)}
            />
        </>
    );
}

export default FlatNavTabBarItems;
