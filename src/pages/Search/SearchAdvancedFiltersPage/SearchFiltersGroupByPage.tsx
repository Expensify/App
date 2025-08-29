import React, {useMemo} from 'react';
import SearchFiltersSingleSelectBase from '@components/Search/SearchFiltersSingleSelectBase';
import type {SelectionOption} from '@components/Search/SearchFiltersSingleSelectBase';
import type {SearchGroupBy} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import {getGroupByOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchFiltersGroupByPage() {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const options: Array<SelectionOption<SearchGroupBy>> = useMemo(() => {
        return getGroupByOptions().map((groupOption) => ({
            text: groupOption.text,
            value: groupOption.value,
        }));
    }, []);

    const handleApply = () => {
        // The base component handles updateAdvancedFilters and navigation
    };

    const customApplyLogic = (selectedValue: SearchGroupBy | undefined) => {
        return {groupBy: selectedValue ?? null};
    };

    return (
        <SearchFiltersSingleSelectBase
            titleKey="search.groupBy"
            testID={SearchFiltersGroupByPage.displayName}
            selectedValue={searchAdvancedFiltersForm?.groupBy}
            options={options}
            onApply={handleApply}
            defaultValue={undefined}
            customApplyLogic={customApplyLogic}
        />
    );
}

SearchFiltersGroupByPage.displayName = 'SearchFiltersGroupByPage';

export default SearchFiltersGroupByPage;
