import React, {useMemo} from 'react';
import SearchFiltersSingleSelectBase from '@components/Search/SearchFiltersSingleSelectBase';
import type {SelectionOption} from '@components/Search/SearchFiltersSingleSelectBase';
import useOnyx from '@hooks/useOnyx';
import {getTypeOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

function SearchFiltersTypePage() {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const options: Array<SelectionOption<SearchDataTypes>> = useMemo(() => {
        return getTypeOptions(allPolicies, session?.email).map((typeOption) => ({
            text: typeOption.text,
            value: typeOption.value,
        }));
    }, [allPolicies, session?.email]);

    const handleApply = () => {
        // The base component handles updateAdvancedFilters and navigation
    };

    const customApplyLogic = (selectedValue: SearchDataTypes | undefined) => {
        const currentType = searchAdvancedFiltersForm?.type;
        const hasTypeChanged = selectedValue !== currentType;
        
        return {
            type: selectedValue,
            ...(hasTypeChanged && {
                groupBy: null,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            }),
        };
    };

    return (
        <SearchFiltersSingleSelectBase
            titleKey="common.type"
            testID={SearchFiltersTypePage.displayName}
            selectedValue={searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE}
            options={options}
            onApply={handleApply}
            defaultValue={CONST.SEARCH.DATA_TYPES.EXPENSE}
            useFooterButtons
            customApplyLogic={customApplyLogic}
        />
    );
}

SearchFiltersTypePage.displayName = 'SearchFiltersTypePage';

export default SearchFiltersTypePage;
