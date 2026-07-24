import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalBankAccountDetailsFormSubmit from '@hooks/usePersonalBankAccountDetailsFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

import React from 'react';

type InternationalBankAccountDetailsProps = SubStepProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const STEP_FIELDS = [BANK_INFO_STEP_KEYS.IBAN, BANK_INFO_STEP_KEYS.SWIFT_CODE];

function InternationalBankAccountDetailsStep({onNext, isEditing}: InternationalBankAccountDetailsProps) {
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, STEP_FIELDS, translate);

        if (values.iban && !CONST.BANK_ACCOUNT.REGEX.IBAN.test(values.iban.trim())) {
            errors.iban = translate('bankAccount.error.swiftCodeOrIban');
        }
        if (values.swiftCode && !CONST.BANK_ACCOUNT.REGEX.INTERNATIONAL_SWIFT_CODE.test(values.swiftCode.trim())) {
            errors.swiftCode = translate('bankAccount.error.swiftCodeOrIban');
        }

        return errors;
    };

    const handleSubmit = usePersonalBankAccountDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            onSubmit={handleSubmit}
            validate={validate}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('bankAccount.internationalBankAccountDetails')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                ref={inputCallbackRef}
                inputID={BANK_INFO_STEP_KEYS.IBAN}
                label={translate('bankAccount.iban')}
                aria-label={translate('bankAccount.iban')}
                role={CONST.ROLE.PRESENTATION}
                value={bankAccountPersonalDetails?.iban ?? ''}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={TextInput}
                inputID={BANK_INFO_STEP_KEYS.SWIFT_CODE}
                containerStyles={[styles.mt6]}
                label={translate('bankAccount.swiftBicCode')}
                aria-label={translate('bankAccount.swiftBicCode')}
                role={CONST.ROLE.PRESENTATION}
                value={bankAccountPersonalDetails?.swiftCode ?? ''}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

InternationalBankAccountDetailsStep.displayName = 'InternationalBankAccountDetailsStep';

export default InternationalBankAccountDetailsStep;
