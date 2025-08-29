import React, {useMemo} from 'react';
import SearchFiltersSingleSelectBase from '@components/Search/SearchFiltersSingleSelectBase';
import type {SelectionOption} from '@components/Search/SearchFiltersSingleSelectBase';
import type {SearchWithdrawalType} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getWithdrawalTypeOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchFiltersWithdrawalTypePage() {
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const options: Array<SelectionOption<SearchWithdrawalType>> = useMemo(() => {
        return getWithdrawalTypeOptions(translate).map((withdrawalTypeOption) => ({
            text: withdrawalTypeOption.text,
            value: withdrawalTypeOption.value,
        }));
    }, [translate]);

    const handleApply = () => {
        // The base component handles updateAdvancedFilters and navigation
    };

    const customApplyLogic = (selectedValue: SearchWithdrawalType | undefined) => {
        return {withdrawalType: selectedValue ?? null};
    };

    return (
        <SearchFiltersSingleSelectBase
            titleKey="search.withdrawalType"
            testID={SearchFiltersWithdrawalTypePage.displayName}
            selectedValue={searchAdvancedFiltersForm?.withdrawalType}
            options={options}
            onApply={handleApply}
            defaultValue={undefined}
            customApplyLogic={customApplyLogic}
        />
    );
}

SearchFiltersWithdrawalTypePage.displayName = 'SearchFiltersWithdrawalTypePage';

export default SearchFiltersWithdrawalTypePage;
