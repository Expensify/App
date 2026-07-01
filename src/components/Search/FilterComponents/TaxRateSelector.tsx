import React from 'react';
import type {SearchFilterCommonProps} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {getAllPolicyValuesMap} from '@libs/SearchQueryUtils';
import type {PolicyIDFilter} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import MultiSelect from './MultiSelect';

type TaxRateSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: PolicyIDFilter | undefined;
};

function TaxRateSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: TaxRateSelectorProps) {
    const {localeCompare} = useLocalize();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const allTaxRates = getAllTaxRates(policies);
    const selectedPoliciesMap = getAllPolicyValuesMap(policyID, ONYXKEYS.COLLECTION.POLICY, policies);
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
