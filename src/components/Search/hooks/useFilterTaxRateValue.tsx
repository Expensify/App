import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import {getAllTaxRates} from '@libs/PolicyUtils';

function useFilterTaxRateValue(value: string[]): string {
    const {policies} = useAdvancedSearchFilters();

    const taxRates = getAllTaxRates(policies);
    const result: string[] = [];
    for (const [taxRateName, taxRateKeys] of Object.entries(taxRates)) {
        if (!taxRateKeys.some((taxRateKey) => value.includes(taxRateKey)) || result.includes(taxRateName)) {
            continue;
        }
        result.push(taxRateName);
    }

    return result.join(', ');
}

export default useFilterTaxRateValue;
