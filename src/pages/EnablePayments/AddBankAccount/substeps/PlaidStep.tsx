import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalBankAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';
import type {PlaidData} from '@src/types/onyx';

type PlaidOnyxProps = {
    /** The draft values of the bank account being setup */
    personalBankAccountDraft: OnyxEntry<PersonalBankAccountForm>;

    /** Contains plaid data */
    plaidData: OnyxEntry<PlaidData>;
};

type PlaidStepProps = PlaidOnyxProps & SubStepProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;

function PlaidStep({personalBankAccountDraft, onNext, plaidData}: PlaidStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const selectedPlaidAccountID = personalBankAccountDraft?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? '';

    const handleNextPress = useCallback(() => {
        const selectedPlaidBankAccount = (plaidData?.bankAccounts ?? []).find(
            (account) => account.plaidAccountID === personalBankAccountDraft?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? null,
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

        BankAccounts.updateAddPersonalBankAccountDraft(bankAccountData);
        onNext();
    }, [onNext, personalBankAccountDraft, plaidData]);

    const handleSelectPlaidAccount = (plaidAccountID: string) => {
        BankAccounts.updateAddPersonalBankAccountDraft({plaidAccountID});
    };

    useEffect(() => {
        const plaidBankAccounts = plaidData?.bankAccounts ?? [];
        if (isFocused || plaidBankAccounts.length) {
            return;
        }
        BankAccounts.clearPersonalBankAccountSetupType();
    }, [isFocused, plaidData]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            validate={BankAccounts.validatePlaidSelection}
            onSubmit={handleNextPress}
            scrollContextEnabled
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
            isSubmitButtonVisible={(plaidData?.bankAccounts ?? []).length > 0}
        >
            <InputWrapper
                InputComponent={AddPlaidBankAccount}
                text={translate('walletPage.chooseAccountBody')}
                onSelect={handleSelectPlaidAccount}
                plaidData={plaidData}
                onExitPlaid={BankAccounts.clearPersonalBankAccountSetupType}
                allowDebit
                isDisplayedInWalletFlow
                selectedPlaidAccountID={selectedPlaidAccountID}
                inputID={BANK_INFO_STEP_KEYS.SELECTED_PLAID_ACCOUNT_ID}
                defaultValue={selectedPlaidAccountID}
            />
        </FormProvider>
    );
}

PlaidStep.displayName = 'PlaidStep';

export default withOnyx<PlaidStepProps, PlaidOnyxProps>({
    personalBankAccountDraft: {
        key: ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT,
    },
    plaidData: {
        key: ONYXKEYS.PLAID_DATA,
    },
})(PlaidStep);
