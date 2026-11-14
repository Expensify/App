/**
 * Keeps the domain close-account flow in browser history so Back returns through its two steps without leaving the app.
 */
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useSyncModalWithHistory from '@components/Modal/useSyncModalWithHistory';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import {useEffect, useRef, useState} from 'react';

import useConfirmModal from './useConfirmModal';
import useDecisionModal from './useDecisionModal';
import useLocalize from './useLocalize';

const CLOSE_ACCOUNT_DECISION_MODAL_ID = 'CloseDomainAccountDecisionModal';
const CLOSE_ACCOUNT_CONFIRM_MODAL_ID = 'CloseDomainAccountConfirmModal';

const CLOSE_ACCOUNT_STEP = {
    DECISION: 'decision',
    CONFIRM: 'confirm',
} as const;

type CloseAccountStep = (typeof CLOSE_ACCOUNT_STEP)[keyof typeof CLOSE_ACCOUNT_STEP];

/**
 * Shows the domain "Close account" flow: a choice between a safe and a forced close, then a confirmation.
 *
 * Browser Back on the confirmation returns to the choice, and Back on the choice closes it. The modals don't add their own
 * history entries, because the choice is re-opened in response to Back. An entry added then has no user gesture, and Chrome
 * skips such entries on the next Back, so Back would stop closing the choice. Instead this hook keeps two entries that are
 * both added by a click: one for the whole flow and one for the confirmation step.
 */
function useCloseDomainAccountModal() {
    const {translate} = useLocalize();
    const decisionModal = useDecisionModal();
    const {showDecisionModal} = decisionModal;
    const {showConfirmModal} = useConfirmModal();
    const [step, setStep] = useState<CloseAccountStep | null>(null);
    const flowEndedCallbacksRef = useRef<Array<(isActive: boolean) => void>>([]);

    // Removed last by Back, so Back while the choice is shown closes the choice and ends the flow
    useSyncModalWithHistory({
        isVisible: step !== null,
        shouldHandleNavigationBack: true,
        onClose: () => decisionModal.closeModalByID(CLOSE_ACCOUNT_DECISION_MODAL_ID, {action: ModalActions.DISMISS}),
    });

    // Removed first by Back, so Back while the confirmation is shown returns to the choice without adding a new entry
    useSyncModalWithHistory({
        isVisible: step === CLOSE_ACCOUNT_STEP.CONFIRM,
        shouldHandleNavigationBack: true,
        onClose: () => decisionModal.closeModalByID(CLOSE_ACCOUNT_CONFIRM_MODAL_ID, {action: ModalActions.CLOSE}),
    });

    // The history entries are removed after the next navigation tick. Callers wait for that before they navigate,
    // so the browser goes back over the entries of this flow instead of a navigation that comes after them.
    useEffect(() => {
        if (step !== null) {
            return;
        }
        const callbacks = flowEndedCallbacksRef.current;
        flowEndedCallbacksRef.current = [];
        let isActive = true;
        Navigation.isNavigationReady().then(() => {
            for (const callback of callbacks) {
                callback(isActive);
            }
        });
        return () => {
            // A page that left the flow must not close an account when navigation becomes ready later.
            isActive = false;
        };
    }, [step]);

    const endFlow = () =>
        new Promise<boolean>((resolve) => {
            flowEndedCallbacksRef.current.push(resolve);
            setStep(null);
        });

    /** Resolves with whether the admin chose to force close the account, or with undefined when they left the flow */
    const showCloseAccountModal = async (count: number): Promise<boolean | undefined> => {
        setStep(CLOSE_ACCOUNT_STEP.DECISION);
        const decision = await showDecisionModal({
            id: CLOSE_ACCOUNT_DECISION_MODAL_ID,
            shouldHandleNavigationBack: false,
            title: translate('domain.members.closeAccount', {count}),
            prompt: translate('domain.members.closeAccountInfo', {count}),
            secondOptionText: translate('domain.members.safeCloseAccount', {count}),
            firstOptionText: translate('domain.members.forceCloseAccount', {count}),
            isFirstOptionDanger: true,
            isSecondOptionSuccess: true,
            shouldReportDismiss: true,
        });

        if (decision.action === ModalActions.DISMISS) {
            setStep(null);
            return undefined;
        }

        setStep(CLOSE_ACCOUNT_STEP.CONFIRM);
        const result = await showConfirmModal({
            id: CLOSE_ACCOUNT_CONFIRM_MODAL_ID,
            shouldHandleNavigationBack: false,
            title: translate('domain.members.closeAccount', {count}),
            prompt: translate('domain.members.closeAccountPrompt'),
            confirmText: translate('domain.members.closeAccount', {count}),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            shouldShowCancelButton: true,
        });

        if (result.action !== ModalActions.CONFIRM) {
            return showCloseAccountModal(count);
        }

        if (!(await endFlow())) {
            return undefined;
        }
        return decision.action === ModalActions.CONFIRM;
    };

    return {showCloseAccountModal};
}

export default useCloseDomainAccountModal;
