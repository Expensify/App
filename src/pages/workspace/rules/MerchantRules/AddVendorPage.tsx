import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyConnectionsPrefetch from '@hooks/usePolicyConnectionsPrefetch';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getMatchingVendors, getVendorRuleDisplayValue, hasVendorFeature, isXeroActiveMatchingSource} from '@libs/PolicyUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import React from 'react';

type AddVendorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_VENDOR>;

type VendorSelectionItem = {name: string; value: string};

/** Maps the policy's matching vendors to picker items (label = vendor name, value = the integration's external vendor ID). */
function getVendorSelectionItems(policy: Policy | undefined): VendorSelectionItem[] {
    return getMatchingVendors(policy).map((vendor) => ({name: vendor.name, value: vendor.id}));
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
    const isEditing = ruleID !== ROUTES.NEW;

    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const {isBetaEnabled} = usePermissions();
    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    // This picker can be deep-linked directly, and its gate below reads policy.connections (via
    // hasVendorFeature and getMatchingVendorByID), which is empty on a non-active workspace until a page
    // requiring connections is opened. Prefetch it here unconditionally so the picker becomes available
    // and resolves the selected vendor once connections hydrate. It can't be narrowed by
    // hasVendorFeature, because that itself depends on the connection data being fetched. The hook
    // already skips the fetch when the app is offline, when the workspace has no accounting
    // connection, and when the data has already been fetched.
    const {isFetchNeeded, isLoadingFetchedFlag} = usePolicyConnectionsPrefetch(policy, true);

    const isOnXero = isXeroActiveMatchingSource(policy);
    const unavailableLabel = translate(isOnXero ? 'workspace.rules.merchantRules.supplierUnavailable' : 'workspace.rules.merchantRules.vendorUnavailable');
    const selectedVendorItem = getSelectedVendorItem(policy, form?.vendorID, unavailableLabel);

    const vendorItems = getVendorSelectionItems(policy);

    const backToRoute = isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const saveVendor = (value?: string) => {
        updateDraftMerchantRule({vendorID: value});
    };

    // While the prefetch is in flight, show a loading indicator instead of falling through to the NotFoundPage
    // gate below. On a deep-link cold-load policy.connections is empty until the fetch lands, so hasVendorFeature
    // would briefly return false and flash NotFoundPage before the picker appears.
    if (isFetchNeeded || isLoadingFetchedFlag) {
        return <FullScreenLoadingIndicator />;
    }

    // Gate direct/deeplink access behind the same predicate that hides the "Set vendor to" row, so the beta can't be
    // bypassed by opening this picker's URL directly (which would otherwise write vendorID into the draft and save it).
    if (!hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING))) {
        return <NotFoundPage />;
    }

    return (
        <RuleSelectionBase
            titleKey={isOnXero ? 'common.supplier' : 'common.vendor'}
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
