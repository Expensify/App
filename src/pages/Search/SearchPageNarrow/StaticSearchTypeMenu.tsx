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

import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';
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

    // Saved searches are keyed by their raw hash rather than by a SearchKey, so the tab keys widen to string.
    const tabs: Array<TabSelectorBaseItem<SearchKey>> = [
        {key: reportsSearch.key, icon: expensifyIcons.Document, title: translate(reportsSearch.translationPath)},
        {key: expensesSearch.key, icon: expensifyIcons.Receipt, title: translate(expensesSearch.translationPath)},
    ];

    if (hasGroupPolicy) {
        tabs.push({key: submitSearch.key, icon: expensifyIcons.Pencil, title: translate(submitSearch.translationPath)});
    }

    if (activeSavedSearch && currentSearchKey) {
        tabs.push({key: currentSearchKey, icon: expensifyIcons[getSavedSearchIconName(activeSavedSearch.query)], title: activeSavedSearch.name});
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
