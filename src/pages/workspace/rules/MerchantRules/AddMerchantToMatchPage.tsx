import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import RuleTextBase from '@components/Rule/RuleTextBase';
import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddMerchantToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH>;

function AddMerchantToMatchPage({route}: AddMerchantToMatchPageProps) {
    const policyID = route.params.policyID;

    const goBack = () => {
        Navigation.goBack(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        updateDraftMerchantRule(values);
        goBack();
    };

    return (
        <RuleTextBase
            fieldID={CONST.MERCHANT_RULES.FIELDS.MERCHANT_TO_MATCH}
            formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
            hintKey="workspace.rules.merchantRules.merchantHint"
            isRequired
            titleKey="common.merchant"
            testID="AddMerchantToMatchPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
            onSave={onSave}
            onBack={goBack}
        />
    );
}

AddMerchantToMatchPage.displayName = 'AddMerchantToMatchPage';

export default AddMerchantToMatchPage;
