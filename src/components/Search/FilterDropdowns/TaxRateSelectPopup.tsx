import React from 'react';
import MultiSelectFilterPopup from '@components/Search/SearchPageHeader/MultiSelectFilterPopup';
import useOnyx from '@hooks/useOnyx';
import {getAllTaxRates} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {Policy} from '@src/types/onyx';
import type {MultiSelectItem} from './MultiSelectPopup';

type TaxRateSelectPopupProps = {
    closeOverlay: () => void;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function TaxRateSelectPopup({closeOverlay, updateFilterForm}: TaxRateSelectPopupProps) {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const taxRates = searchAdvancedFiltersForm?.taxRate;
    const policyIDs = searchAdvancedFiltersForm?.policyID;
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
    const selectedTaxRates = taxItems.filter((tax) => taxRates?.includes(tax.value.toString()));

    const updateTaxRateFilterForm = (items: Array<MultiSelectItem<string>>) => {
        updateFilterForm({taxRate: items.map((item) => item.value)});
    };

    return (
        <MultiSelectFilterPopup
            closeOverlay={closeOverlay}
            translationKey="iou.taxRate"
            items={taxItems}
            value={selectedTaxRates}
            isSearchable={taxItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            onChangeCallback={updateTaxRateFilterForm}
        />
    );
}

export default TaxRateSelectPopup;
