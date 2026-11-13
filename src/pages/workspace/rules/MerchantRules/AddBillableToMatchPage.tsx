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

type AddBillableToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_BILLABLE_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_BILLABLE_TO_MATCH
>;

function AddBillableToMatchPage({route}: AddBillableToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_BILLABLE_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const onSelect = (fieldID: string, value: boolean | 'true' | 'false' | null) => {
        updateDraftMerchantRule({[fieldID]: value});
        goBack();
    };

    return (
        <RuleBooleanBase
            fieldID={MERCHANT_RULE_INPUT_IDS.BILLABLE_TO_MATCH}
            formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
            titleKey="common.billable"
            unsetTranslationKey="common.any"
            onSelect={onSelect}
            onBack={goBack}
        />
    );
}

AddBillableToMatchPage.displayName = 'AddBillableToMatchPage';

export default AddBillableToMatchPage;
