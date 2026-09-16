import type {FormOnyxValues} from '@components/Form/types';
import RuleTextBase from '@components/Rule/RuleTextBase';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddDescriptionPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_MERCHANT_DESCRIPTION | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_DESCRIPTION
>;

function AddDescriptionPage({route}: AddDescriptionPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_DESCRIPTION_FROM_EXPENSE.path, policyID, ruleID);

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        updateDraftMerchantRule(values);
        goBack();
    };

    return (
        <RuleTextBase
            fieldID={MERCHANT_RULE_INPUT_IDS.DESCRIPTION}
            formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
            titleKey="common.description"
            testID="AddDescriptionPage"
            characterLimit={CONST.DESCRIPTION_LIMIT}
            onSave={onSave}
            onBack={goBack}
            isMarkdownEnabled
        />
    );
}

AddDescriptionPage.displayName = 'AddDescriptionPage';

export default AddDescriptionPage;
