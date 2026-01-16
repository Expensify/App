import React, {useState} from 'react';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalBankAccountDetailsFormSubmit from '@hooks/usePersonalBankAccountDetailsFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import Navigation from '@libs/Navigation/Navigation';
import {validatePlaidSelection} from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const STEP_FIELDS = [BANK_INFO_STEP_KEYS.SELECTED_PLAID_ACCOUNT_ID];

function PlaidBankAccountStep({onNext, isEditing}: SubStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selectedPlaidAccountId, setSelectedPlaidAccountId] = useState('');
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA, {canBeMissing: true});
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});

    const handleSubmit = usePersonalBankAccountDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            isSubmitButtonVisible={(plaidData?.bankAccounts ?? []).length > 0}
            scrollContextEnabled
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validatePlaidSelection}
            style={[styles.mh5, styles.flex1]}
            shouldHideFixErrorsAlert
        >
            <InputWrapper
                inputID={INPUT_IDS.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID}
                InputComponent={AddPlaidBankAccount}
                onSelect={setSelectedPlaidAccountId}
                text={translate('walletPage.chooseAccountBody')}
                plaidData={plaidData}
                defaultValue={bankAccountPersonalDetails?.selectedPlaidAccountID}
                isDisplayedInWalletFlow
                onExitPlaid={Navigation.goBack}
                receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                selectedPlaidAccountID={bankAccountPersonalDetails?.selectedPlaidAccountID ?? selectedPlaidAccountId}
            />
        </FormProvider>
    );
}
PlaidBankAccountStep.displayName = 'PlaidBankAccountStep';

export default PlaidBankAccountStep;
