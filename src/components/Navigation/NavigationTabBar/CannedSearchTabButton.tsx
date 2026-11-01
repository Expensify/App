import {PressableWithFeedback} from '@components/Pressable';
import {useSearchQueryContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import useOnyx from '@hooks/useOnyx';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import type {SearchKey} from '@libs/SearchKeyUtils';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import React from 'react';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

type CannedSearchTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;

    /** The search this tab opens */
    item: SearchTypeMenuItem;

    label: string;

    icon: IconAsset;

    /** Every search this tab stands for. The tab reads as selected while any of them is the current search. */
    searchKeys: SearchKey[];

    sentryLabel?: string;
};

/** Bottom-bar tab that opens one of the Spend searches, such as Expenses or Reports. */
function CannedSearchTabButton({selectedTab, item, label, icon, searchKeys, sentryLabel}: CannedSearchTabButtonProps) {
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {currentSearchKey} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);

    const isSelected = selectedTab === NAVIGATION_TABS.SEARCH && searchKeys.some((key) => key === currentSearchKey);

    const navigateToSearch = singleExecution(() => {
        clearSelectedText();
        interceptAnonymousUser(() => {
            navigateToCannedSpendSearch(item.key, item.searchQuery, getLastSearchQuery(searchFilters, item.key), clearSelectedTransactions);
        });
    });

    return (
        <PressableWithFeedback
            onPress={navigateToSearch}
            role={CONST.ROLE.TAB}
            accessibilityLabel={label}
            accessibilityState={{selected: isSelected}}
            wrapperStyle={styles.flex1}
            style={styles.navigationTabBarItem}
            sentryLabel={sentryLabel}
        >
            <TabBarItem
                icon={icon}
                label={label}
                isSelected={isSelected}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default CannedSearchTabButton;
