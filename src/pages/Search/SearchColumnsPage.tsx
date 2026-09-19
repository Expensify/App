import ColumnsSettingsList from '@components/ColumnsSettingsList';
import useSearchDataType from '@components/Search/hooks/useSearchDataType';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchCustomColumnIds} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues, getCurrentSearchQueryJSON, hasValuesIncludeViolationFilter, isDefaultExpensesQuery, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {getColumnsToShow, getCustomColumnDefault, getCustomColumns, getValidGroupBy, insertColumnBeforeTotalAmount} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React from 'react';

function SearchColumnsPage() {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    // Read the snapshot the table is rendering, not the raw one: `currentSearchResults` has no `data` while a
    // sort is in flight and when a search resolves empty, and seeding off that made this picker fall back to
    // the static defaults while the table still showed the old columns.
    const {displayedSearchResults} = useSearchResultsContext();
    const searchDataType = useSearchDataType(displayedSearchResults);
    const {accountID} = useCurrentUserPersonalDetails();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();

    const groupBy = searchAdvancedFiltersForm?.groupBy;
    const queryType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    // Violations data is only returned when these filters are set, so hide the column otherwise.
    const shouldRequireViolationsColumn = hasValuesIncludeViolationFilter(searchAdvancedFiltersForm?.has);

    const allTypeCustomColumns = getCustomColumns(queryType).filter((column) => shouldRequireViolationsColumn || column !== CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS);
    const allGroupCustomColumns = getCustomColumns(groupBy);
    const defaultGroupCustomColumns = getCustomColumnDefault(groupBy);
    const defaultTypeCustomColumns = [...getCustomColumnDefault(queryType)];
    const savedColumns = [...(searchAdvancedFiltersForm?.columns ?? [])].filter((column) => shouldRequireViolationsColumn || column !== CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS);

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
        CONST.SEARCH.TABLE_COLUMNS.GROUP_DAY,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER,
    ]);

    if (shouldRequireViolationsColumn) {
        requiredColumns.add(CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS);
        insertColumnBeforeTotalAmount(defaultTypeCustomColumns, CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS);
        if (savedColumns.length > 0) {
            insertColumnBeforeTotalAmount(savedColumns, CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS);
        }
    }

    // With no saved selection the table derives its columns from the data (e.g. Description shows up as soon
    // as one expense has one), so seed the picker from that same set. Seeding from the static default list
    // instead would show those columns as unchecked while the table renders them, and saving would pin the
    // static list rather than what is on screen.
    //
    // The seed describes the table that is on screen, so its arguments come from the query and the snapshot -
    // the same source useSearchSnapshot uses - and not from the advanced-filters form. The form is only a
    // mirror of the query and stops being written while category data loads, so it can still describe the
    // previous search while the new snapshot is already rendered.
    const seedGroupBy = getValidGroupBy(currentSearchQueryJSON?.groupBy);
    const renderedColumns = ((): SearchCustomColumnIds[] => {
        // Nothing to seed when the user already has a saved selection, and nothing to seed for a grouped
        // search either: getColumnsToShow returns only GROUP_* columns there, none of which are selectable
        // in this picker, so the result would always be empty. Returning [] keeps ColumnsSettingsList on its
        // own group-defaults fallback instead of handing it an empty type-column selection.
        if (savedColumns.length > 0 || seedGroupBy || !displayedSearchResults?.data) {
            return [];
        }

        const selectableColumns = new Set<string>(allTypeCustomColumns);

        return getColumnsToShow({
            currentAccountID: accountID,
            data: displayedSearchResults.data,
            type: searchDataType,
            shouldUseStrictDefaultExpenseColumns: currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES && !!currentSearchQueryJSON && isDefaultExpensesQuery(currentSearchQueryJSON),
            fallbackPolicyID: policyForMovingExpensesID,
            sortBy: currentSearchQueryJSON?.sortBy,
            shouldShowViolationsColumn: queryHasViolationFilter(currentSearchQueryJSON),
        }).filter((column): column is SearchCustomColumnIds => selectableColumns.has(column));
    })();

    const currentColumns = savedColumns.length > 0 ? savedColumns : renderedColumns;

    const applyChanges = (selectedColumnIds: SearchCustomColumnIds[]) => {
        const updatedAdvancedFilters: Partial<SearchAdvancedFiltersForm> = {
            ...searchAdvancedFiltersForm,
            columns: selectedColumnIds,
        };

        const currentQueryJSON = getCurrentSearchQueryJSON();
        const queryString = buildQueryStringFromFilterFormValues(updatedAdvancedFilters, {
            sortBy: currentQueryJSON?.sortBy,
            sortOrder: currentQueryJSON?.sortOrder,
        });

        // Only the columns change, so it's still the same search - carry the key over rather than letting it be
        // re-derived from the new query.
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString, searchKey: currentSearchKey}), {forceReplace: true});
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
