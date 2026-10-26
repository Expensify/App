import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyConnectionsPrefetch from '@hooks/usePolicyConnectionsPrefetch';

import {openPolicyVendorsPage} from '@libs/actions/Policy/Vendor';
import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getMatchingVendors, getVendorRuleDisplayValue, hasVendorFeature, sortVendors} from '@libs/PolicyUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, PolicyVendors} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect} from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddVendorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_VENDOR | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_VENDOR>;

type VendorSelectionItem = {name: string; value: string};

/** Maps the policy's matching vendors to picker items (label = vendor name, value = the integration's external vendor ID). */
function getVendorSelectionItems(
    policy: Policy | undefined,
    localeCompare: LocaleContextProps['localeCompare'],
    policyVendors?: OnyxEntry<PolicyVendors>,
    selectedVendorID?: string,
): VendorSelectionItem[] {
    const vendors = getMatchingVendors(policy);
    return sortVendors(
        vendors.filter((vendor) => vendor.id === selectedVendorID || policyVendors?.[vendor.id]?.enabled !== false),
        localeCompare,
    ).map((vendor) => ({name: vendor.name, value: vendor.id}));
}

/**
 * Resolves the picker's currently-selected item for a stored vendorID using the same display-value fallback as
 * every other merchant-rule surface.
 */
function getSelectedVendorItem(policy: Policy | undefined, vendorID: string | undefined, unavailableLabel: string): VendorSelectionItem | undefined {
    return vendorID ? {name: getVendorRuleDisplayValue(policy, vendorID, unavailableLabel), value: vendorID} : undefined;
}

function AddVendorPage({route}: AddVendorPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_VENDOR_FROM_EXPENSE.path, policyID, ruleID);

    const {translate, localeCompare} = useLocalize();
    const policy = usePolicy(policyID);
    const {isBetaEnabled} = usePermissions();
    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policyVendors] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${policyID}`);

    // This picker can be deep-linked directly, and its gate below reads policy.connections (via
    // hasVendorFeature and getMatchingVendorByID), which is empty on a non-active workspace until a page
    // requiring connections is opened. Prefetch it here unconditionally so the picker becomes available
    // and resolves the selected vendor once connections hydrate. It can't be narrowed by
    // hasVendorFeature, because that itself depends on the connection data being fetched. The hook
    // already skips the fetch when the app is offline, when the workspace has no accounting
    // connection, and when the data has already been fetched.
    const {isFetchNeeded, isLoadingFetchedFlag} = usePolicyConnectionsPrefetch(policy, true);

    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);
    const isFeatureAvailable = hasVendorFeature(policy, isVendorMatchingBetaEnabled);

    // Stale sessions may never have received the policyVendors_ collection, so fetch it if missing.
    const fetchVendorsIfMissing = () => {
        if (!isFeatureAvailable || !policyID || policyVendors !== undefined) {
            return;
        }
        openPolicyVendorsPage(policyID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchVendorsIfMissing});

    useEffect(() => {
        fetchVendorsIfMissing();
        // Run only on mount because reconnect re-fetches are handled by useNetwork above.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const unavailableLabel = translate('workspace.rules.merchantRules.vendorUnavailable');
    const selectedVendorItem = getSelectedVendorItem(policy, form?.vendorID, unavailableLabel);

    const vendorItems = getVendorSelectionItems(policy, localeCompare, policyVendors, form?.vendorID);

    const saveVendor = (value?: string) => {
        updateDraftMerchantRule({vendorID: value});
    };

    // While the prefetch is in flight, show a loading indicator instead of falling through to the NotFoundPage
    // gate below. On a deep-link cold-load policy.connections is empty until the fetch lands, so hasVendorFeature
    // would briefly return false and flash NotFoundPage before the picker appears.
    if (isFetchNeeded || isLoadingFetchedFlag) {
        return <FullScreenLoadingIndicator onGoBack={() => Navigation.goBack(backToRoute)} />;
    }

    // Gate direct/deeplink access behind the same predicate that hides the "Set vendor to" row, so the beta can't be
    // bypassed by opening this picker's URL directly (which would otherwise write vendorID into the draft and save it).
    if (!isFeatureAvailable) {
        return <NotFoundPage />;
    }

    if (!isOffline && policyVendors === undefined) {
        return <FullScreenLoadingIndicator onGoBack={() => Navigation.goBack(backToRoute)} />;
    }

    return (
        <RuleSelectionBase
            titleKey="common.vendor"
            testID="AddVendorPage"
            onBack={() => Navigation.goBack(backToRoute)}
        >
            <RuleSelectionBase.Picker
                selectedItem={selectedVendorItem}
                items={vendorItems}
                onSave={saveVendor}
                backToRoute={backToRoute}
            />
        </RuleSelectionBase>
    );
}

export default AddVendorPage;
export {getSelectedVendorItem, getVendorSelectionItems};
