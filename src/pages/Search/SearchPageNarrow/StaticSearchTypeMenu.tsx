// Static twin of SearchTypeMenuNarrow - used for fast perceived performance.
// Keep hooks and Onyx subscriptions to an absolute minimum; add new ones only
// when strictly necessary. UI must stay visually identical to the interactive version.
import React from 'react';
import {useSession} from '@components/OnyxListItemProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';
import {SearchTypeMenuNarrowContent} from '@pages/Search/SearchTypeMenuNarrow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import staticPolicyInfoSelector from './staticPolicyInfoSelector';

type SavedSearchMinimal = {
    name: string;
    query: string;
    pendingAction?: string;
};

function getActiveKey(similarSearchHash: number, hasPaidGroupPolicy: boolean, searches: Record<string, SearchTypeMenuItem>): string {
    const reportsSearch = searches[CONST.SEARCH.SEARCH_KEYS.REPORTS];
    const expensesSearch = searches[CONST.SEARCH.SEARCH_KEYS.EXPENSES];
    const submitSearch = searches[CONST.SEARCH.SEARCH_KEYS.SUBMIT];
    const candidates = [reportsSearch, expensesSearch, ...(hasPaidGroupPolicy ? [submitSearch] : [])];
    return candidates.find((entry) => similarSearchHash === entry.similarSearchHash)?.key ?? reportsSearch.key;
}

function getActiveSavedSearch(savedSearches: Record<string, SavedSearchMinimal> | undefined, hash: number, isOffline: boolean): {key: string; title: string} | undefined {
    if (!savedSearches) {
        return undefined;
    }
    const entry = Object.entries(savedSearches).find(([key, item]) => {
        if (Number(key) !== hash) {
            return false;
        }
        if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isOffline) {
            return false;
        }
        return true;
    });
    if (!entry) {
        return undefined;
    }
    const [key, item] = entry;
    return {key, title: item.name || item.query || key};
}

function StaticSearchTypeMenu({queryJSON}: {queryJSON: SearchQueryJSON}) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Receipt', 'Document', 'Pencil', 'Bookmark']);
    const [policyInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: staticPolicyInfoSelector});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const hasPaidGroupPolicy = policyInfo?.hasPaidGroupPolicy ?? false;
    const session = useSession();
    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    const suggestedSearches = getSuggestedSearches(accountID);
    const reportsSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.REPORTS];
    const expensesSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPENSES];
    const submitSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SUBMIT];

    const tabs: TabSelectorBaseItem[] = [
        {key: reportsSearch.key, icon: expensifyIcons.Document, title: translate(reportsSearch.translationPath)},
        {key: expensesSearch.key, icon: expensifyIcons.Receipt, title: translate(expensesSearch.translationPath)},
    ];

    if (hasPaidGroupPolicy) {
        tabs.push({key: submitSearch.key, icon: expensifyIcons.Pencil, title: translate(submitSearch.translationPath)});
    }

    const activeSavedSearch = getActiveSavedSearch(savedSearches as Record<string, SavedSearchMinimal> | undefined, queryJSON.hash, isOffline);
    if (activeSavedSearch) {
        tabs.push({key: activeSavedSearch.key, icon: expensifyIcons.Bookmark, title: activeSavedSearch.title});
    }

    const activeKey = activeSavedSearch?.key ?? getActiveKey(queryJSON.similarSearchHash, hasPaidGroupPolicy, suggestedSearches);

    return (
        <SearchTypeMenuNarrowContent
            tabs={tabs}
            activeTabKey={activeKey}
        />
    );
}

export default StaticSearchTypeMenu;
