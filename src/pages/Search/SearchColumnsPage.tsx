import React from 'react';
import ColumnsSettingsList from '@components/ColumnsSettingsList';
import type {SearchCustomColumnIds} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getCustomColumnDefault, getCustomColumns} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

function SearchColumnsPage() {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

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

        const currentQueryJSON = getCurrentSearchQueryJSON();
        const queryString = buildQueryStringFromFilterFormValues(updatedAdvancedFilters, {
            sortBy: currentQueryJSON?.sortBy,
            sortOrder: currentQueryJSON?.sortOrder,
            limit: currentQueryJSON?.limit,
        });

        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
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
