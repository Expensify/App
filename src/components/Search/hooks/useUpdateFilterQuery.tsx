import type {SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {buildFilterQueryWithSortDefaults} from '@libs/SearchQueryUtils';
import {filterValidHasValues} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

function useUpdateFilterQuery(queryJSON: SearchQueryJSON | undefined) {
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    function getUpdatedFilterFormValues(currentValues: Partial<SearchAdvancedFiltersForm>, newValues: Partial<SearchAdvancedFiltersForm>) {
        const updatedFilterFormValues: Partial<SearchAdvancedFiltersForm> = {
            ...currentValues,
            ...newValues,
        };

        if (updatedFilterFormValues.type !== currentValues.type) {
            updatedFilterFormValues.columns = [];
            updatedFilterFormValues.status = CONST.SEARCH.STATUS.EXPENSE.ALL;
            updatedFilterFormValues.has = filterValidHasValues(updatedFilterFormValues.has, updatedFilterFormValues.type, translate);
        }

        if (updatedFilterFormValues.groupBy !== currentValues.groupBy) {
            updatedFilterFormValues.columns = [];
        }

        return updatedFilterFormValues;
    }

    function buildFilterQueryString(values: Partial<SearchAdvancedFiltersForm>) {
        return (
            buildFilterQueryWithSortDefaults(
                values,
                {view: searchAdvancedFiltersForm.view, groupBy: searchAdvancedFiltersForm.groupBy},
                {sortBy: queryJSON?.sortBy, sortOrder: queryJSON?.sortOrder},
            ) ?? ''
        );
    }

    function setFilterQueryParams(values: Partial<SearchAdvancedFiltersForm>) {
        const queryString = buildFilterQueryString(values);
        if (!queryString) {
            return;
        }

        Navigation.setParams({q: queryString, rawQuery: undefined});
    }

    function updateFilterQueryParams(values: Partial<SearchAdvancedFiltersForm>) {
        setFilterQueryParams(getUpdatedFilterFormValues(searchAdvancedFiltersForm, values));
    }

    return {getUpdatedFilterFormValues, setFilterQueryParams, updateFilterQueryParams, buildFilterQueryString};
}

export default useUpdateFilterQuery;
