/**
 * Personal-info substep for collecting international bank account details (IBAN + SWIFT/BIC) when adding a personal bank account.
 */
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

import {getInternationalBankAccountDetailsErrors} from '@pages/settings/Wallet/InternationalDepositAccount/utils';

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

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM> => ({
        ...getFieldRequiredErrors(values, STEP_FIELDS, translate),
        ...getInternationalBankAccountDetailsErrors(values.iban, values.swiftCode, translate),
    });

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
