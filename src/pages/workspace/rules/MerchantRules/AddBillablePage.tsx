import RuleBooleanBase from '@components/Rule/RuleBooleanBase';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddBillablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_BILLABLE | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_BILLABLE>;

function AddBillablePage({route}: AddBillablePageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_BILLABLE_FROM_EXPENSE.path, policyID, ruleID);

    const goBack = () => {
        Navigation.goBack(backToRoute);
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
