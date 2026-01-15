import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearPersonalBankAccountSetupType, updateAddPersonalBankAccountDraft, validatePlaidSelection} from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;

function PlaidStep({onNext}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const [personalBankAccountDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA, {canBeMissing: true});
    const selectedPlaidAccountID = personalBankAccountDraft?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? '';

    const handleNextPress = useCallback(() => {
        const selectedPlaidBankAccount = (plaidData?.bankAccounts ?? []).find((account) => account.plaidAccountID === personalBankAccountDraft?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]);

        const bankAccountData = {
            [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.ROUTING_NUMBER],
            [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER],
            [BANK_INFO_STEP_KEYS.PLAID_MASK]: selectedPlaidBankAccount?.mask,
            [BANK_INFO_STEP_KEYS.IS_SAVINGS]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.IS_SAVINGS],
            [BANK_INFO_STEP_KEYS.BANK_NAME]: plaidData?.[BANK_INFO_STEP_KEYS.BANK_NAME] ?? '',
            [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID],
            [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: plaidData?.[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] ?? '',
        };

        updateAddPersonalBankAccountDraft(bankAccountData);
        onNext();
    }, [onNext, personalBankAccountDraft, plaidData]);

    const handleSelectPlaidAccount = (plaidAccountID: string) => {
        updateAddPersonalBankAccountDraft({plaidAccountID});
    };

    useEffect(() => {
        const plaidBankAccounts = plaidData?.bankAccounts ?? [];
        if (isFocused || plaidBankAccounts.length) {
            return;
        }
        clearPersonalBankAccountSetupType();
    }, [isFocused, plaidData?.bankAccounts]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            validate={validatePlaidSelection}
            onSubmit={handleNextPress}
            scrollContextEnabled
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
            isSubmitButtonVisible={(plaidData?.bankAccounts ?? []).length > 0}
            shouldHideFixErrorsAlert
        >
            <InputWrapper
                InputComponent={AddPlaidBankAccount}
                text={translate('walletPage.chooseAccountBody')}
                onSelect={handleSelectPlaidAccount}
                plaidData={plaidData}
                onExitPlaid={clearPersonalBankAccountSetupType}
                allowDebit
                isDisplayedInWalletFlow
                selectedPlaidAccountID={selectedPlaidAccountID}
                inputID={BANK_INFO_STEP_KEYS.SELECTED_PLAID_ACCOUNT_ID}
                defaultValue={selectedPlaidAccountID}
            />
        </FormProvider>
    );
}

export default PlaidStep;
