import type {OnyxCollection} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {getAllTaxRates} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

function taxRatesPoliciesSelector(policies: OnyxCollection<Policy>): OnyxCollection<Policy> {
    if (!policies) {
        return policies;
    }
    const result: OnyxCollection<Policy> = {};
    for (const [key, policy] of Object.entries(policies)) {
        if (!policy) {
            continue;
        }
        result[key] = {taxRates: policy.taxRates} as Policy;
    }
    return result;
}

function useFilterTaxRateValue(value: string[]): string {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: taxRatesPoliciesSelector});

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
