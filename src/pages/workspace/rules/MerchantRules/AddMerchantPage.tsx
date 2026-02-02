import React from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import RuleTextBase from '@components/Rule/RuleTextBase';
import useLocalize from '@hooks/useLocalize';
import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {containsHTMLTags} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddMerchantPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT>;

function AddMerchantPage({route}: AddMerchantPageProps) {
    const {policyID, ruleID} = route.params;
    const isEditing = ruleID !== ROUTES.NEW;
    const {translate} = useLocalize();

    const goBack = () => {
        const backRoute = isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);
        Navigation.goBack(backRoute);
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        updateDraftMerchantRule(values);
        goBack();
    };

    const customValidate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM> = {};
        const merchant = values[CONST.MERCHANT_RULES.FIELDS.MERCHANT] ?? '';

        if (typeof merchant === 'string' && containsHTMLTags(merchant)) {
            (errors as Record<string, string>)[CONST.MERCHANT_RULES.FIELDS.MERCHANT] = translate('common.error.invalidCharacter');
        }

        return errors;
    };

    return (
        <RuleTextBase
            fieldID={CONST.MERCHANT_RULES.FIELDS.MERCHANT}
            formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
            titleKey="common.merchant"
            testID="AddMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
            onSave={onSave}
            onBack={goBack}
            customValidate={customValidate}
        />
    );
}

AddMerchantPage.displayName = 'AddMerchantPage';

export default AddMerchantPage;
