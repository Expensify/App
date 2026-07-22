import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';
import {getBankAccountIDAsNumber} from '@libs/ReimbursementAccountUtils';

import type BankInfoSubStepProps from '@pages/ReimbursementAccount/USD/BankInfo/types';

import {setBankAccountSubStep, validatePlaidSelection} from '@userActions/BankAccounts';
import {updateReimbursementAccountDraft} from '@userActions/ReimbursementAccount';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';

type ReimbursementAccountNavigatorRoute = PlatformStackRouteProp<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_USD>;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;

function Plaid({onNext}: BankInfoSubStepProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);

    const route = useRoute<ReimbursementAccountNavigatorRoute>();
    const {policyID, backTo} = route?.params ?? {};

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

    const bankAccountID = getBankAccountIDAsNumber(reimbursementAccount?.achData);

    useEffect(() => {
        const plaidBankAccounts = plaidData?.bankAccounts ?? [];

        // Only cleanup if the screen has been intentionally blurred (was focused, now not focused)
        // This prevents cleanup during transient focus changes during navigation
        const wasIntentionallyBlurred = prevIsFocused && !isFocused;

        if (isFocused || plaidBankAccounts.length || !wasIntentionallyBlurred) {
            return;
        }
        setBankAccountSubStep(null);
    }, [isFocused, prevIsFocused, plaidData?.bankAccounts]);

    const handlePlaidExit = () => {
        setBankAccountSubStep(null);
        Navigation.goBack(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID, backTo}));
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            validate={validatePlaidSelection}
            onSubmit={handleNextPress}
            scrollContextEnabled
            submitButtonText={translate('common.next')}
            style={styles.flexGrow1}
            submitButtonStyles={styles.mh5}
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

export default Plaid;
