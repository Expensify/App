import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {getMatchingVendors, getVendorFeaturePolicyIDs} from '@libs/PolicyUtils';
import {getAllPolicyValues, sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import MultiSelect from './MultiSelect';

type VendorSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

function VendorSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: VendorSelectorProps) {
    const {translate, localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // Uses the same synced vendors the expense Vendor field offers.
    const vendorNamesByPolicyID = Object.fromEntries(
        getVendorFeaturePolicyIDs(allPolicies, isVendorMatchingBetaEnabled).map((id) => [
            id,
            getMatchingVendors(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]).map((vendor) => vendor.name),
        ]),
    );

    const noVendorLabel = translate('search.noVendor');
    const selectedVendorItems = value.map((vendor) => {
        if (vendor === CONST.SEARCH.VENDOR_EMPTY_VALUE) {
            return {text: noVendorLabel, value: vendor};
        }
        return {text: vendor, value: vendor};
    });

    // The workspace filter can hold workspace names as well as IDs, so it is resolved to the matching workspaces first.
    const selectedPolicyIDs = policyID?.value?.length ? new Set(getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY, allPolicies).map((policy) => policy.id)) : undefined;
    const vendorItems = [{text: noVendorLabel, value: CONST.SEARCH.VENDOR_EMPTY_VALUE as string}];
    const uniqueVendorNames = new Set<string>(
        Object.entries(vendorNamesByPolicyID)
            .filter(([id]) => !selectedPolicyIDs || selectedPolicyIDs.has(id))
            .flatMap(([, vendorNames]) => vendorNames),
    );
    vendorItems.push(
        ...Array.from(uniqueVendorNames)
            .filter(Boolean)
            .map((vendorName) => ({text: vendorName, value: vendorName}))
            .toSorted((a, b) => sortOptionsWithEmptyValue(a.text, b.text, localeCompare)),
    );

    // Selected vendors that are not in the synced lists, such as a typed name or one from a workspace the filter leaves out, stay listed after "No vendor" so they can be deselected.
    const vendorItemValues = new Set(vendorItems.map((item) => item.value));
    const missingSelectedVendorItems = selectedVendorItems.filter((item) => !vendorItemValues.has(item.value)).toSorted((a, b) => localeCompare(a.text, b.text));
    vendorItems.splice(1, 0, ...missingSelectedVendorItems);

    return (
        <MultiSelect
            value={selectedVendorItems}
            items={vendorItems}
            isSearchable={vendorItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            autoFocus={autoFocus}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(vendors) => onChange(vendors.map((vendor) => vendor.value))}
        />
    );
}

export default VendorSelector;
