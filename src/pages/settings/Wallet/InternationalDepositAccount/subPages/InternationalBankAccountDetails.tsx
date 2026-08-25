/**
 * Sub-page for collecting international bank account details (IBAN + SWIFT/BIC) in the Corpay deposit-account flow.
 */
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InternationalBankAccountDetailsForm, {IBAN_INPUT_ID, SWIFT_CODE_INPUT_ID} from '@components/SubStepForms/InternationalBankAccountDetailsStep';

import useInternationalBankAccountFormSubmit from '@hooks/useInternationalBankAccountFormSubmit';
import useLocalize from '@hooks/useLocalize';

import {getDisabledInternationalBankAccountFields, getInternationalBankAccountDetailsErrors, getInternationalBankAccountDetailsValues} from '@libs/BankAccountUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import type CustomSubPageProps from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {getCorpayFieldByLabelKeyword} from '@pages/settings/Wallet/InternationalDepositAccount/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

const STEP_FIELDS = [IBAN_INPUT_ID, SWIFT_CODE_INPUT_ID];

function InternationalBankAccountDetails({isEditing, onNext, formValues, fieldsMap}: CustomSubPageProps) {
    const {translate} = useLocalize();

    const handleSubmit = useInternationalBankAccountFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    // Pre-fill from what the account details step already captured, until the user edits this step directly. SWIFT
    // is treated as collected when it matches Corpay's account-details rules, not our shared BIC format.
    const corpaySwiftField = getCorpayFieldByLabelKeyword(fieldsMap[CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_DETAILS], CONST.CORPAY_FIELDS.SWIFT_LABEL_KEYWORD);
    const {iban: ibanDefaultValue, swiftCode: swiftCodeDefaultValue} = getInternationalBankAccountDetailsValues(
        formValues[IBAN_INPUT_ID],
        formValues[SWIFT_CODE_INPUT_ID],
        formValues.accountNumber,
        formValues.swiftBicCode,
        corpaySwiftField,
    );
    const {isIBANDisabled, isSwiftCodeDisabled} = getDisabledInternationalBankAccountFields(formValues.accountNumber, formValues.swiftBicCode, corpaySwiftField);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM> => ({
        ...getFieldRequiredErrors(values, STEP_FIELDS, translate),
        ...getInternationalBankAccountDetailsErrors(values[IBAN_INPUT_ID], values[SWIFT_CODE_INPUT_ID], translate, isSwiftCodeDisabled),
    });

    return (
        <InternationalBankAccountDetailsForm
            formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
            validate={validate}
            onSubmit={handleSubmit}
            isEditing={isEditing}
            ibanDefaultValue={ibanDefaultValue}
            swiftCodeDefaultValue={swiftCodeDefaultValue}
            isIBANDisabled={isIBANDisabled}
            isSwiftCodeDisabled={isSwiftCodeDisabled}
        />
    );
}

export default InternationalBankAccountDetails;
