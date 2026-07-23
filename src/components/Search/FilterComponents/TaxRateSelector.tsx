import type {SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getAllTaxRates} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';

import MultiSelect from './MultiSelect';

type TaxRateSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyIDs: string[] | undefined;
};

function TaxRateSelector({value = [], policyIDs = [], selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: TaxRateSelectorProps) {
    const {localeCompare} = useLocalize();
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
    const taxItems = Object.entries(scopedTaxRates)
        .map(([taxRateName, taxRateKeys]) => ({
            text: taxRateName,
            value: taxRateKeys.toString(),
        }))
        .toSorted((a, b) => localeCompare(a.text.toString(), b.text.toString()));
    const selectedTaxRates = taxItems.filter((tax) => value.includes(tax.value.toString()));

    return (
        <MultiSelect
            value={selectedTaxRates}
            items={taxItems}
            isSearchable={taxItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            autoFocus={autoFocus}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(taxRates) => onChange(taxRates.map((taxRate) => taxRate.value))}
        />
    );
}

export default TaxRateSelector;
