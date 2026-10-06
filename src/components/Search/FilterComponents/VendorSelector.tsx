import ActivityIndicator from '@components/ActivityIndicator';
import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useLoadSearchVendorData from '@hooks/useLoadSearchVendorData';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getMatchingVendors, getVendorFeaturePolicyIDs} from '@libs/PolicyUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyVendors} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import React, {useCallback} from 'react';
import {View} from 'react-native';

import MultiSelect from './MultiSelect';

type VendorSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

function VendorSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: VendorSelectorProps) {
    const {translate, localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);
    const {isLoadingInitialVendors} = useLoadSearchVendorData({shouldRefresh: true});
    const theme = useTheme();
    const styles = useThemeStyles();
    // Vendor lists are only offered for the workspaces where the vendor feature is on, so stale lists left behind by a
    // disconnected integration never surface in the picker. A workspace passes that check only once its connections are
    // loaded, and those connections carry the synced vendor list. Only the names are kept so the selector result stays small.
    const connectionVendorNamesSelector = useCallback(
        (allPolicies: OnyxCollection<Policy>) =>
            Object.fromEntries(
                getVendorFeaturePolicyIDs(allPolicies, isVendorMatchingBetaEnabled).map((id) => [
                    id,
                    getMatchingVendors(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]).map((vendor) => vendor.name),
                ]),
            ),
        [isVendorMatchingBetaEnabled],
    );
    const [connectionVendorNamesByPolicyID = getEmptyObject<Record<string, string[]>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: connectionVendorNamesSelector});
    const [allPolicyVendors = getEmptyObject<NonNullable<OnyxCollection<PolicyVendors>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_VENDORS);

    const noVendorLabel = translate('search.noVendor');
    const selectedVendorItems = value.map((vendor) => {
        if (vendor === CONST.SEARCH.VENDOR_EMPTY_VALUE) {
            return {text: noVendorLabel, value: vendor};
        }
        return {text: vendor, value: vendor};
    });

    // The loaded vendor list is rebuilt and pushed after every sync, so it wins over the cached connections. The connections
    // are the fallback for workspaces without one, which is how members get their vendors since the bulk vendor load only
    // covers workspaces the user administers. An empty loaded list also falls back, because a list built while the vendor
    // feature was off stays empty after the export type is switched on.
    const isPolicySelected = (id: string) => !policyID?.value?.length || policyID.isNegated !== policyID.value.includes(id);
    const vendorItems = [{text: noVendorLabel, value: CONST.SEARCH.VENDOR_EMPTY_VALUE as string}];
    const uniqueVendorNames = new Set<string>(
        Object.entries(connectionVendorNamesByPolicyID)
            .filter(([id]) => isPolicySelected(id))
            .flatMap(([id, connectionVendorNames]) => {
                const loadedVendorNames = Object.values(allPolicyVendors[`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${id}`] ?? {}).map((vendor) => vendor.name);
                return loadedVendorNames.length > 0 ? loadedVendorNames : connectionVendorNames;
            }),
    );
    vendorItems.push(
        ...Array.from(uniqueVendorNames)
            .filter(Boolean)
            .map((vendorName) => ({text: vendorName, value: vendorName}))
            .toSorted((a, b) => sortOptionsWithEmptyValue(a.text, b.text, localeCompare)),
    );

    if (isLoadingInitialVendors) {
        return (
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator
                    color={theme.spinner}
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={[styles.pl3]}
                />
            </View>
        );
    }

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
