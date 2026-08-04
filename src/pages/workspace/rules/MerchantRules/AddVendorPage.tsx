import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {findVendorByID, getMatchingVendors, isXeroActiveMatchingSource} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useMemo} from 'react';

type AddVendorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_VENDOR>;

function AddVendorPage({route}: AddVendorPageProps) {
    const {policyID, ruleID} = route.params;
    const isEditing = ruleID !== ROUTES.NEW;

    const policy = usePolicy(policyID);
    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const selectedVendorItem = form?.vendorID ? {name: findVendorByID(policy, form.vendorID)?.name ?? form.vendorID, value: form.vendorID} : undefined;

    const vendorItems = useMemo(() => getMatchingVendors(policy).map((vendor) => ({name: vendor.name, value: vendor.id})), [policy]);

    const backToRoute = isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        updateDraftMerchantRule({vendorID: value});
    };

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
