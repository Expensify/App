import {useSession} from '@components/OnyxListItemProvider';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getSuggestedSearches} from '@libs/SearchUIUtils';

import {SearchTypeMenuNarrowContent} from '@pages/Search/SearchTypeMenuNarrow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

// Static twin of SearchTypeMenuNarrow - used for fast perceived performance.
// Keep hooks and Onyx subscriptions to an absolute minimum; add new ones only
// when strictly necessary. UI must stay visually identical to the interactive version.
import React from 'react';

import staticPolicyInfoSelector from './staticPolicyInfoSelector';

function StaticSearchTypeMenu({queryJSON}: {queryJSON: SearchQueryJSON}) {
    const {translate} = useLocalize();
    const {currentSearchKey} = useSearchQueryContext();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Receipt', 'Document', 'Pencil']);
    const [policyInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: staticPolicyInfoSelector});
    const hasGroupPolicy = policyInfo?.hasGroupPolicy ?? false;
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

    if (hasGroupPolicy) {
        tabs.push({key: submitSearch.key, icon: expensifyIcons.Pencil, title: translate(submitSearch.translationPath)});
    }

    const fallbackActiveKey = queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE ? expensesSearch.key : reportsSearch.key;
    const activeKey = tabs.some((tab) => tab.key === currentSearchKey) ? currentSearchKey : fallbackActiveKey;

    return (
        <SearchTypeMenuNarrowContent
            tabs={tabs}
            activeTabKey={activeKey}
        />
    );
}

export default StaticSearchTypeMenu;
