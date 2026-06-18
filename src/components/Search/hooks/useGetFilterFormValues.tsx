import {isFilterNegatable} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {FilterComponentsProps} from '../FilterComponents';

function useGetFilterFormValues() {
    function getFilterFormValues<K extends FilterComponentsProps['baseFilterKey']>(
        filterKey: K,
        value: SearchAdvancedFiltersForm[K] | undefined,
        isNegated: boolean,
    ): Partial<SearchAdvancedFiltersForm> {
        const update: Partial<SearchAdvancedFiltersForm> = {};
        if (isFilterNegatable(filterKey)) {
            const negatedFilterKey = `${filterKey}${CONST.SEARCH.NOT_MODIFIER}` as K;
            update[negatedFilterKey] = isNegated ? value : undefined;
            update[filterKey] = isNegated ? undefined : value;
        } else {
            update[filterKey] = value;
        }
        return update;
    }

    return getFilterFormValues;
}

export default useGetFilterFormValues;
