import React, {useCallback, useEffect, useEffectEvent, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import Navigation from '@libs/Navigation/Navigation';
import {cancelResetBankAccount, resetNonUSDBankAccount, resetUSDBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useThemeStyles from './useThemeStyles';

type ResetBankAccountModalOptions = {
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

    /** Back to url to pass along to the non-USD bank account setup flow */
    backTo?: Route;
};

/**
 * Watches `reimbursementAccount.shouldShowResetModal` and opens the global confirm modal that lets the user
 * reset (disconnect / start over) their bank account when the flag transitions to `true`.
 */
function useResetBankAccountModal({
    reimbursementAccount,
    setShouldShowConnectedVerifiedBankAccount,
    setUSDBankAccountStep,
    isNonUSDWorkspace,
    setShouldShowContinueSetupButton,
    navigateAfterReset,
    backTo,
}: ResetBankAccountModalOptions) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const achData = reimbursementAccount?.achData;
    const shouldShowResetModal = reimbursementAccount?.shouldShowResetModal ?? false;
    const isInOpenState = achData?.state === CONST.BANK_ACCOUNT.STATE.OPEN;
    const bankAccountID = achData?.bankAccountID ?? policy?.achAccount?.bankAccountID;
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
            resetNonUSDBankAccount(policyID, policy?.achAccount, bankAccountID, lastPaymentMethod, policy?.owner);

            if (setShouldShowConnectedVerifiedBankAccount) {
                setShouldShowConnectedVerifiedBankAccount(false);
            }

            if (setShouldShowContinueSetupButton) {
                setShouldShowContinueSetupButton(false);
            }

            Navigation.navigate(
                ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID: policyID ?? CONST.POLICY.ID_FAKE, page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.CURRENCY_AND_COUNTRY, backTo}),
            );
        } else {
            resetUSDBankAccount(bankAccountID, session, policyID, policy?.achAccount, lastPaymentMethod, policy?.owner);

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

    // Guards against showing the modal more than once (e.g. React StrictMode double-invoking effects)
    const isModalOpenRef = useRef(false);
    // Tracks whether the consuming component is still mounted so we can discard the modal resolution
    // (destructive reset actions, parent state setters and navigation) if it unmounts while the modal is open.
    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const showResetModal = useEffectEvent(() => {
        if (isModalOpenRef.current) {
            return;
        }
        isModalOpenRef.current = true;
        showConfirmModal({
            title: translate('workspace.bankAccount.areYouSure'),
            confirmText: isInOpenState ? translate('workspace.bankAccount.yesDisconnectMyBankAccount') : translate('workspace.bankAccount.yesStartOver'),
            cancelText: translate('common.cancel'),
            prompt: isInOpenState ? (
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML html={translate('workspace.bankAccount.disconnectYourBankAccount', bankShortName)} />
                </View>
            ) : (
                translate('workspace.bankAccount.clearProgress')
            ),
            danger: true,
            shouldShowCancelButton: true,
        }).then(({action}) => {
            isModalOpenRef.current = false;
            // Discard the resolution if the consuming component unmounted while the modal was open
            if (!isMountedRef.current) {
                return;
            }
            if (action !== ModalActions.CONFIRM) {
                cancelResetBankAccount();
                return;
            }
            handleConfirm();
        });
    });

    useEffect(() => {
        if (!shouldShowResetModal) {
            isModalOpenRef.current = false;
            return;
        }
        showResetModal();
    }, [shouldShowResetModal]);
}

export default useResetBankAccountModal;
