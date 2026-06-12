import type {NavigationAction} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {isInternalPopstateInProgress} from '@components/Modal/internalPopstateGuard';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import navigationRef from '@libs/Navigation/navigationRef';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({getHasUnsavedChanges, onCancel, onVisibilityChange, onConfirm}: UseDiscardChangesConfirmationOptions) {
    const {translate} = useLocalize();
    const {showConfirmModal, closeModal} = useConfirmModal();
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const shouldNavigateBack = useRef(false);
    const isDiscardModalOpen = useRef(false);
    const isRestoringHistory = useRef(false);
    const didPreventResetOnPopstate = useRef(false);
    const shouldDismissModalOnRestore = useRef(false);

    const navigateBack = () => {
        if (!blockedNavigationAction.current) {
            return;
        }
        shouldNavigateBack.current = true;
        navigationRef.current?.dispatch(blockedNavigationAction.current);
        shouldNavigateBack.current = false;
    };

    const showDiscardModal = () => {
        isDiscardModalOpen.current = true;
        onVisibilityChange?.(true);
        showConfirmModal({
            title: translate('discardChangesConfirmation.title'),
            prompt: translate('discardChangesConfirmation.body'),
            danger: true,
            confirmText: translate('discardChangesConfirmation.confirmText'),
            cancelText: translate('common.cancel'),
            shouldIgnoreBackHandlerDuringTransition: true,
            shouldHandleNavigationBack: false,
        }).then((result) => {
            isDiscardModalOpen.current = false;
            didPreventResetOnPopstate.current = false;
            shouldDismissModalOnRestore.current = false;
            onVisibilityChange?.(false);
            if (result.action === ModalActions.CONFIRM) {
                Promise.resolve()
                    .then(() => onConfirm?.())
                    .then(() => {
                        setNavigationActionToMicrotaskQueue(navigateBack);
                    })
                    .catch((error: unknown) => {
                        Log.warn('[useDiscardChangesConfirmation] Failed to run onConfirm callback', {error});
                        blockedNavigationAction.current = undefined;
                        shouldNavigateBack.current = false;
                    });
            } else {
                blockedNavigationAction.current = undefined;
                shouldNavigateBack.current = false;
                onCancel?.();
            }
        });
    };

    useBeforeRemove((e) => {
        if (isRestoringHistory.current) {
            // The `history.go(1)` restoring the browser entry can re-deliver a reset for the current state; swallow it without re-blocking
            e.preventDefault();
            return;
        }

        if (!getHasUnsavedChanges()) {
            return;
        }

        if (isDiscardModalOpen.current) {
            e.preventDefault();
            if (e.data.action.type === 'RESET') {
                didPreventResetOnPopstate.current = true;
                shouldDismissModalOnRestore.current = true;
                return;
            }
            closeModal();
            return;
        }

        if (shouldNavigateBack.current) {
            return;
        }

        e.preventDefault();
        blockedNavigationAction.current = e.data.action;
        if (e.data.action.type === 'RESET') {
            // A prevented RESET comes from a browser back; the popstate listener must restore the URL
            didPreventResetOnPopstate.current = true;
        }
        navigateAfterInteraction(showDiscardModal);
    });

    // `closeModal` changes every render, so the once-registered popstate listener reads it through a ref
    const closeModalRef = useRef(closeModal);
    useEffect(() => {
        closeModalRef.current = closeModal;
    });

    /**
     * Browser back is blocked by the patched `beforeRemove` before the state commits, but the browser entry has
     * already moved — this listener restores it with `history.go(1)`, and dismisses the prompt as Cancel when the back happened over it.
     */
    useEffect(() => {
        // Register exactly once: re-registering on render would move this listener behind `withInternalPopstate`'s one-shot flag reset, breaking the internal-popstate detection
        const handlePopState = () => {
            if (isInternalPopstateInProgress()) {
                return;
            }
            if (isRestoringHistory.current) {
                isRestoringHistory.current = false;
                return;
            }
            if (didPreventResetOnPopstate.current) {
                didPreventResetOnPopstate.current = false;
                isRestoringHistory.current = true;
                window.history.go(1);
                if (shouldDismissModalOnRestore.current) {
                    shouldDismissModalOnRestore.current = false;
                    closeModalRef.current();
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
}

export default useDiscardChangesConfirmation;
