import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {cancelResetBankAccount, resetNonUSDBankAccount, resetUSDBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

    /** Whether the workspace currency is set to non USD currency */
    isNonUSDWorkspace: boolean;

    /** Method to navigate after resetting bank account */
    navigateAfterReset?: () => void;
};

function WorkspaceResetBankAccountModal({
    reimbursementAccount,
    setShouldShowConnectedVerifiedBankAccount,
    setUSDBankAccountStep,
    isNonUSDWorkspace,
    setShouldShowContinueSetupButton,
    navigateAfterReset,
}: WorkspaceResetBankAccountModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const achData = reimbursementAccount?.achData;
    const isInOpenState = achData?.state === CONST.BANK_ACCOUNT.STATE.OPEN;
    const bankAccountID = achData?.bankAccountID;
    const bankShortName = `${achData?.addressName ?? ''} ${(achData?.accountNumber ?? '').slice(-4)}`;

    const lastPaymentMethodSelector = useCallback(
        (paymentMethods: OnyxEntry<OnyxTypes.LastPaymentMethod>) => (policyID ? (paymentMethods?.[policyID] as OnyxTypes.LastPaymentMethodType) : undefined),
        [policyID],
    );
    const [lastPaymentMethod] = useOnyx(
        ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
        {
            selector: lastPaymentMethodSelector,
        },
        [lastPaymentMethodSelector],
    );

    const handleConfirm = () => {
        if (isNonUSDWorkspace) {
            resetNonUSDBankAccount(policyID, policy?.achAccount, achData?.bankAccountID, lastPaymentMethod);

            if (setShouldShowConnectedVerifiedBankAccount) {
                setShouldShowConnectedVerifiedBankAccount(false);
            }

            if (setShouldShowContinueSetupButton) {
                setShouldShowContinueSetupButton(false);
            }

            Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID: policyID ?? '', page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.CURRENCY_AND_COUNTRY}));
        } else {
            resetUSDBankAccount(bankAccountID, session, policyID, policy?.achAccount, lastPaymentMethod);

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
        if (navigateAfterReset) {
            navigateAfterReset();
        }
    };

    return (
        <ConfirmModal
            title={translate('workspace.bankAccount.areYouSure')}
            confirmText={isInOpenState ? translate('workspace.bankAccount.yesDisconnectMyBankAccount') : translate('workspace.bankAccount.yesStartOver')}
            cancelText={translate('common.cancel')}
            prompt={
                isInOpenState ? (
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML html={translate('workspace.bankAccount.disconnectYourBankAccount', bankShortName)} />
                    </View>
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

export default WorkspaceResetBankAccountModal;
