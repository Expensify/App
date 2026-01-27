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

type AddDescriptionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_DESCRIPTION>;

function AddDescriptionPage({route}: AddDescriptionPageProps) {
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
            fieldID={CONST.MERCHANT_RULES.FIELDS.DESCRIPTION}
            formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
            titleKey="common.description"
            testID="AddDescriptionPage"
            characterLimit={CONST.DESCRIPTION_LIMIT}
            onSave={onSave}
            onBack={goBack}
        />
    );
}

AddDescriptionPage.displayName = 'AddDescriptionPage';

export default AddDescriptionPage;
