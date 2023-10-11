import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ConfirmModal from '../../components/ConfirmModal';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import * as ReimbursementAccountProps from '../ReimbursementAccount/reimbursementAccountPropTypes';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import BankAccount from '../../libs/models/BankAccount';
import ONYXKEYS from '../../ONYXKEYS';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** Reimbursement account data */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }).isRequired,
};

function WorkspaceResetBankAccountModal({reimbursementAccount, session}) {
    const {translate} = useLocalize();
    const achData = lodashGet(reimbursementAccount, 'achData') || {};
    const isInOpenState = achData.state === BankAccount.STATE.OPEN;
    const bankAccountID = achData.bankAccountID;
    const bankShortName = `${achData.addressName || ''} ${(achData.accountNumber || '').slice(-4)}`;

    return (
        <ConfirmModal
            title={translate('workspace.bankAccount.areYouSure')}
            confirmText={isInOpenState ? translate('workspace.bankAccount.yesDisconnectMyBankAccount') : translate('workspace.bankAccount.yesStartOver')}
            cancelText={translate('common.cancel')}
            prompt={
                isInOpenState ? (
                    <Text>
                        <Text>{translate('workspace.bankAccount.disconnectYour')}</Text>
                        <Text style={styles.textStrong}>{bankShortName}</Text>
                        <Text>{translate('workspace.bankAccount.bankAccountAnyTransactions')}</Text>
                    </Text>
                ) : (
                    translate('workspace.bankAccount.clearProgress')
                )
            }
            danger
            onCancel={BankAccounts.cancelResetFreePlanBankAccount}
            onConfirm={() => BankAccounts.resetFreePlanBankAccount(bankAccountID, session)}
            shouldShowCancelButton
            isVisible
        />
    );
}

WorkspaceResetBankAccountModal.displayName = 'WorkspaceResetBankAccountModal';
WorkspaceResetBankAccountModal.propTypes = propTypes;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(WorkspaceResetBankAccountModal);
