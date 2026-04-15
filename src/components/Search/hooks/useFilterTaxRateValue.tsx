import type {OnyxEntry} from 'react-native-onyx';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useOnyx from '@hooks/useOnyx';
import {getAllTaxRates} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

function taxRateSelector(searchAdvancedFiltersForm: OnyxEntry<SearchAdvancedFiltersForm>) {
    return searchAdvancedFiltersForm?.taxRate;
}

function useFilterTaxRateValue(): string {
    const [taxRateIDs] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: taxRateSelector});
    const {policies} = useAdvancedSearchFilters();

    const taxRates = getAllTaxRates(policies);
    const result: string[] = [];
    for (const [taxRateName, taxRateKeys] of Object.entries(taxRates)) {
        if (!taxRateKeys.some((taxRateKey) => taxRateIDs?.includes(taxRateKey)) || result.includes(taxRateName)) {
            continue;
        }
        result.push(taxRateName);
    }

    return result.join(', ');
}

export default useFilterTaxRateValue;
