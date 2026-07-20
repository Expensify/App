import useOnyx from '@hooks/useOnyx';

import {getAllTaxRates} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

function taxRatesPoliciesSelector(value: string[]) {
    return (policies: OnyxCollection<Policy>) => {
        const taxRates = getAllTaxRates(policies);
        const result: string[] = [];
        for (const [taxRateName, taxRateKeys] of Object.entries(taxRates)) {
            if (!taxRateKeys.some((taxRateKey) => value.includes(taxRateKey)) || result.includes(taxRateName)) {
                continue;
            }
            result.push(taxRateName);
        }

        return result.join(', ');
    };
}

function useFilterTaxRateValue(value: string[]): string {
    const [taxRateValue = ''] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: taxRatesPoliciesSelector(value)});
    return taxRateValue;
}

export default useFilterTaxRateValue;
