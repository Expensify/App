import {useSearchQueryActions} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {markQueryAsRefinement} from '@libs/SearchQueryRefinement';
import {buildFilterQueryWithSortDefaults, buildSearchQueryJSON, hasValuesIncludeViolationFilter, VIOLATION_HAS_VALUES} from '@libs/SearchQueryUtils';
import {filterValidHasValues} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

function useUpdateFilterQuery(queryJSON: SearchQueryJSON | undefined) {
    const {translate} = useLocalize();
    const {getSearchKeyForQuery} = useSearchQueryActions();
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    function getUpdatedFilterFormValues(currentValues: Partial<SearchAdvancedFiltersForm>, newValues: Partial<SearchAdvancedFiltersForm>) {
        const updatedFilterFormValues: Partial<SearchAdvancedFiltersForm> = {
            ...currentValues,
            ...newValues,
        };

        if (updatedFilterFormValues.type !== currentValues.type) {
            updatedFilterFormValues.columns = [];
            updatedFilterFormValues.status = undefined;
            updatedFilterFormValues.statusNot = undefined;
            updatedFilterFormValues.has = filterValidHasValues(updatedFilterFormValues.has, updatedFilterFormValues.type, translate);
            updatedFilterFormValues.hasNot = filterValidHasValues(updatedFilterFormValues.hasNot, updatedFilterFormValues.type, translate);
        }

        // The filters UI pairs the violation grouping with a violation has value, so the Has pill shows which stages the
        // groups count. Choosing the grouping adds both stages, and removing them (by clearing the Has pill, or by
        // switching to a type that has no violations) drops the grouping. A typed query without one is left alone,
        // since Auth reads both stages for it.
        if (updatedFilterFormValues.groupBy === CONST.SEARCH.GROUP_BY.VIOLATION && !hasValuesIncludeViolationFilter(updatedFilterFormValues.has)) {
            if (currentValues.groupBy !== CONST.SEARCH.GROUP_BY.VIOLATION) {
                updatedFilterFormValues.has = [...(updatedFilterFormValues.has ?? []), ...VIOLATION_HAS_VALUES];
            } else if (hasValuesIncludeViolationFilter(currentValues.has)) {
                updatedFilterFormValues.groupBy = undefined;
            }
        }

        if (updatedFilterFormValues.groupBy !== currentValues.groupBy) {
            updatedFilterFormValues.columns = [];
        }

        return updatedFilterFormValues;
    }

    function setFilterQueryParams(values: Partial<SearchAdvancedFiltersForm>) {
        const queryString = buildFilterQueryWithSortDefaults(values, {view: searchAdvancedFiltersForm.view, groupBy: searchAdvancedFiltersForm.groupBy}, queryJSON ?? {}, policies) ?? '';
        if (!queryString) {
            return;
        }

        // Mark the query as a refinement so SearchPage holds the previous results while it loads
        markQueryAsRefinement(queryString);

        const shouldResetSearchKey = !!values.type && values.type !== searchAdvancedFiltersForm.type;

        Navigation.setParams({q: queryString, rawQuery: undefined, ...(shouldResetSearchKey && {searchKey: getSearchKeyForQuery(buildSearchQueryJSON(queryString))})});
    }

    function updateFilterQueryParams(values: Partial<SearchAdvancedFiltersForm>) {
        setFilterQueryParams(getUpdatedFilterFormValues(searchAdvancedFiltersForm, values));
    }

    return {getUpdatedFilterFormValues, setFilterQueryParams, updateFilterQueryParams};
}

export default useUpdateFilterQuery;
