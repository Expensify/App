import type {NavigationAction} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {isInternalPopstateInProgress} from '@components/Modal/internalPopstateGuard';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import {registerDiscardChangesScreen} from '@libs/Navigation/guards/DiscardChangesGuard';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import navigationRef from '@libs/Navigation/navigationRef';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({getHasUnsavedChanges, onCancel, onVisibilityChange, onConfirm}: UseDiscardChangesConfirmationOptions) {
    const route = useRoute();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const shouldNavigateBack = useRef(false);
    const shouldIgnoreNextBeforeRemove = useRef(false);
    const clearShouldIgnoreNextBeforeRemoveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const isDiscardModalOpen = useRef(false);
    const isRestoringHistory = useRef(false);
    const didSwallowBeforeRemove = useRef(false);
    const didPreventResetOnPopstate = useRef(false);

    const clearShouldIgnoreNextBeforeRemove = () => {
        if (clearShouldIgnoreNextBeforeRemoveTimeout.current) {
            clearTimeout(clearShouldIgnoreNextBeforeRemoveTimeout.current);
            clearShouldIgnoreNextBeforeRemoveTimeout.current = undefined;
        }
        shouldIgnoreNextBeforeRemove.current = false;
    };

    const markNextBeforeRemoveAsModalCleanup = () => {
        if ((window.history.state as {shouldGoBack?: boolean} | null)?.shouldGoBack !== true) {
            return;
        }

        shouldIgnoreNextBeforeRemove.current = true;
        if (clearShouldIgnoreNextBeforeRemoveTimeout.current) {
            clearTimeout(clearShouldIgnoreNextBeforeRemoveTimeout.current);
        }
        clearShouldIgnoreNextBeforeRemoveTimeout.current = setTimeout(() => {
            shouldIgnoreNextBeforeRemove.current = false;
            clearShouldIgnoreNextBeforeRemoveTimeout.current = undefined;
        }, 250);
    };

    const navigateBack = () => {
        if (blockedNavigationAction.current) {
            shouldNavigateBack.current = true;
            navigationRef.current?.dispatch(blockedNavigationAction.current);
            shouldNavigateBack.current = false;
            return;
        }
        if (!shouldNavigateBack.current) {
            return;
        }
        navigationRef.current?.goBack();
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
        }).then((result) => {
            markNextBeforeRemoveAsModalCleanup();
            isDiscardModalOpen.current = false;
            didPreventResetOnPopstate.current = false;
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
            clearShouldIgnoreNextBeforeRemove();
            return;
        }

        if (isDiscardModalOpen.current || shouldIgnoreNextBeforeRemove.current) {
            clearShouldIgnoreNextBeforeRemove();
            // The popstate listener must not treat the swallowed modal-cleanup echo as a new browser back
            didSwallowBeforeRemove.current = true;
            e.preventDefault();
            return;
        }

        if (shouldNavigateBack.current) {
            clearShouldIgnoreNextBeforeRemove();
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

    // Callbacks change every render, so stable consumers (the guard registration and the popstate listener) read them through refs
    const getHasUnsavedChangesRef = useRef(getHasUnsavedChanges);
    const showDiscardModalRef = useRef(showDiscardModal);
    useEffect(() => {
        getHasUnsavedChangesRef.current = getHasUnsavedChanges;
        showDiscardModalRef.current = showDiscardModal;
    });

    // The guard vetoes a browser-back reset that would unfocus this screen (e.g. a tab switch) BEFORE the state commits, so local form state survives untouched
    useEffect(
        () =>
            registerDiscardChangesScreen(route.key, {
                hasUnsavedChanges: () => !shouldNavigateBack.current && getHasUnsavedChangesRef.current(),
                onBlocked: (action) => {
                    blockedNavigationAction.current = action;
                    didPreventResetOnPopstate.current = true;
                    if (isDiscardModalOpen.current) {
                        return;
                    }
                    navigateAfterInteraction(() => showDiscardModalRef.current());
                },
            }),
        [route.key],
    );

    /**
     * Browser back is blocked before the state commits (removed routes via the patched `beforeRemove`, focus changes via `DiscardChangesGuard`),
     * but the browser entry has already moved — this listener's only job is restoring it with `history.go(1)`.
     */
    useEffect(() => {
        // Register exactly once: re-registering on render would move this listener behind `withInternalPopstate`'s one-shot flag reset, breaking the internal-popstate detection
        const handlePopState = () => {
            if (isInternalPopstateInProgress()) {
                didSwallowBeforeRemove.current = false;
                return;
            }
            if (didSwallowBeforeRemove.current) {
                didSwallowBeforeRemove.current = false;
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
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => clearShouldIgnoreNextBeforeRemove, [clearShouldIgnoreNextBeforeRemove]);
}

export default useDiscardChangesConfirmation;
