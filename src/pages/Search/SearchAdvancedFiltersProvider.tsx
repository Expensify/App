import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useOnyx from '@hooks/useOnyx';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React, {useState} from 'react';

type SearchAdvancedFiltersValue = {
    currentDraftFilters: Partial<SearchAdvancedFiltersForm>;
    shouldShowResetFilters: boolean;
};

type SearchAdvancedFiltersActionValue = {
    setDraftFilters: (values: Partial<SearchAdvancedFiltersForm>) => void;
    applyFilters: () => void;
    resetFilters: () => void;
};

const SearchAdvancedFiltersContext = React.createContext<SearchAdvancedFiltersValue>({
    currentDraftFilters: {},
    shouldShowResetFilters: false,
});

const SearchAdvancedFiltersActionContext = React.createContext<SearchAdvancedFiltersActionValue>({
    setDraftFilters: () => {},
    applyFilters: () => {},
    resetFilters: () => {},
});

type SearchAdvancedFiltersProviderProps = {
    children: React.ReactNode;
};

function SearchAdvancedFiltersProvider({children}: SearchAdvancedFiltersProviderProps) {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const {currentDefaultSearchQueryString, currentSearchQueryJSON, currentSearchHash, currentDefaultSearchHash} = useSearchQueryContext();
    const {getUpdatedFilterFormValues, setFilterQueryParams} = useUpdateFilterQuery(currentSearchQueryJSON);

    const [values, setValues] = useState<Partial<SearchAdvancedFiltersForm>>(searchAdvancedFiltersForm ?? {});

    const applyFilters = () => {
        Navigation.dismissModal({afterTransition: () => setFilterQueryParams(values)});
    };

    const resetFilters = () => {
        Navigation.dismissModal({
            afterTransition: () => {
                if (currentDefaultSearchQueryString) {
                    Navigation.setParams({q: currentDefaultSearchQueryString, rawQuery: undefined});
                } else {
                    setFilterQueryParams({[CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE]: searchAdvancedFiltersForm?.type});
                }
                setSearchContext(false);
            },
        });
    };

    const setDraftFilters = (newValues: Partial<SearchAdvancedFiltersForm>) => {
        setValues((prevValues) => getUpdatedFilterFormValues(prevValues, newValues));
    };

    const searchAdvancedFiltersValue: SearchAdvancedFiltersValue = {
        currentDraftFilters: values,
        shouldShowResetFilters: currentDefaultSearchHash
            ? currentSearchHash !== currentDefaultSearchHash
            : // Show the reset button only if a non-"type" filter is applied.
              Object.values(searchAdvancedFiltersForm ?? {}).length > 1,
    };

    const searchAdvancedFiltersActionValue: SearchAdvancedFiltersActionValue = {
        applyFilters,
        resetFilters,
        setDraftFilters,
    };

    return (
        <SearchAdvancedFiltersContext.Provider value={searchAdvancedFiltersValue}>
            <SearchAdvancedFiltersActionContext.Provider value={searchAdvancedFiltersActionValue}>{children}</SearchAdvancedFiltersActionContext.Provider>
        </SearchAdvancedFiltersContext.Provider>
    );
}

export default SearchAdvancedFiltersProvider;
export {SearchAdvancedFiltersContext, SearchAdvancedFiltersActionContext};
