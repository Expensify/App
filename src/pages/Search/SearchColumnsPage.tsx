import ColumnsSettingsList from '@components/ColumnsSettingsList';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useSearchColumnsToShow from '@components/Search/hooks/useSearchColumnsToShow';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchCustomColumnIds} from '@components/Search/types';

import useIsVendorColumnAvailable from '@hooks/useIsVendorColumnAvailable';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues, getCurrentSearchQueryJSON, hasValuesIncludeViolationFilter} from '@libs/SearchQueryUtils';
import {getCustomColumnDefault, getCustomColumns, getValidGroupBy, insertColumnBeforeTotalAmount, isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React from 'react';

function SearchColumnsPage() {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const {currentSearchResults, shouldUseLiveData} = useSearchResultsContext();
    const {isOffline} = useNetwork();
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
    const savedColumns = [...(searchAdvancedFiltersForm?.columns ?? [])].filter(isColumnAvailable);

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
    // The seed comes from the same hook the table uses, reading the query and the snapshot rather than the
    // advanced-filters form. The form is only a mirror of the query and stops being written while category
    // data loads, so it can still describe the previous search while the new snapshot is already rendered.
    //
    // Nothing to seed when the user already has a saved selection, and nothing to seed for a grouped search
    // either: the table renders only GROUP_* columns there, none of which are selectable in this picker.
    // Passing no snapshot keeps ColumnsSettingsList on its own group-defaults fallback instead of handing it
    // an empty type-column selection.
    const shouldSeedFromTable = savedColumns.length === 0 && !getValidGroupBy(currentSearchQueryJSON?.groupBy);
    const tableColumns = useSearchColumnsToShow(currentSearchQueryJSON, shouldSeedFromTable ? currentSearchResults : undefined);
    const selectableColumns = new Set<string>(allTypeCustomColumns);
    const renderedColumns = tableColumns.filter((column): column is SearchCustomColumnIds => selectableColumns.has(column));

    const currentColumns = savedColumns.length > 0 ? savedColumns : renderedColumns;

    // A sort swaps in a new snapshot that has no data until the server responds, while the table keeps showing
    // the previous rows. ColumnsSettingsList only reads its seed on mount, so wait for the snapshot instead of
    // seeding from the static defaults and letting a Save pin them.
    const isSeedPending =
        shouldSeedFromTable &&
        !isOffline &&
        !shouldUseLiveData &&
        !!currentSearchQueryJSON &&
        !currentSearchResults?.data &&
        !isSearchDataLoaded(currentSearchResults, currentSearchQueryJSON);

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

    if (isSeedPending) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

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
