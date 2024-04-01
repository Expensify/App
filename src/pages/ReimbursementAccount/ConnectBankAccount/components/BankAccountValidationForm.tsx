import Str from 'expensify-common/lib/str';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getPermittedDecimalSeparator from '@libs/getPermittedDecimalSeparator';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {Policy, ReimbursementAccount} from '@src/types/onyx';
import Enable2FACard from './Enable2FACard';

type BankAccountValidationFormProps = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccount;

    /** Boolean required to display Enable2FACard component */
    requiresTwoFactorAuth: boolean;

    /** The policy which the user has access to and which the report is tied to */
    policy: Policy | null;
};

type AmountValues = {
    amount1: string;
    amount2: string;
    amount3: string;
};

function getAmountValues(values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): AmountValues {
    return {
        amount1: values?.amount1 ?? '',
        amount2: values?.amount2 ?? '',
        amount3: values?.amount3 ?? '',
    };
}

const filterInput = (amount: string, amountRegex?: RegExp, permittedDecimalSeparator?: string) => {
    let value = amount ? amount.toString().trim() : '';
    const regex = new RegExp(`^0+|([${permittedDecimalSeparator}]\\d*?)0+$`, 'g');
    value = value.replace(regex, '$1');
    if (value === '' || Number.isNaN(Number(value)) || !Math.abs(Str.fromUSDToNumber(value, false)) || (amountRegex && !amountRegex.test(value))) {
        return '';
    }

    return value;
};

function BankAccountValidationForm({requiresTwoFactorAuth, reimbursementAccount, policy}: BankAccountValidationFormProps) {
    const {translate, toLocaleDigit} = useLocalize();
    const styles = useThemeStyles();

    const policyID = reimbursementAccount?.achData?.policyID ?? '';
    const decimalSeparator = toLocaleDigit('.');
    const permittedDecimalSeparator = getPermittedDecimalSeparator(decimalSeparator);
    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> = {};
        const amountValues = getAmountValues(values);
        const outputCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
        const amountRegex = RegExp(String.raw`^-?\d{0,8}([${permittedDecimalSeparator}]\d{0,${CurrencyUtils.getCurrencyDecimals(outputCurrency)}})?$`, 'i');

        Object.keys(amountValues).forEach((key) => {
            const value = amountValues[key as keyof AmountValues];
            const filteredValue = filterInput(value, amountRegex, permittedDecimalSeparator);
            if (ValidationUtils.isRequiredFulfilled(filteredValue.toString())) {
                return;
            }
            errors[key as keyof AmountValues] = 'common.error.invalidAmount';
        });

        return errors;
    };

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>) => {
            const amount1 = filterInput(values.amount1 ?? '', undefined, permittedDecimalSeparator);
            const amount2 = filterInput(values.amount2 ?? '', undefined, permittedDecimalSeparator);
            const amount3 = filterInput(values.amount3 ?? '', undefined, permittedDecimalSeparator);

            const validateCode = [amount1, amount2, amount3].join(',');

            // Send valid amounts to BankAccountAPI::validateBankAccount in Web-Expensify
            const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
            if (bankAccountID) {
                BankAccounts.validateBankAccount(bankAccountID, validateCode, policyID);
            }
        },
        [reimbursementAccount, policyID, permittedDecimalSeparator],
    );
    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate('connectBankAccountStep.validateButtonText')}
            onSubmit={submit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text>{translate('connectBankAccountStep.description')}</Text>
            <Text>{translate('connectBankAccountStep.descriptionCTA')}</Text>

            <View style={[styles.mv5]}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.AMOUNT1}
                    shouldSaveDraft
                    containerStyles={[styles.mb6]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 1`}
                    maxLength={CONST.VALIDATION_REIMBURSEMENT_INPUT_LIMIT}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.AMOUNT2}
                    shouldSaveDraft
                    containerStyles={[styles.mb6]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 2`}
                    maxLength={CONST.VALIDATION_REIMBURSEMENT_INPUT_LIMIT}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    shouldSaveDraft
                    inputID={INPUT_IDS.AMOUNT3}
                    containerStyles={[styles.mb6]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 3`}
                    maxLength={CONST.VALIDATION_REIMBURSEMENT_INPUT_LIMIT}
                />
            </View>
            {!requiresTwoFactorAuth && (
                <View style={[styles.mln5, styles.mrn5, styles.mt3]}>
                    <Enable2FACard policyID={policyID} />
                </View>
            )}
        </FormProvider>
    );
}

BankAccountValidationForm.displayName = 'BankAccountValidationForm';

export default BankAccountValidationForm;
