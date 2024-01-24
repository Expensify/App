import Str from 'expensify-common/lib/str';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import Enable2FACard from './Enable2FACard';

type BankAccountValidationFormProps = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccount;

    /** Boolean required to display Enable2FACard component */
    requiresTwoFactorAuth: boolean;
};

const getAmountValues = (values: FormValues): Record<string, string> => ({
    amount1: values?.amount1,
    amount2: values?.amount2,
    amount3: values?.amount3,
});

const filterInput = (amount: string) => {
    const value = amount ? amount.trim() : '';
    if (value === '' || Number.isNaN(Number(value)) || !Math.abs(Str.fromUSDToNumber(value, true))) {
        return '';
    }

    // If the user enters the values in dollars, convert it to the respective cents amount
    if (value.includes('.')) {
        return Str.fromUSDToNumber(value, true);
    }

    return value;
};

const validate = (values: FormValues) => {
    const errors: Record<string, string> = {};
    const amountValues = getAmountValues(values);

    Object.keys(amountValues).forEach((key) => {
        const value = amountValues[key];
        const filteredValue = filterInput(value);
        if (ValidationUtils.isRequiredFulfilled(filteredValue.toString())) {
            return;
        }
        errors[key] = 'common.error.invalidAmount';
    });

    return errors;
};

function BankAccountValidationForm({requiresTwoFactorAuth, reimbursementAccount}: BankAccountValidationFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = reimbursementAccount?.achData?.policyID ?? '';
    const submit = useCallback(
        (values: FormValues) => {
            const amount1 = filterInput(values.amount1);
            const amount2 = filterInput(values.amount2);
            const amount3 = filterInput(values.amount3);

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
        // @ts-expect-error TODO: Remove this once Form (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate('connectBankAccountStep.validateButtonText')}
            onSubmit={submit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text>{translate('connectBankAccountStep.description')}</Text>
            <Text>{translate('connectBankAccountStep.descriptionCTA')}</Text>

            <View style={[styles.mv5]}>
                <InputWrapper
                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                    InputComponent={TextInput}
                    inputID="amount1"
                    shouldSaveDraft
                    containerStyles={[styles.mb1]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 1`}
                />
                <InputWrapper
                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                    InputComponent={TextInput}
                    inputID="amount2"
                    shouldSaveDraft
                    containerStyles={[styles.mb1]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 2`}
                />
                <InputWrapper
                    // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                    InputComponent={TextInput}
                    shouldSaveDraft
                    inputID="amount3"
                    containerStyles={[styles.mb1]}
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
