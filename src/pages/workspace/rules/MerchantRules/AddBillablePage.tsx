import RuleBooleanBase from '@components/Rule/RuleBooleanBase';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';

type AddBillablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_BILLABLE>;

function AddBillablePage({route}: AddBillablePageProps) {
    const {policyID, ruleID} = route.params;
    const isEditing = ruleID !== ROUTES.NEW;

    const goBack = () => {
        const backRoute = isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);
        Navigation.goBack(backRoute);
    };

    const onSelect = (fieldID: string, value: boolean | 'true' | 'false' | null) => {
        updateDraftMerchantRule({[fieldID]: value});
        goBack();
    };

    return (
        <RuleBooleanBase
            fieldID={MERCHANT_RULE_INPUT_IDS.BILLABLE}
            formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
            titleKey="common.billable"
            onSelect={onSelect}
            onBack={goBack}
        />
    );
}

AddBillablePage.displayName = 'AddBillablePage';

export default AddBillablePage;
