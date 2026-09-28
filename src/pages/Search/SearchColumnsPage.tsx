import ColumnsSettingsList from '@components/ColumnsSettingsList';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchCustomColumnIds} from '@components/Search/types';

import useIsVendorColumnAvailable from '@hooks/useIsVendorColumnAvailable';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues, getCurrentSearchQueryJSON, hasValuesIncludeViolationFilter} from '@libs/SearchQueryUtils';
import {getCustomColumnDefault, getCustomColumns, insertColumnBeforeTotalAmount} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React from 'react';

function SearchColumnsPage() {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const {currentSearchKey} = useSearchQueryContext();
    const isVendorColumnAvailable = useIsVendorColumnAvailable();

    const groupBy = searchAdvancedFiltersForm?.groupBy;
    const queryType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    // Violations data is only returned when these filters are set, so hide the column otherwise.
    const shouldRequireViolationsColumn = hasValuesIncludeViolationFilter(searchAdvancedFiltersForm?.has);

    // The vendor column only exists for workspaces with the vendor feature, so hide it when none of the user's workspaces has it.
    const isColumnAvailable = (column: SearchCustomColumnIds) =>
        (shouldRequireViolationsColumn || column !== CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS) && (isVendorColumnAvailable || column !== CONST.SEARCH.TABLE_COLUMNS.VENDOR);

    const allTypeCustomColumns = getCustomColumns(queryType).filter(isColumnAvailable);
    const allGroupCustomColumns = getCustomColumns(groupBy);
    const defaultGroupCustomColumns = getCustomColumnDefault(groupBy);
    const defaultTypeCustomColumns = [...getCustomColumnDefault(queryType)];
    const currentColumns = [...(searchAdvancedFiltersForm?.columns ?? [])].filter(isColumnAvailable);

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
        if (currentColumns.length > 0) {
            insertColumnBeforeTotalAmount(currentColumns, CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS);
        }
    }

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
            type={queryType}
        />
    );
}

export default SearchColumnsPage;
