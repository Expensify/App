/**
 * Personal-info substep for collecting international bank account details (IBAN + SWIFT/BIC) when adding a personal bank account.
 */
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InternationalBankAccountDetailsForm from '@components/SubStepForms/InternationalBankAccountDetailsStep';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalBankAccountDetailsFormSubmit from '@hooks/usePersonalBankAccountDetailsFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';

import {getInternationalBankAccountDetailsErrors} from '@libs/BankAccountUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

import React from 'react';

type InternationalBankAccountDetailsProps = SubPageProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const STEP_FIELDS = [BANK_INFO_STEP_KEYS.IBAN, BANK_INFO_STEP_KEYS.SWIFT_CODE];

function InternationalBankAccountDetailsStep({onNext, isEditing}: InternationalBankAccountDetailsProps) {
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);

    const {translate} = useLocalize();

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
        <InternationalBankAccountDetailsForm
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            validate={validate}
            onSubmit={handleSubmit}
            isEditing={isEditing}
            ibanDefaultValue={bankAccountPersonalDetails?.iban}
            swiftCodeDefaultValue={bankAccountPersonalDetails?.swiftCode}
        />
    );
}

InternationalBankAccountDetailsStep.displayName = 'InternationalBankAccountDetailsStep';

export default InternationalBankAccountDetailsStep;
