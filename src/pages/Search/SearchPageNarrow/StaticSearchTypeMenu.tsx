// Static twin of SearchTypeMenuNarrow - used for fast perceived performance.
// Keep hooks and Onyx subscriptions to an absolute minimum; add new ones only
// when strictly necessary. UI must stay visually identical to the interactive version.
import React, {useMemo} from 'react';
import type {SearchQueryJSON} from '@components/Search/types';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getSuggestedSearches} from '@libs/SearchUIUtils';
import {SearchTypeMenuNarrowContent} from '@pages/Search/SearchTypeMenuNarrow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import staticPolicyInfoSelector from './staticPolicyInfoSelector';

const suggestedSearches = getSuggestedSearches();
const reportsSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.REPORTS];
const expensesSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPENSES];
const submitSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SUBMIT];

function getActiveKey(similarSearchHash: number, hasPaidGroupPolicy: boolean): string {
    const candidates = [reportsSearch, expensesSearch, ...(hasPaidGroupPolicy ? [submitSearch] : [])];
    return candidates.find((entry) => similarSearchHash === entry.similarSearchHash)?.key ?? reportsSearch.key;
}

function StaticSearchTypeMenu({queryJSON}: {queryJSON: SearchQueryJSON}) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Receipt', 'Document', 'Pencil']);
    const [policyInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: staticPolicyInfoSelector});
    const hasPaidGroupPolicy = policyInfo?.hasPaidGroupPolicy ?? false;

    const tabs: TabSelectorBaseItem[] = useMemo(() => {
        const result: TabSelectorBaseItem[] = [
            {key: reportsSearch.key, icon: expensifyIcons.Document, title: translate(reportsSearch.translationPath)},
            {key: expensesSearch.key, icon: expensifyIcons.Receipt, title: translate(expensesSearch.translationPath)},
        ];

        if (hasPaidGroupPolicy) {
            result.push({key: submitSearch.key, icon: expensifyIcons.Pencil, title: translate(submitSearch.translationPath)});
        }

        return result;
    }, [expensifyIcons, translate, hasPaidGroupPolicy]);

    const activeKey = useMemo(() => getActiveKey(queryJSON.similarSearchHash, hasPaidGroupPolicy), [queryJSON.similarSearchHash, hasPaidGroupPolicy]);

    return (
        <SearchTypeMenuNarrowContent
            tabs={tabs}
            activeTabKey={activeKey}
        />
    );
}

export default StaticSearchTypeMenu;
