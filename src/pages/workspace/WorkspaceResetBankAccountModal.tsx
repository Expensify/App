import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import BankAccount from '@libs/models/BankAccount';
import {cancelResetBankAccount, resetNonUSDBankAccount, resetUSDBankAccount} from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceResetBankAccountModalProps = {
    /** Reimbursement account data */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** Method to set the state of shouldShowConnectedVerifiedBankAccount */
    setShouldShowConnectedVerifiedBankAccount?: (shouldShowConnectedVerifiedBankAccount: boolean) => void;

    /** Method to set the state of shouldShowContinueSetupButton */
    setShouldShowContinueSetupButton?: (shouldShowContinueSetupButton: boolean) => void;

    /** Method to set the state of setUSDBankAccountStep */
    setUSDBankAccountStep?: (step: string | null) => void;

    /** Method to set the state of setNonUSDBankAccountStep */
    setNonUSDBankAccountStep?: (step: string | null) => void;

    /** Whether the workspace currency is set to non USD currency */
    isNonUSDWorkspace: boolean;
};

function WorkspaceResetBankAccountModal({
    reimbursementAccount,
    setShouldShowConnectedVerifiedBankAccount,
    setUSDBankAccountStep,
    setNonUSDBankAccountStep,
    isNonUSDWorkspace,
    setShouldShowContinueSetupButton,
}: WorkspaceResetBankAccountModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const achData = reimbursementAccount?.achData;
    const isInOpenState = achData?.state === BankAccount.STATE.OPEN;
    const bankAccountID = achData?.bankAccountID;
    const bankShortName = `${achData?.addressName ?? ''} ${(achData?.accountNumber ?? '').slice(-4)}`;

    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
        canBeMissing: true,
        selector: (paymentMethods) => (policyID ? (paymentMethods?.[policyID] as OnyxTypes.LastPaymentMethodType) : undefined),
    });

    const handleConfirm = () => {
        if (isNonUSDWorkspace) {
            resetNonUSDBankAccount(policyID, policy?.achAccount);

            if (setShouldShowConnectedVerifiedBankAccount) {
                setShouldShowConnectedVerifiedBankAccount(false);
            }

            if (setShouldShowContinueSetupButton) {
                setShouldShowContinueSetupButton(false);
            }

            if (setNonUSDBankAccountStep) {
                setNonUSDBankAccountStep(null);
            }
        } else {
            resetUSDBankAccount(bankAccountID, session, policyID, lastPaymentMethod);

            if (setShouldShowContinueSetupButton) {
                setShouldShowContinueSetupButton(false);
            }

            if (setShouldShowConnectedVerifiedBankAccount) {
                setShouldShowConnectedVerifiedBankAccount(false);
            }

            if (setUSDBankAccountStep) {
                setUSDBankAccountStep(null);
            }
        }
    };

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
            onCancel={cancelResetBankAccount}
            onConfirm={handleConfirm}
            shouldShowCancelButton
            isVisible
        />
    );
}

WorkspaceResetBankAccountModal.displayName = 'WorkspaceResetBankAccountModal';

export default WorkspaceResetBankAccountModal;
