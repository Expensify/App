import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import BankAccount from '@libs/models/BankAccount';
import {cancelResetFreePlanBankAccount, resetFreePlanBankAccount} from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceResetBankAccountModalProps = {
    /** Reimbursement account data */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;
};

function WorkspaceResetBankAccountModal({reimbursementAccount}: WorkspaceResetBankAccountModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION);
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
            onCancel={cancelResetFreePlanBankAccount}
            onConfirm={() => resetFreePlanBankAccount(bankAccountID, session, achData?.policyID)}
            shouldShowCancelButton
            isVisible
        />
    );
}

WorkspaceResetBankAccountModal.displayName = 'WorkspaceResetBankAccountModal';

export default WorkspaceResetBankAccountModal;
