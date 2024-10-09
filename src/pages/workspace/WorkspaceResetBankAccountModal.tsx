import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import BankAccount from '@libs/models/BankAccount';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceResetBankAccountModalOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;
};

type WorkspaceResetBankAccountModalProps = WorkspaceResetBankAccountModalOnyxProps & {
    /** Reimbursement account data */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;
};

function WorkspaceResetBankAccountModal({reimbursementAccount, session}: WorkspaceResetBankAccountModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const achData = reimbursementAccount?.achData;
    const isInOpenState = achData?.state === BankAccount.STATE.OPEN;
    const bankAccountID = achData?.bankAccountID;
    const bankShortName = `${achData?.addressName ?? ''} ${(achData?.accountNumber ?? '').slice(-4)}`;

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
            onConfirm={() => BankAccounts.resetFreePlanBankAccount(bankAccountID, session, achData?.policyID)}
            shouldShowCancelButton
            isVisible
        />
    );
}

WorkspaceResetBankAccountModal.displayName = 'WorkspaceResetBankAccountModal';

export default withOnyx<WorkspaceResetBankAccountModalProps, WorkspaceResetBankAccountModalOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(WorkspaceResetBankAccountModal);
