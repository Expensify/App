import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccountActions from '@userActions/ReimbursementAccount';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type PlaidProps = SubStepProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;

function Plaid({onNext}: PlaidProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const selectedPlaidAccountID = reimbursementAccountDraft?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? '';

    const handleNextPress = useCallback(() => {
        const selectedPlaidBankAccount = (plaidData?.bankAccounts ?? []).find(
            (account) => account.plaidAccountID === reimbursementAccountDraft?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? null,
        );

        const bankAccountData = {
            [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.ROUTING_NUMBER],
            [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER],
            [BANK_INFO_STEP_KEYS.PLAID_MASK]: selectedPlaidBankAccount?.mask,
            [BANK_INFO_STEP_KEYS.IS_SAVINGS]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.IS_SAVINGS],
            [BANK_INFO_STEP_KEYS.BANK_NAME]: plaidData?.[BANK_INFO_STEP_KEYS.BANK_NAME] ?? '',
            [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID],
            [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: plaidData?.[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] ?? '',
        };

        ReimbursementAccountActions.updateReimbursementAccountDraft(bankAccountData);
        onNext(bankAccountData);
    }, [plaidData, reimbursementAccountDraft, onNext]);

    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID);

    useEffect(() => {
        const plaidBankAccounts = plaidData?.bankAccounts ?? [];
        if (isFocused || plaidBankAccounts.length) {
            return;
        }
        BankAccounts.setBankAccountSubStep(null);
    }, [isFocused, plaidData]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            validate={BankAccounts.validatePlaidSelection}
            onSubmit={handleNextPress}
            scrollContextEnabled
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
            isSubmitButtonVisible={(plaidData?.bankAccounts ?? []).length > 0}
        >
            <InputWrapper
                InputComponent={AddPlaidBankAccount}
                text={translate('bankAccount.plaidBodyCopy')}
                onSelect={(plaidAccountID: string) => {
                    ReimbursementAccountActions.updateReimbursementAccountDraft({plaidAccountID});
                }}
                plaidData={plaidData}
                onExitPlaid={() => {
                    BankAccounts.setBankAccountSubStep(null);
                }}
                allowDebit
                bankAccountID={bankAccountID}
                selectedPlaidAccountID={selectedPlaidAccountID}
                inputID={BANK_INFO_STEP_KEYS.SELECTED_PLAID_ACCOUNT_ID}
                defaultValue={selectedPlaidAccountID}
            />
        </FormProvider>
    );
}

Plaid.displayName = 'Plaid';

export default Plaid;
