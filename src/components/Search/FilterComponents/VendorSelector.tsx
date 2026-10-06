import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {getMatchingVendors, getVendorFeaturePolicyIDs} from '@libs/PolicyUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import React, {useCallback} from 'react';

import MultiSelect from './MultiSelect';

type VendorSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

function VendorSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: VendorSelectorProps) {
    const {translate, localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);

    // Uses the same synced vendors the expense Vendor field offers, keeping only the names so the selector result stays small.
    const vendorNamesSelector = useCallback(
        (allPolicies: OnyxCollection<Policy>) =>
            Object.fromEntries(
                getVendorFeaturePolicyIDs(allPolicies, isVendorMatchingBetaEnabled).map((id) => [
                    id,
                    getMatchingVendors(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]).map((vendor) => vendor.name),
                ]),
            ),
        [isVendorMatchingBetaEnabled],
    );
    const [vendorNamesByPolicyID = getEmptyObject<Record<string, string[]>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: vendorNamesSelector});

    const noVendorLabel = translate('search.noVendor');
    const selectedVendorItems = value.map((vendor) => {
        if (vendor === CONST.SEARCH.VENDOR_EMPTY_VALUE) {
            return {text: noVendorLabel, value: vendor};
        }
        return {text: vendor, value: vendor};
    });

    const isPolicySelected = (id: string) => !policyID?.value?.length || policyID.isNegated !== policyID.value.includes(id);
    const vendorItems = [{text: noVendorLabel, value: CONST.SEARCH.VENDOR_EMPTY_VALUE as string}];
    const uniqueVendorNames = new Set<string>(
        Object.entries(vendorNamesByPolicyID)
            .filter(([id]) => isPolicySelected(id))
            .flatMap(([, vendorNames]) => vendorNames),
    );
    vendorItems.push(
        ...Array.from(uniqueVendorNames)
            .filter(Boolean)
            .map((vendorName) => ({text: vendorName, value: vendorName}))
            .toSorted((a, b) => sortOptionsWithEmptyValue(a.text, b.text, localeCompare)),
    );

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
