import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {setBankAccountSubStep, validatePlaidSelection} from '@userActions/BankAccounts';
import {updateReimbursementAccountDraft} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type PlaidProps = SubStepProps & {
    setUSDBankAccountStep: (step: string | null) => void;
};

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;

function Plaid({onNext, setUSDBankAccountStep}: PlaidProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA, {canBeMissing: true});

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const selectedPlaidAccountID = reimbursementAccountDraft?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? '';

    const handleNextPress = useCallback(() => {
        const selectedPlaidBankAccount = (plaidData?.bankAccounts ?? []).find((account) => account.plaidAccountID === reimbursementAccountDraft?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]);

        const bankAccountData = {
            [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.ROUTING_NUMBER],
            [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER],
            [BANK_INFO_STEP_KEYS.PLAID_MASK]: selectedPlaidBankAccount?.mask,
            [BANK_INFO_STEP_KEYS.IS_SAVINGS]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.IS_SAVINGS],
            [BANK_INFO_STEP_KEYS.BANK_NAME]: plaidData?.[BANK_INFO_STEP_KEYS.BANK_NAME] ?? '',
            [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: selectedPlaidBankAccount?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID],
            [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: plaidData?.[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] ?? '',
        };

        updateReimbursementAccountDraft(bankAccountData);
        onNext(bankAccountData);
    }, [plaidData, reimbursementAccountDraft, onNext]);

    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;

    useEffect(() => {
        const plaidBankAccounts = plaidData?.bankAccounts ?? [];

        // Only cleanup if the screen has been intentionally blurred (was focused, now not focused)
        // This prevents cleanup during transient focus changes during navigation
        const wasIntentionallyBlurred = prevIsFocused && !isFocused;

        if (isFocused || plaidBankAccounts.length || !wasIntentionallyBlurred) {
            return;
        }
        setBankAccountSubStep(null);
        setUSDBankAccountStep(null);
    }, [isFocused, prevIsFocused, plaidData?.bankAccounts, setUSDBankAccountStep]);

    const handlePlaidExit = () => {
        setBankAccountSubStep(null);
        setUSDBankAccountStep(null);
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
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
                text={translate('bankAccount.plaidBodyCopy')}
                onSelect={(plaidAccountID: string) => {
                    updateReimbursementAccountDraft({plaidAccountID});
                }}
                plaidData={plaidData}
                onExitPlaid={handlePlaidExit}
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
