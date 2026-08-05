import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {findVendorByID, getMatchingVendors, hasVendorFeature, isXeroActiveMatchingSource} from '@libs/PolicyUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import React, {useMemo} from 'react';

type AddVendorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_VENDOR>;

type VendorSelectionItem = {name: string; value: string};

/** Maps the policy's matching vendors to picker items (label = vendor name, value = the integration's external vendor ID). */
function getVendorSelectionItems(policy: Policy | undefined): VendorSelectionItem[] {
    return getMatchingVendors(policy).map((vendor) => ({name: vendor.name, value: vendor.id}));
}

/**
 * Resolves the picker's currently-selected item for a stored vendorID. Falls back to the raw external ID as the
 * label when the vendor can't be resolved (list not synced yet, or the vendor was removed from the integration).
 */
function getSelectedVendorItem(policy: Policy | undefined, vendorID: string | undefined): VendorSelectionItem | undefined {
    return vendorID ? {name: findVendorByID(policy, vendorID)?.name ?? vendorID, value: vendorID} : undefined;
}

function AddVendorPage({route}: AddVendorPageProps) {
    const {policyID, ruleID} = route.params;
    const isEditing = ruleID !== ROUTES.NEW;

    const policy = usePolicy(policyID);
    const {isBetaEnabled} = usePermissions();
    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const selectedVendorItem = getSelectedVendorItem(policy, form?.vendorID);

    const vendorItems = useMemo(() => getVendorSelectionItems(policy), [policy]);

    const backToRoute = isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        updateDraftMerchantRule({vendorID: value});
    };

    // Gate direct/deeplink access behind the same predicate that hides the "Set vendor to" row, so the beta can't be
    // bypassed by opening this picker's URL directly (which would otherwise write vendorID into the draft and save it).
    if (!hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING))) {
        return <NotFoundPage />;
    }

    return (
        <RuleSelectionBase
            titleKey={isXeroActiveMatchingSource(policy) ? 'common.supplier' : 'common.vendor'}
            testID="AddVendorPage"
            onBack={() => Navigation.goBack(backToRoute)}
        >
            <RuleSelectionBase.Picker
                selectedItem={selectedVendorItem}
                items={vendorItems}
                onSave={onSave}
                backToRoute={backToRoute}
            />
        </RuleSelectionBase>
    );
}

export default AddVendorPage;
export {getSelectedVendorItem, getVendorSelectionItems};
