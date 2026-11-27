import RuleBooleanBase from '@components/Rule/RuleBooleanBase';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';

import useRuleConditionDraft from './useRuleConditionDraft';
import withFlagRuleConditionAccess from './withFlagRuleConditionAccess';

type AddReimbursableToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_REIMBURSABLE_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_REIMBURSABLE_TO_MATCH
>;

function AddReimbursableToMatchPage({route}: AddReimbursableToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute, formID, form, updateDraft, isFlagRule} = useRuleConditionDraft(
        DYNAMIC_ROUTES.RULES_REIMBURSABLE_TO_MATCH_FROM_EXPENSE.path,
        policyID,
        ruleID,
        'flagCondition' in route.params ? route.params.flagCondition : undefined,
    );

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const onSelect = (fieldID: string, value: boolean | 'true' | 'false' | null) => {
        updateDraft({[fieldID]: isFlagRule && value === null ? '' : value});
        goBack();
    };

    return (
        <RuleBooleanBase
            fieldID={MERCHANT_RULE_INPUT_IDS.REIMBURSABLE_TO_MATCH}
            formID={formID}
            selectedValue={typeof form?.reimbursableToMatch === 'boolean' ? form.reimbursableToMatch : null}
            titleKey="common.reimbursable"
            unsetTranslationKey="common.any"
            onSelect={onSelect}
            onBack={goBack}
        />
    );
}

AddReimbursableToMatchPage.displayName = 'AddReimbursableToMatchPage';

export default withFlagRuleConditionAccess(AddReimbursableToMatchPage);
