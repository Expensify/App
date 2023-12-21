import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import {OnyxEntry} from 'react-native-onyx/lib/types';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import Form from '@components/Form';
import useLocalize from '@hooks/useLocalize';
import {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PlaidDataProps from '@pages/ReimbursementAccount/plaidDataPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {PlaidData, ReimbursementAccountDraft, ReimbursementAccount as TReimbursementAccount} from '@src/types/onyx';

type PlaidOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<TReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;

    /** Contains plaid data */
    plaidData: OnyxEntry<PlaidData>;
};

type PlaidProps = PlaidOnyxProps & SubStepProps;

const bankInfoStepKeys = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;

function Plaid({
    reimbursementAccount = ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft,
    onNext,
    plaidData = PlaidDataProps.plaidDataDefaultProps,
}: PlaidProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();

    const validate = useCallback((values: {acceptTerms: boolean}) => {
        const errorFields: Record<string, string> = {};
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
        const selectedPlaidBankAccount = (plaidData?.bankAccounts ?? []).find((account) => account.plaidAccountID === reimbursementAccountDraft?.plaidAccountID) ?? null;

        const bankAccountData = {
            [bankInfoStepKeys.ROUTING_NUMBER]: selectedPlaidBankAccount?.routingNumber,
            [bankInfoStepKeys.ACCOUNT_NUMBER]: selectedPlaidBankAccount?.accountNumber,
            [bankInfoStepKeys.PLAID_MASK]: selectedPlaidBankAccount?.mask,
            [bankInfoStepKeys.IS_SAVINGS]: selectedPlaidBankAccount?.isSavings,
            [bankInfoStepKeys.BANK_NAME]: plaidData?.bankName ?? '',
            [bankInfoStepKeys.PLAID_ACCOUNT_ID]: selectedPlaidBankAccount?.plaidAccountID,
            [bankInfoStepKeys.PLAID_ACCESS_TOKEN]: plaidData?.plaidAccessToken ?? '',
        };

        ReimbursementAccount.updateReimbursementAccountDraft(bankAccountData);
        onNext();
    }, [plaidData, reimbursementAccountDraft, onNext]);

    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const selectedPlaidAccountID = reimbursementAccountDraft?.plaidAccountID ?? '';

    return (
        // @ts-expect-error TODO: remove this once Form (https://github.com/Expensify/App/issues/31972) is migrated to TS
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            validate={validate}
            onSubmit={handleNextPress}
            scrollContextEnabled
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
            isSubmitButtonVisible={Boolean(selectedPlaidAccountID) && (plaidData?.bankAccounts ?? []).length > 0}
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
        </Form>
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
