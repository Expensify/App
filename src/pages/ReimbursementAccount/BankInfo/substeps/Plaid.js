import {useIsFocused} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import Form from '@components/Form';
import useLocalize from '@hooks/useLocalize';
import * as PlaidDataProps from '@pages/ReimbursementAccount/plaidDataPropTypes';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** Contains plaid data */
    plaidData: PlaidDataProps.plaidDataPropTypes,

    ...subStepPropTypes,
};

const bankInfoStepKeys = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
    plaidData: PlaidDataProps.plaidDataDefaultProps,
};

function Plaid({reimbursementAccount, reimbursementAccountDraft, onNext, plaidData}) {
    const {translate} = useLocalize();
    const isFocused = useIsFocused();

    const validate = useCallback((values) => {
        const errorFields = {};
        if (!values.acceptTerms) {
            errorFields.acceptTerms = 'common.error.acceptTerms';
        }

        return errorFields;
    }, []);

    useEffect(() => {
        const plaidBankAccounts = lodashGet(plaidData, 'bankAccounts', []);
        if (isFocused || plaidBankAccounts.length) {
            return;
        }
        BankAccounts.setBankAccountSubStep(null);
    }, [isFocused, plaidData]);

    const handleNextPress = useCallback(() => {
        const selectedPlaidBankAccount = _.findWhere(lodashGet(plaidData, 'bankAccounts', []), {
            plaidAccountID: lodashGet(reimbursementAccountDraft, 'plaidAccountID', ''),
        });

        const bankAccountData = {
            [bankInfoStepKeys.ROUTING_NUMBER]: selectedPlaidBankAccount.routingNumber,
            [bankInfoStepKeys.ACCOUNT_NUMBER]: selectedPlaidBankAccount.accountNumber,
            [bankInfoStepKeys.PLAID_MASK]: selectedPlaidBankAccount.mask,
            [bankInfoStepKeys.IS_SAVINGS]: selectedPlaidBankAccount.isSavings,
            [bankInfoStepKeys.BANK_NAME]: lodashGet(plaidData, 'bankName', ''),
            [bankInfoStepKeys.PLAID_ACCOUNT_ID]: selectedPlaidBankAccount.plaidAccountID,
            [bankInfoStepKeys.PLAID_ACCESS_TOKEN]: lodashGet(plaidData, 'plaidAccessToken', ''),
        };

        ReimbursementAccount.updateReimbursementAccountDraft(bankAccountData);
        onNext();
    }, [plaidData, reimbursementAccountDraft, onNext]);

    const bankAccountID = Number(getDefaultValueForReimbursementAccountField(reimbursementAccount, bankInfoStepKeys.BANK_ACCOUNT_ID, 0));
    const selectedPlaidAccountID = lodashGet(reimbursementAccountDraft, 'plaidAccountID', '');

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            validate={validate}
            onSubmit={handleNextPress}
            scrollContextEnabled
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
            isSubmitButtonVisible={Boolean(selectedPlaidAccountID) && !_.isEmpty(lodashGet(plaidData, 'bankAccounts'))}
        >
            <AddPlaidBankAccount
                onSelect={(plaidAccountID) => {
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
Plaid.defaultProps = defaultProps;
Plaid.propTypes = propTypes;

export default withOnyx({
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
