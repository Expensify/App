/**
 * Sub-page for collecting international bank account details (IBAN + SWIFT/BIC) in the Corpay deposit-account flow.
 */
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';

import useInternationalBankAccountFormSubmit from '@hooks/useInternationalBankAccountFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import InternationalBankAccountFields, {IBAN_INPUT_ID, SWIFT_CODE_INPUT_ID} from '@pages/settings/Wallet/InternationalDepositAccount/InternationalBankAccountFields';
import type CustomSubPageProps from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {getInternationalBankAccountDetailsErrors, getInternationalBankAccountDetailsValues} from '@pages/settings/Wallet/InternationalDepositAccount/utils';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

const STEP_FIELDS = [IBAN_INPUT_ID, SWIFT_CODE_INPUT_ID];

function InternationalBankAccountDetails({isEditing, onNext, formValues}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleSubmit = useInternationalBankAccountFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    // Pre-fill from what the account details step already captured, until the user edits this step directly: the
    // account number is the IBAN for IBAN countries, and Corpay's SWIFT/BIC field (swiftBicCode) is the SWIFT code.
    const {iban: ibanDefaultValue, swiftCode: swiftCodeDefaultValue} = getInternationalBankAccountDetailsValues(
        formValues[IBAN_INPUT_ID],
        formValues[SWIFT_CODE_INPUT_ID],
        formValues.accountNumber,
        formValues.swiftBicCode,
    );

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM> => ({
        ...getFieldRequiredErrors(values, STEP_FIELDS, translate),
        ...getInternationalBankAccountDetailsErrors(values[IBAN_INPUT_ID], values[SWIFT_CODE_INPUT_ID], translate),
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
        >
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankAccount.internationalBankAccountDetails')}</Text>
                <InternationalBankAccountFields
                    ibanDefaultValue={ibanDefaultValue}
                    swiftCodeDefaultValue={swiftCodeDefaultValue}
                    shouldSaveDraft={!isEditing}
                />
            </View>
        </FormProvider>
    );
}

export default InternationalBankAccountDetails;
