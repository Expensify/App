import React, {useMemo} from 'react';
import SearchFiltersSingleSelectBase from '@components/Search/SearchFiltersSingleSelectBase';
import type {SelectionOption} from '@components/Search/SearchFiltersSingleSelectBase';
import useOnyx from '@hooks/useOnyx';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

function SearchFiltersGroupCurrencyPage() {
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const options: Array<SelectionOption<string>> = useMemo(() => {
        const currencies: SelectionOption<string>[] = [];

        Object.keys(currencyList ?? {}).forEach((currencyCode) => {
            if (currencyList?.[currencyCode]?.retired) {
                return;
            }

            currencies.push({
                text: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`,
                value: currencyCode,
            });
        });

        return currencies;
    }, [currencyList]);

    const handleApply = () => {
        // The base component handles navigation, but for SearchPicker mode it handles updateAdvancedFilters too
    };

    const customApplyLogic = (selectedValue: string | undefined) => {
        return {groupCurrency: selectedValue ?? null};
    };

    return (
        <SearchFiltersSingleSelectBase
            titleKey="common.groupCurrency"
            testID={SearchFiltersGroupCurrencyPage.displayName}
            selectedValue={searchAdvancedFiltersForm?.groupCurrency}
            options={options}
            onApply={handleApply}
            includeSafeAreaPaddingBottom
            useSearchPicker
            customApplyLogic={customApplyLogic}
        />
    );
}

SearchFiltersGroupCurrencyPage.displayName = 'SearchFiltersGroupCurrencyPage';

export default SearchFiltersGroupCurrencyPage;
