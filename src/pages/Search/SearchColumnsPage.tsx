import ColumnsSettingsList from '@components/ColumnsSettingsList';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchCustomColumnIds, SearchQueryJSON} from '@components/Search/types';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getCustomColumnDefault, getCustomColumns, isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React from 'react';
import Onyx from 'react-native-onyx';

// Compares two parsed queries while ignoring the fields that legitimately differ on a columns-only change:
// `columns` is the delta being saved, `hash` embeds the columns, and `inputQuery`, `rawFilterList`, and
// `isViewExplicitlySet` (derived from `rawFilterList`) are raw-formatting artifacts that differ between a
// route-parsed query and a form-rebuilt one. Every semantic field (type, status, filters, groupBy, view,
// policyID, sort, limit) still participates, so any real query change keeps the two unequal.
function areSearchQueriesEqualExceptColumns(currentQueryJSON: Readonly<SearchQueryJSON> | undefined, updatedQueryJSON: Readonly<SearchQueryJSON> | undefined) {
    if (!currentQueryJSON || !updatedQueryJSON) {
        return false;
    }

    return (
        JSON.stringify({...currentQueryJSON, columns: undefined, hash: undefined, inputQuery: undefined, rawFilterList: undefined, isViewExplicitlySet: undefined}) ===
        JSON.stringify({...updatedQueryJSON, columns: undefined, hash: undefined, inputQuery: undefined, rawFilterList: undefined, isViewExplicitlySet: undefined})
    );
}

function SearchColumnsPage() {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const {isOffline} = useNetwork();
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const {currentSearchResults, shouldUseLiveData} = useSearchResultsContext();

    const groupBy = searchAdvancedFiltersForm?.groupBy;
    const queryType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    const allTypeCustomColumns = getCustomColumns(queryType);
    const allGroupCustomColumns = getCustomColumns(groupBy);
    const defaultGroupCustomColumns = getCustomColumnDefault(groupBy);
    const defaultTypeCustomColumns = getCustomColumnDefault(queryType);

    const currentColumns = searchAdvancedFiltersForm?.columns ?? [];

    // We need at least one element with flex1 in the table to ensure the table looks good in the UI, so we don't allow removing the total columns
    // since it makes sense for them to show up in an expense management App and it fixes the layout issues.
    const requiredColumns = new Set<SearchCustomColumnIds>([
        CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        CONST.SEARCH.TABLE_COLUMNS.TOTAL,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER,
    ]);

    const applyChanges = (selectedColumnIds: SearchCustomColumnIds[]) => {
        const updatedAdvancedFilters: Partial<SearchAdvancedFiltersForm> = {
            ...searchAdvancedFiltersForm,
            columns: selectedColumnIds,
        };

        const queryString = buildQueryStringFromFilterFormValues(updatedAdvancedFilters, {
            sortBy: currentSearchQueryJSON?.sortBy,
            sortOrder: currentSearchQueryJSON?.sortOrder,
        });
        const updatedQueryJSON = buildSearchQueryJSON(queryString);

        const navigateToUpdatedQuery = () => {
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
        };

        // While offline, a columns-only save navigates to a query whose primary hash has no snapshot yet
        // (columns are part of the hash), and Search would show the full-page offline blocker even though
        // the same result set is already loaded. Reuse the loaded snapshot for the destination hash instead.
        // To-do searches (a subset of suggested searches) are excluded: their results are synthesized from
        // live data rather than read from a snapshot, so there is no snapshot to copy.
        if (
            isOffline &&
            !shouldUseLiveData &&
            currentSearchQueryJSON &&
            updatedQueryJSON &&
            currentSearchResults?.data &&
            isSearchDataLoaded(currentSearchResults, currentSearchQueryJSON) &&
            areSearchQueriesEqualExceptColumns(currentSearchQueryJSON, updatedQueryJSON)
        ) {
            const updatedSnapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${updatedQueryJSON.hash}` as const;
            // Transient request state is dropped from the copy: no request ever runs against the destination
            // hash, so a copied stale `errors` or `search.isLoading: true` would never be cleared and would
            // block the post-reconnect refetch for that hash.
            const copiedSearchResults = {...currentSearchResults, errors: undefined, search: {...currentSearchResults.search, isLoading: false}};
            // Navigate only after the copy settles so the destination hash has data the moment Search reads
            // it; if the write fails, still navigate to preserve the previous behavior.
            void Onyx.set(updatedSnapshotKey, copiedSearchResults).then(navigateToUpdatedQuery, navigateToUpdatedQuery);
            return;
        }

        navigateToUpdatedQuery();
    };

    return (
        <ColumnsSettingsList
            allColumns={allTypeCustomColumns}
            defaultSelectedColumns={defaultTypeCustomColumns}
            currentColumns={currentColumns}
            requiredColumns={requiredColumns}
            groupBy={groupBy}
            groupColumns={allGroupCustomColumns}
            defaultGroupColumns={defaultGroupCustomColumns}
            onSave={applyChanges}
        />
    );
}

export default SearchColumnsPage;
