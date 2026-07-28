/**
 * Sub-page for collecting international bank account details (IBAN + SWIFT/BIC) in the Corpay deposit-account flow.
 */
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useInternationalBankAccountFormSubmit from '@hooks/useInternationalBankAccountFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import type CustomSubPageProps from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {getInternationalBankAccountDetailsErrors} from '@pages/settings/Wallet/InternationalDepositAccount/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

const IBAN = 'iban';
const SWIFT_CODE = 'swiftCode';
const STEP_FIELDS = [IBAN, SWIFT_CODE];

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
    const accountNumber = formValues.accountNumber;
    const ibanDefaultValue = formValues[IBAN] || (accountNumber && CONST.BANK_ACCOUNT.REGEX.IBAN.test(String(accountNumber).trim()) ? accountNumber : '');
    const swiftCodeDefaultValue = formValues[SWIFT_CODE] || formValues.swiftBicCode || '';

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM> => ({
        ...getFieldRequiredErrors(values, STEP_FIELDS, translate),
        ...getInternationalBankAccountDetailsErrors(values[IBAN], values[SWIFT_CODE], translate),
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
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={IBAN}
                    label={translate('bankAccount.iban')}
                    aria-label={translate('bankAccount.iban')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={ibanDefaultValue}
                    containerStyles={[styles.pv2]}
                    shouldSaveDraft={!isEditing}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={SWIFT_CODE}
                    label={translate('bankAccount.swiftBicCode')}
                    aria-label={translate('bankAccount.swiftBicCode')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={swiftCodeDefaultValue}
                    containerStyles={[styles.pv2]}
                    shouldSaveDraft={!isEditing}
                />
            </View>
        </FormProvider>
    );
}

export default InternationalBankAccountDetails;
