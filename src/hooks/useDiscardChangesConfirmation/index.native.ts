import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';

import {isReplayingDiscardedNavigation, runWhileReplayingDiscardedNavigation} from '@libs/Navigation/helpers/discardPromptState';
import getNavigationActionForReplay from '@libs/Navigation/helpers/getNavigationActionForReplay';
import navigationRef from '@libs/Navigation/navigationRef';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import type {NavigationAction} from '@react-navigation/native';

import {useFocusEffect, usePreventRemove} from '@react-navigation/native';
import {useRef} from 'react';
import {BackHandler} from 'react-native';

import type {DiscardChangesConfirmation} from './types';
import type UseDiscardChangesConfirmationOptions from './types';

import getDiscardChangesModalConfig from './getDiscardChangesModalConfig';
import runDiscardConfirmation from './runDiscardConfirmation';
import useDiscardPromptGate from './useDiscardPromptGate';

function useDiscardChangesConfirmation({
    getHasUnsavedChanges,
    onCancel,
    onVisibilityChange,
    onConfirm,
    onTabSwitchDiscard,
    shouldPromptWhenUnfocused = false,
}: UseDiscardChangesConfirmationOptions): DiscardChangesConfirmation {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);
    const isDiscardModalOpen = useRef(false);
    const isReplayingBlockedNavigation = useRef(false);
    const {routeName, isFocused, hasUnsavedChanges, shouldPromptFor, suppressDiscardPrompt} = useDiscardPromptGate({
        getHasUnsavedChanges,
        shouldPromptWhenUnfocused,
    });

    // Callers derive dirtiness from current values and baselines, so this is safe to read during render.
    // The other checks (saving, muted, the flow being on screen) read refs and the navigation state, so the callback below runs them.
    const shouldPreventRemove = (shouldPromptWhenUnfocused || isFocused) && getHasUnsavedChanges();

    useRegisterTabSwitchGuard(routeName, hasUnsavedChanges, onTabSwitchDiscard, onCancel);

    const showDiscardModal = (blockedAction?: NavigationAction) => {
        blockedNavigationAction.current = blockedAction;
        isDiscardModalOpen.current = true;
        onVisibilityChange?.(true);
        showConfirmModal(getDiscardChangesModalConfig(translate)).then((result) => {
            isDiscardModalOpen.current = false;
            onVisibilityChange?.(false);
            if (result.action !== ModalActions.CONFIRM) {
                blockedNavigationAction.current = undefined;
                onCancel?.();
                return;
            }
            const confirmNavigation = () => {
                isReplayingBlockedNavigation.current = true;
                runWhileReplayingDiscardedNavigation(() => {
                    if (blockedNavigationAction.current) {
                        navigationRef.current?.dispatch(getNavigationActionForReplay(blockedNavigationAction.current));
                        blockedNavigationAction.current = undefined;
                    } else {
                        navigationRef.current?.goBack();
                    }
                });
                isReplayingBlockedNavigation.current = false;
            };
            runDiscardConfirmation(onConfirm, confirmNavigation, () => {
                blockedNavigationAction.current = undefined;
            });
        });
    };

    usePreventRemove(shouldPreventRemove, ({data}: {data: {action: NavigationAction}}) => {
        // The action delivered here carries react-navigation's visited-routes marker, so re-dispatching it skips this screen's prevention
        const letThrough = () => navigationRef.current?.dispatch(getNavigationActionForReplay(data.action));
        // The user already picked Discard in this or another guard's prompt for this navigation, so don't ask again
        if (isReplayingBlockedNavigation.current || isReplayingDiscardedNavigation()) {
            letThrough();
            return;
        }
        if (!hasUnsavedChanges() || !shouldPromptFor(data.action)) {
            letThrough();
            return;
        }
        if (isDiscardModalOpen.current) {
            return;
        }
        showDiscardModal(data.action);
    });

    // A tab-switch hardware back is an index-only TabRouter change that never fires `beforeRemove`, so intercept it here,
    // ahead of react-navigation's container handler (BackHandler runs listeners newest-first).
    useFocusEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isDiscardModalOpen.current) {
                return true;
            }
            if (!hasUnsavedChanges()) {
                return false;
            }
            showDiscardModal();
            return true;
        });
        return () => subscription.remove();
    });

    return {suppressDiscardPrompt};
}

export default useDiscardChangesConfirmation;
