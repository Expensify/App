import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FormProvider from '@components/Form/FormProvider';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type PlaidOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<OnyxTypes.ReimbursementAccountDraft>;

    /** Contains plaid data */
    plaidData: OnyxEntry<OnyxTypes.PlaidData>;
};

type PlaidProps = PlaidOnyxProps & SubStepProps;

type ValuesToValidate = {
    acceptTerms: boolean;
};

const BANK_INFO_STEP_KEYS = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;

function Plaid({reimbursementAccount, reimbursementAccountDraft, onNext, plaidData}: PlaidProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();

    const validate = useCallback((values: ValuesToValidate): Errors => {
        const errorFields: Errors = {};
        if (!values.acceptTerms) {
            errorFields.acceptTerms = 'common.error.acceptTerms';
        }

        return errorFields;
    }, []);

    useEffect(() => {
        const plaidBankAccounts = plaidData?.bankAccounts ?? [];
        if (isFocused || plaidBankAccounts.length) {
            return;
        }
        BankAccounts.setBankAccountSubStep(null);
    }, [isFocused, plaidData]);

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

        ReimbursementAccount.updateReimbursementAccountDraft(bankAccountData);
        onNext();
    }, [plaidData, reimbursementAccountDraft, onNext]);

    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const selectedPlaidAccountID = reimbursementAccountDraft?.[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? '';

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            validate={validate}
            onSubmit={handleNextPress}
            scrollContextEnabled
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
            isSubmitButtonVisible={!!selectedPlaidAccountID && (plaidData?.bankAccounts ?? []).length > 0}
        >
            <AddPlaidBankAccount
                text={translate('bankAccount.plaidBodyCopy')}
                onSelect={(plaidAccountID: string) => {
                    ReimbursementAccount.updateReimbursementAccountDraft({plaidAccountID});
                }}
                plaidData={plaidData}
                onExitPlaid={() => BankAccounts.setBankAccountSubStep(null)}
                allowDebit
                bankAccountID={bankAccountID}
                selectedPlaidAccountID={selectedPlaidAccountID}
                isDisplayedInNewVBBA
            />
        </FormProvider>
    );
}

Plaid.displayName = 'Plaid';

export default withOnyx<PlaidProps, PlaidOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
    plaidData: {
        key: ONYXKEYS.PLAID_DATA,
    },
})(Plaid);
