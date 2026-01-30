import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import RuleTextBase from '@components/Rule/RuleTextBase';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddRenameMerchantPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_RENAME_MERCHANT>;

function AddRenameMerchantPage({route}: AddRenameMerchantPageProps) {
    const hash = route.params?.hash;

    const goBack = () => {
        Navigation.goBack(hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM>) => {
        updateDraftRule(values);
        goBack();
    };

    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.RENAME_MERCHANT}
            formID={ONYXKEYS.FORMS.EXPENSE_RULE_FORM}
            titleKey="common.merchant"
            testID="AddRenameMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
            onSave={onSave}
            onBack={goBack}
            hash={hash}
        />
    );
}

export default AddRenameMerchantPage;
