import type {NavigationAction} from '@react-navigation/native';
import {useFocusEffect, useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigationRef from '@libs/Navigation/navigationRef';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';
import getDiscardChangesModalConfig from './getDiscardChangesModalConfig';
import type {DiscardChangesConfirmation} from './types';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({
    getHasUnsavedChanges,
    onCancel,
    onVisibilityChange,
    onConfirm,
    onTabSwitchDiscard,
}: UseDiscardChangesConfirmationOptions): DiscardChangesConfirmation {
    const route = useRoute();
    const {translate} = useLocalize();
    const {showConfirmModal, closeModal} = useConfirmModal();

    // Also guard tab switches when this screen is an OnyxTabNavigator tab.
    // Self-disables outside a tab navigator or without an onTabSwitchDiscard handler
    useRegisterTabSwitchGuard(route.name, getHasUnsavedChanges, onTabSwitchDiscard, onCancel);
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const shouldNavigateBack = useRef(false);
    const isDiscardModalOpen = useRef(false);
    const isRestoringHistory = useRef(false);
    const didPreventResetOnPopstate = useRef(false);
    const shouldDismissModalOnRestore = useRef(false);

    // Only the focused screen should prompt — a flow-leave reset fires `beforeRemove` for hidden siblings too.
    const isFocused = useIsFocused();
    const isSavingRef = useRef(false);
    useFocusEffect(() => {
        isSavingRef.current = false;
    });
    const hasUnsavedChanges = () => isFocused && !isSavingRef.current && getHasUnsavedChanges();

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
            ...getDiscardChangesModalConfig(translate),
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

        if (!hasUnsavedChanges()) {
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
        showDiscardModal();
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
        // Register once: the listener reads the latest `closeModal` through `closeModalRef`, so it never needs to re-subscribe
        const handlePopState = () => {
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

    const notifySaving = (isSaving = true) => {
        isSavingRef.current = isSaving;
    };

    return {notifySaving};
}

export default useDiscardChangesConfirmation;
