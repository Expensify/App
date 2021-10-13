import _ from 'underscore';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import ConfirmModal from '../../components/ConfirmModal';
import {cancelResetFreePlanBankAccount, resetFreePlanBankAccount} from '../../libs/actions/BankAccounts';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import reimbursementAccountPropTypes from '../ReimbursementAccount/reimbursementAccountPropTypes';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import bankAccountPropTypes from '../../components/bankAccountPropTypes';
import Text from '../../components/Text';
import styles from '../../styles/styles';

const propTypes = {
    /** Reimbursement account data */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** List of bank accounts */
    bankAccountList: PropTypes.arrayOf(bankAccountPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {},
    bankAccountList: [],
};

const WorkspaceResetBankAccountModal = (props) => {
    const isEnableStep = lodashGet(props.reimbursementAccount, 'achData.currentStep') === CONST.BANK_ACCOUNT.STEP.ENABLE;
    const bankAccountID = lodashGet(props.reimbursementAccount, 'achData.bankAccountID');
    const account = _.find(props.bankAccountList, bankAccount => bankAccount.bankAccountID === bankAccountID);
    const bankShortName = account ? `${account.addressName} ${account.accountNumber.slice(-4)}` : '';
    return (
        <ConfirmModal
            title="Are you sure?"
            confirmText={isEnableStep ? 'Yes, disconnect my bank account' : 'Yes, start over'}
            cancelText="Cancel"
            prompt={isEnableStep ? (
                <Text>
                    <Text>Disconnect your </Text>
                    <Text style={styles.textStrong}>
                        {bankShortName}
                    </Text>
                    <Text> bank account. Any outstanding transactions for this account will still complete.</Text>
                </Text>
            ) : 'Starting over will clear the progress you have made so far.'}
            danger
            onCancel={cancelResetFreePlanBankAccount}
            onConfirm={() => resetFreePlanBankAccount()}
            shouldShowCancelButton
            isVisible={lodashGet(props.reimbursementAccount, 'shouldShowResetModal', false)}
        />
    );
};

WorkspaceResetBankAccountModal.displayName = 'WorkspaceResetBankAccountModal';
WorkspaceResetBankAccountModal.propTypes = propTypes;
WorkspaceResetBankAccountModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
            initWithStoredValues: false,
        },
    }),
)(WorkspaceResetBankAccountModal);
