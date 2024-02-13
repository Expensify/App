import Str from 'expensify-common/lib/str';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
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
import type {Policy, ReimbursementAccount} from '@src/types/onyx';
import type {ReimbursementAccountDraftValues} from '@src/types/onyx/ReimbursementAccountDraft';
import Enable2FACard from './Enable2FACard';

type BankAccountValidationFormProps = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccount;

    /** Boolean required to display Enable2FACard component */
    requiresTwoFactorAuth: boolean;

    /** The policy which the user has access to and which the report is tied to */
    policy: Policy | null;
};

const getAmountValues = (values: ReimbursementAccountDraftValues): Record<string, string> => ({
    amount1: values?.amount1 ?? '',
    amount2: values?.amount2 ?? '',
    amount3: values?.amount3 ?? '',
});

const filterInput = (amount: string, amountRegex?: RegExp) => {
    let value = amount ? amount.toString().trim() : '';
    value = value.replace(/^0+|0+$/g, '');
    if (value === '' || Number.isNaN(Number(value)) || !Math.abs(Str.fromUSDToNumber(value, false)) || (amountRegex && !amountRegex.test(value))) {
        return '';
    }

    return value;
};

function BankAccountValidationForm({requiresTwoFactorAuth, reimbursementAccount, policy}: BankAccountValidationFormProps) {
    const {translate, toLocaleDigit} = useLocalize();
    const styles = useThemeStyles();

    const policyID = reimbursementAccount?.achData?.policyID ?? '';

    const validate = (values: ReimbursementAccountDraftValues) => {
        const errors: Record<string, string> = {};
        const amountValues = getAmountValues(values);
        const decimalSeparator = toLocaleDigit('.');
        const outputCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
        const amountRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{0,${CurrencyUtils.getCurrencyDecimals(outputCurrency)}})?$`, 'i');

        Object.keys(amountValues).forEach((key) => {
            const value = amountValues[key];
            const filteredValue = filterInput(value, amountRegex);
            if (ValidationUtils.isRequiredFulfilled(filteredValue.toString())) {
                return;
            }
            errors[key] = 'common.error.invalidAmount';
        });

        return errors;
    };

    const submit = useCallback(
        (values: ReimbursementAccountDraftValues) => {
            const amount1 = filterInput(values.amount1 ?? '');
            const amount2 = filterInput(values.amount2 ?? '');
            const amount3 = filterInput(values.amount3 ?? '');

            const validateCode = [amount1, amount2, amount3].join(',');

            // Send valid amounts to BankAccountAPI::validateBankAccount in Web-Expensify
            const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
            if (bankAccountID) {
                BankAccounts.validateBankAccount(bankAccountID, validateCode);
            }
        },
        [reimbursementAccount],
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
                    inputID="amount1"
                    shouldSaveDraft
                    containerStyles={[styles.mb6]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 1`}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID="amount2"
                    shouldSaveDraft
                    containerStyles={[styles.mb6]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 2`}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    shouldSaveDraft
                    inputID="amount3"
                    containerStyles={[styles.mb6]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 3`}
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
