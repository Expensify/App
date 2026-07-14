import {ModalActions} from '@components/Modal/Global/ModalContext';

import useBeforeRemove from '@hooks/useBeforeRemove';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';

import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigationRef from '@libs/Navigation/navigationRef';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import type {NavigationAction} from '@react-navigation/native';

import {useFocusEffect, useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

import type {DiscardChangesConfirmation} from './types';
import type UseDiscardChangesConfirmationOptions from './types';

import getDiscardChangesModalConfig from './getDiscardChangesModalConfig';
import runDiscardConfirmation from './runDiscardConfirmation';

/**
 * Tracks the `history.go(1)` restore round-trip so its echo popstate isn't mistaken for a fresh back: `awaitingRestore`
 * = a prevented reset awaiting its popstate; `restoring` = the `go(1)` in flight, awaiting its echo; `dismissModalOnRestore`
 * = the back happened over the open prompt.
 */
type RestoreState = {phase: 'idle'} | {phase: 'awaitingRestore'; dismissModalOnRestore: boolean} | {phase: 'restoring'};

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

    // Only the focused screen should prompt — a flow-leave reset fires `beforeRemove` for hidden siblings too.
    const isFocused = useIsFocused();
    const isSavingRef = useRef(false);
    useFocusEffect(() => {
        isSavingRef.current = false;
    });
    const hasUnsavedChanges = () => isFocused && !isSavingRef.current && getHasUnsavedChanges();

    useRegisterTabSwitchGuard(route.name, hasUnsavedChanges, onTabSwitchDiscard, onCancel);

    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const shouldNavigateBack = useRef(false);
    const isDiscardModalOpen = useRef(false);
    const restoreState = useRef<RestoreState>({phase: 'idle'});

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
            // The awaiting-restore reservation is only meaningful until the prompt resolves; an in-flight `restoring` must survive it.
            if (restoreState.current.phase === 'awaitingRestore') {
                restoreState.current = {phase: 'idle'};
            }
            onVisibilityChange?.(false);
            if (result.action !== ModalActions.CONFIRM) {
                blockedNavigationAction.current = undefined;
                shouldNavigateBack.current = false;
                onCancel?.();
                return;
            }
            runDiscardConfirmation(
                onConfirm,
                () => setNavigationActionToMicrotaskQueue(navigateBack),
                () => {
                    blockedNavigationAction.current = undefined;
                    shouldNavigateBack.current = false;
                },
            );
        });
    };

    useBeforeRemove((e) => {
        if (shouldNavigateBack.current) {
            return;
        }

        if (restoreState.current.phase === 'restoring') {
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
                restoreState.current = {
                    phase: 'awaitingRestore',
                    dismissModalOnRestore: true,
                };
                return;
            }
            closeModal();
            return;
        }

        e.preventDefault();
        blockedNavigationAction.current = e.data.action;
        if (e.data.action.type === 'RESET') {
            // A prevented RESET comes from a browser back; the popstate listener must restore the URL
            restoreState.current = {
                phase: 'awaitingRestore',
                dismissModalOnRestore: false,
            };
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
        const handlePopState = () => {
            const restore = restoreState.current;
            if (restore.phase === 'restoring') {
                restoreState.current = {phase: 'idle'};
                return;
            }
            if (restore.phase === 'awaitingRestore') {
                restoreState.current = {phase: 'restoring'};
                window.history.go(1);
                if (restore.dismissModalOnRestore) {
                    closeModalRef.current();
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const suppressDiscardPrompt = (shouldSuppress = true) => {
        isSavingRef.current = shouldSuppress;
    };

    return {suppressDiscardPrompt};
}

export default useDiscardChangesConfirmation;
