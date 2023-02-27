import lodashGet from 'lodash/get';
import React from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as ReimbursementAccountProps from '../ReimbursementAccount/reimbursementAccountPropTypes';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import BankAccount from '../../libs/models/BankAccount';

const propTypes = {
    /** Reimbursement account data */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceResetBankAccountModal = (props) => {
    const achData = lodashGet(props.reimbursementAccount, 'achData') || {};
    const isInOpenState = achData.state === BankAccount.STATE.OPEN;
    const bankAccountID = achData.bankAccountID;
    const bankShortName = `${achData.addressName || ''} ${(achData.accountNumber || '').slice(-4)}`;

    return (
        <ConfirmModal
            title={props.translate('workspace.bankAccount.areYouSure')}
            confirmText={isInOpenState ? props.translate('workspace.bankAccount.yesDisconnectMyBankAccount') : props.translate('workspace.bankAccount.yesStartOver')}
            cancelText={props.translate('common.cancel')}
            prompt={isInOpenState ? (
                <Text>
                    <Text>{props.translate('workspace.bankAccount.disconnectYour')}</Text>
                    <Text style={styles.textStrong}>
                        {bankShortName}
                    </Text>
                    <Text>{props.translate('workspace.bankAccount.bankAccountAnyTransactions')}</Text>
                </Text>
            ) : props.translate('workspace.bankAccount.clearProgress')}
            danger
            onCancel={BankAccounts.cancelResetFreePlanBankAccount}
            onConfirm={() => BankAccounts.resetFreePlanBankAccount(bankAccountID)}
            shouldShowCancelButton
            isVisible
        />
    );
};

WorkspaceResetBankAccountModal.displayName = 'WorkspaceResetBankAccountModal';
WorkspaceResetBankAccountModal.propTypes = propTypes;

export default withLocalize(WorkspaceResetBankAccountModal);
