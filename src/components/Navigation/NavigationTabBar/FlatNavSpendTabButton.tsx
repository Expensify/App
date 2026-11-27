/** The Expenses or Reports tab of the flat nav bar on narrow web, which opens Search on the query the user last left that search with. */
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchQueryContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import openSearchFromTabBar from '@libs/Navigation/FlatNavTabBar/openSearchFromTabBar';
import {getSpendTabRoute, navigateToSpendTab} from '@libs/SearchNavigationUtils';
import type {SpendTabSearchKey} from '@libs/SearchNavigationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {lastExpensesSearchQuerySelector, lastReportsSearchQuerySelector} from '@src/selectors/SearchFilters';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

import TabBarItem from './TabBarItem';
import useSignedInLinkRoute from './useSignedInLinkRoute';

type FlatNavSpendTabButtonProps = {
    /** The search the tab opens */
    searchKey: SpendTabSearchKey;

    /** Whether the Search page is the one on screen */
    isSearchFocused: boolean;

    isSelected: boolean;
};

function FlatNavSpendTabButton({searchKey, isSearchFocused, isSelected}: FlatNavSpendTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Receipt', 'Document']);
    const isReportsTab = searchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS;
    const [lastSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: isReportsTab ? lastReportsSearchQuerySelector : lastExpensesSearchQuerySelector});
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {currentSearchKey} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const getSignedInLinkRoute = useSignedInLinkRoute();
    const label = translate(isReportsTab ? 'common.reports' : 'common.expenses');

    const openSpendTab = () => {
        // A tap on the search already on screen does nothing, as on the native bar.
        if (isSearchFocused && currentSearchKey === searchKey) {
            return;
        }
        openSearchFromTabBar(() => navigateToSpendTab(searchKey, lastSearchQuery, clearSelectedTransactions), isSearchFocused, session);
    };

    return (
        <PressableWithFeedback
            onPress={openSpendTab}
            linkRoute={getSignedInLinkRoute(getSpendTabRoute(searchKey, lastSearchQuery))}
            role={CONST.ROLE.TAB}
            accessibilityLabel={label}
            accessibilityState={{selected: isSelected}}
            wrapperStyle={styles.navigationTabBarSlot}
            style={styles.navigationTabBarItem}
            sentryLabel={isReportsTab ? CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS : CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.EXPENSES}
        >
            <TabBarItem
                icon={isReportsTab ? expensifyIcons.Document : expensifyIcons.Receipt}
                label={label}
                isSelected={isSelected}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default FlatNavSpendTabButton;
