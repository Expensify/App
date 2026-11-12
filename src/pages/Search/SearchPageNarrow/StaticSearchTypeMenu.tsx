// Static twin of SearchTypeMenuNarrow - used for fast perceived performance.
// Keep hooks and Onyx subscriptions to an absolute minimum; add new ones only
// when strictly necessary. UI must stay visually identical to the interactive version.
import {useSession} from '@components/OnyxListItemProvider';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import useActiveSavedSearch from '@hooks/useActiveSavedSearch';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import type {SearchKey} from '@libs/SearchKeyUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getSavedSearchIconName, getSuggestedSearches, SAVED_SEARCH_ICON_NAMES} from '@libs/SearchUIUtils';

import {SearchTypeMenuNarrowContent} from '@pages/Search/SearchTypeMenuNarrow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import staticPolicyInfoSelector from './staticPolicyInfoSelector';

function getActiveKey(similarSearchHash: number, hasGroupPolicy: boolean, searches: Record<string, SearchTypeMenuItem>): SearchKey {
    const reportsSearch = searches[CONST.SEARCH.SEARCH_KEYS.REPORTS];
    const expensesSearch = searches[CONST.SEARCH.SEARCH_KEYS.EXPENSES];
    const submitSearch = searches[CONST.SEARCH.SEARCH_KEYS.SUBMIT];
    const candidates = [reportsSearch, expensesSearch, ...(hasGroupPolicy ? [submitSearch] : [])];
    return candidates.find((entry) => similarSearchHash === entry.similarSearchHash)?.key ?? reportsSearch.key;
}

function StaticSearchTypeMenu({queryJSON}: {queryJSON: SearchQueryJSON}) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Receipt', 'Document', 'Pencil', ...SAVED_SEARCH_ICON_NAMES]);
    const {currentSearchKey} = useSearchQueryContext();
    const [policyInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: staticPolicyInfoSelector});
    const activeSavedSearch = useActiveSavedSearch();
    const hasGroupPolicy = policyInfo?.hasGroupPolicy ?? false;
    const session = useSession();
    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    const suggestedSearches = getSuggestedSearches(accountID);
    const reportsSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.REPORTS];
    const expensesSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPENSES];
    const submitSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SUBMIT];

    const tabs: Array<TabSelectorBaseItem<SearchKey>> = [
        {key: reportsSearch.key, icon: expensifyIcons.Document, title: translate(reportsSearch.translationPath), sentryLabel: CONST.SENTRY_LABEL.SEARCH.TYPE_MENU_TAB},
        {key: expensesSearch.key, icon: expensifyIcons.Receipt, title: translate(expensesSearch.translationPath), sentryLabel: CONST.SENTRY_LABEL.SEARCH.TYPE_MENU_TAB},
    ];

    if (hasGroupPolicy) {
        tabs.push({key: submitSearch.key, icon: expensifyIcons.Pencil, title: translate(submitSearch.translationPath), sentryLabel: CONST.SENTRY_LABEL.SEARCH.TYPE_MENU_TAB});
    }

    if (activeSavedSearch && currentSearchKey) {
        tabs.push({
            key: currentSearchKey,
            icon: expensifyIcons[getSavedSearchIconName(activeSavedSearch.query)],
            title: activeSavedSearch.name,
            sentryLabel: CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_TAB,
        });
    }

    const activeKey = activeSavedSearch ? currentSearchKey : getActiveKey(queryJSON.similarSearchHash, hasGroupPolicy, suggestedSearches);

    return (
        <SearchTypeMenuNarrowContent
            tabs={tabs}
            activeTabKey={activeKey}
        />
    );
}

export default StaticSearchTypeMenu;
