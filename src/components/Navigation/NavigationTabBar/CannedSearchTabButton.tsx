import {PressableWithFeedback} from '@components/Pressable';
import {useSearchQueryContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import useOnyx from '@hooks/useOnyx';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {navigateToSpendTab} from '@libs/SearchNavigationUtils';
import type {SpendTabSearchKey} from '@libs/SearchNavigationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {lastExpensesSearchQuerySelector, lastReportsSearchQuerySelector} from '@src/selectors/SearchFilters';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import React from 'react';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

const LAST_SEARCH_QUERY_SELECTORS = {
    [CONST.SEARCH.SEARCH_KEYS.EXPENSES]: lastExpensesSearchQuerySelector,
    [CONST.SEARCH.SEARCH_KEYS.REPORTS]: lastReportsSearchQuerySelector,
} satisfies Record<SpendTabSearchKey, unknown>;

type CannedSearchTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;

    /** The search this tab opens. It is one every user has, so the tab needs none of the rules deciding visibility. */
    searchKey: SpendTabSearchKey;

    label: string;

    icon: IconAsset;

    /** Every search this tab stands for. The tab reads as selected while any of them is the current search. */
    searchKeys: SearchKey[];

    sentryLabel?: string;
};

/** Bottom-bar tab that opens one of the Spend searches, such as Expenses or Reports. */
function CannedSearchTabButton({selectedTab, searchKey, label, icon, searchKeys, sentryLabel}: CannedSearchTabButtonProps) {
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {currentSearchKey} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const [lastSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: LAST_SEARCH_QUERY_SELECTORS[searchKey]});

    const isSelected = selectedTab === NAVIGATION_TABS.SEARCH && searchKeys.some((key) => key === currentSearchKey);

    const navigateToSearch = singleExecution(() => {
        if (selectedTab === NAVIGATION_TABS.SEARCH && currentSearchKey === searchKey) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            navigateToSpendTab(searchKey, lastSearchQuery, clearSelectedTransactions);
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
