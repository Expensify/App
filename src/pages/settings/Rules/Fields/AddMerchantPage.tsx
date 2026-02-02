import React from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import RuleTextBase from '@components/Rule/RuleTextBase';
import useLocalize from '@hooks/useLocalize';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {containsHTMLTags} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddMerchantPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_MERCHANT>;

function AddMerchantPage({route}: AddMerchantPageProps) {
    const hash = route.params?.hash;
    const {translate} = useLocalize();

    const goBack = () => {
        Navigation.goBack(hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM>) => {
        updateDraftRule(values);
        goBack();
    };

    const customValidate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM> = {};
        const merchant = values[CONST.EXPENSE_RULES.FIELDS.MERCHANT] ?? '';

        if (typeof merchant === 'string' && containsHTMLTags(merchant)) {
            (errors as Record<string, string>)[CONST.EXPENSE_RULES.FIELDS.MERCHANT] = translate('common.error.invalidCharacter');
        }

        return errors;
    };

    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.MERCHANT}
            formID={ONYXKEYS.FORMS.EXPENSE_RULE_FORM}
            hintKey="expenseRulesPage.addRule.merchantHint"
            isRequired
            titleKey="common.merchant"
            testID="AddMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
            onSave={onSave}
            onBack={goBack}
            hash={hash}
            customValidate={customValidate}
        />
    );
}

export default AddMerchantPage;
