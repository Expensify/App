import React from 'react';
import useOnyx from '@hooks/useOnyx';
import {getAllTaxRates} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {filterPolicyIDSelector} from '@src/selectors/Search';
import type {Policy} from '@src/types/onyx';
import MultiSelect from './MultiSelect';

type TaxRateSelectorProps = {
    value: string[] | undefined;
    onChange: (taxRates: string[]) => void;
};

function TaxRateSelector({value = [], onChange}: TaxRateSelectorProps) {
    const [policyIDs] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterPolicyIDSelector});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const allTaxRates = getAllTaxRates(policies);
    const selectedPoliciesMap = policyIDs?.reduce<Record<string, Policy>>((acc, policyID) => {
        const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
        const policy = policies?.[key];
        if (policy) {
            acc[key] = policy;
        }
        return acc;
    }, {});
    const scopedTaxRates = !selectedPoliciesMap || Object.keys(selectedPoliciesMap).length === 0 ? allTaxRates : getAllTaxRates(selectedPoliciesMap);
    const taxItems = Object.entries(scopedTaxRates).map(([taxRateName, taxRateKeys]) => ({
        text: taxRateName,
        value: taxRateKeys.toString(),
    }));
    const selectedTaxRates = taxItems.filter((tax) => value.includes(tax.value.toString()));

    return (
        <MultiSelect
            value={selectedTaxRates}
            items={taxItems}
            isSearchable={taxItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            onChange={(taxRates) => onChange(taxRates.map((taxRate) => taxRate.value))}
        />
    );
}

export default TaxRateSelector;
