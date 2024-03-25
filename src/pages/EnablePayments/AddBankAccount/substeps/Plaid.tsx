import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccountActions from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {PlaidData, ReimbursementAccount} from '@src/types/onyx';

type PlaidOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    personalBankAccountDraft: OnyxEntry<ReimbursementAccountForm>;

    /** Contains plaid data */
    plaidData: OnyxEntry<PlaidData>;
};

type PlaidProps = PlaidOnyxProps & SubStepProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;

const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
    const errorFields: FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> = {};

    if (!values.selectedPlaidAccountID) {
        errorFields.selectedPlaidAccountID = 'bankAccount.error.youNeedToSelectAnOption';
    }

    return errorFields;
};

function Plaid({personalBankAccountDraft, onNext, plaidData}: PlaidProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const selectedPlaidAccountID = personalBankAccountDraft?.plaidAccountID ?? '';

    useEffect(() => {
        const plaidBankAccounts = plaidData?.bankAccounts ?? [];
        if (isFocused || plaidBankAccounts.length) {
            return;
        }
        BankAccounts.setBankAccountSubStep(null);
    }, [isFocused, plaidData]);

    const handleNextPress = useCallback(() => {
        onNext();
    }, [onNext]);

    const bankAccountID = '';
    console.log({
        bank: plaidData?.bankAccounts,
    });



    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            validate={validate}
            onSubmit={handleNextPress}
            scrollContextEnabled
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
            isSubmitButtonVisible={(plaidData?.bankAccounts ?? []).length > 0}
        >
            <InputWrapper
                InputComponent={AddPlaidBankAccount}
                text={translate('bankAccount.chooseAccountBody')}
                onSelect={(plaidAccountID: string) => {
                    BankAccounts.updateAddPersonalBankAccountDraft({plaidAccountID});
                }}
                plaidData={plaidData}
                onExitPlaid={() => BankAccounts.setBankAccountSubStep(null)}
                allowDebit
                isNewWalletFlow
                bankAccountID={bankAccountID}
                selectedPlaidAccountID={selectedPlaidAccountID}
                inputID={BANK_INFO_STEP_KEYS.SELECTED_PLAID_ACCOUNT_ID}
                inputMode={CONST.INPUT_MODE.TEXT}
                style={[styles.mt5]}
                defaultValue={selectedPlaidAccountID}
            />
        </FormProvider>
    );
}

Plaid.displayName = 'Plaid';

export default withOnyx<PlaidProps, PlaidOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    personalBankAccountDraft: {
        key: ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_DRAFT,
    },
    plaidData: {
        key: ONYXKEYS.PLAID_DATA,
    },
})(Plaid);
