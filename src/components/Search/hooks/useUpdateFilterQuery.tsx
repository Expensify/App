import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import {buildFilterQueryWithSortDefaults} from '@libs/SearchQueryUtils';
import {filterValidHasValues} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

function useUpdateFilterQuery(queryJSON: SearchQueryJSON, shouldCloseAfterUpdate: boolean) {
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    function updateFilterQueryParams(values: Partial<SearchAdvancedFiltersForm>) {
        const updatedFilterFormValues: Partial<SearchAdvancedFiltersForm> = {
            ...searchAdvancedFiltersForm,
            ...values,
        };

        if (updatedFilterFormValues.type !== searchAdvancedFiltersForm.type) {
            updatedFilterFormValues.columns = [];
            updatedFilterFormValues.status = CONST.SEARCH.STATUS.EXPENSE.ALL;
            updatedFilterFormValues.has = filterValidHasValues(updatedFilterFormValues.has, updatedFilterFormValues.type, translate);
        }

        if (updatedFilterFormValues.groupBy !== searchAdvancedFiltersForm.groupBy) {
            updatedFilterFormValues.columns = [];
        }

        const queryString =
            buildFilterQueryWithSortDefaults(
                updatedFilterFormValues,
                {view: searchAdvancedFiltersForm.view, groupBy: searchAdvancedFiltersForm.groupBy},
                {sortBy: queryJSON.sortBy, sortOrder: queryJSON.sortOrder},
            ) ?? '';
        if (!queryString) {
            return;
        }

        if (shouldCloseAfterUpdate) {
            close(() => Navigation.setParams({q: queryString, rawQuery: undefined}));
            return;
        }
        Navigation.setParams({q: queryString, rawQuery: undefined});
    }

    return updateFilterQueryParams;
}

export default useUpdateFilterQuery;
