import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type {FilterComponentsProps} from '../FilterComponents';

function useFilterNegatableValue(baseFilterKey: FilterComponentsProps['baseFilterKey'], values: Partial<SearchAdvancedFiltersForm> | undefined) {
    const negatedFilterKey = `${baseFilterKey}${CONST.SEARCH.NOT_MODIFIER}` as SearchAdvancedFiltersKey;
    const negatedValue = values?.[negatedFilterKey];
    const value = negatedValue ?? values?.[baseFilterKey];
    return {isNegated: !!negatedValue, value};
}

export default useFilterNegatableValue;
