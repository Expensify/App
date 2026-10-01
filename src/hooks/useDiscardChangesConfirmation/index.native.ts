import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';

import navigationRef from '@libs/Navigation/navigationRef';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import type {NavigationAction} from '@react-navigation/native';

import {useFocusEffect, useIsFocused, usePreventRemove, useRoute} from '@react-navigation/native';
import {useRef} from 'react';
import {BackHandler} from 'react-native';

import type {DiscardChangesConfirmation} from './types';
import type UseDiscardChangesConfirmationOptions from './types';

import getDiscardChangesModalConfig from './getDiscardChangesModalConfig';
import runDiscardConfirmation from './runDiscardConfirmation';

function useDiscardChangesConfirmation({
    getHasUnsavedChanges,
    onCancel,
    onVisibilityChange,
    shouldEnableNewFocusManagement,
    onConfirm,
    onTabSwitchDiscard,
    shouldPromptWhenUnfocused = false,
    onConfirmWhenUnfocused,
}: UseDiscardChangesConfirmationOptions): DiscardChangesConfirmation {
    const route = useRoute();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);
    const navigationCallbackRef = useRef<(() => void) | undefined>(undefined);
    const isDiscardModalOpen = useRef(false);
    const isReplayingBlockedNavigation = useRef(false);

    // Only the focused screen should prompt unless configured to prompt when unfocused (e.g. parent screens in embedded flows) — a flow-leave reset fires `beforeRemove` for hidden siblings too.
    const isFocused = useIsFocused();
    const isSavingRef = useRef(false);
    useFocusEffect(() => {
        isSavingRef.current = false;
    });
    const hasUnsavedChanges = () => (shouldPromptWhenUnfocused || isFocused) && !isSavingRef.current && getHasUnsavedChanges();

    // Callers derive dirtiness from current values and baselines, so this is safe to read during render.
    // The save suppression stays out of it because `isSavingRef` is a ref: the callback below applies that.
    const shouldPreventRemove = (shouldPromptWhenUnfocused || isFocused) && getHasUnsavedChanges();

    useRegisterTabSwitchGuard(route.name, hasUnsavedChanges, onTabSwitchDiscard, onCancel);

    const showDiscardModal = (blockedAction?: NavigationAction) => {
        blockedNavigationAction.current = blockedAction;
        isDiscardModalOpen.current = true;
        onVisibilityChange?.(true);
        showConfirmModal({...getDiscardChangesModalConfig(translate), shouldEnableNewFocusManagement}).then((result) => {
            isDiscardModalOpen.current = false;
            onVisibilityChange?.(false);
            if (result.action !== ModalActions.CONFIRM) {
                blockedNavigationAction.current = undefined;
                navigationCallbackRef.current = undefined;
                onCancel?.();
                return;
            }
            const continueNavigation = () => {
                const navigationCallback = navigationCallbackRef.current;
                navigationCallbackRef.current = undefined;
                if (navigationCallback) {
                    isSavingRef.current = true;
                    navigationCallback();
                    return;
                }

                if (!isFocused && onConfirmWhenUnfocused) {
                    isSavingRef.current = true;
                    blockedNavigationAction.current = undefined;
                    onConfirmWhenUnfocused();
                    return;
                }

                isReplayingBlockedNavigation.current = true;
                if (blockedNavigationAction.current) {
                    navigationRef.current?.dispatch(blockedNavigationAction.current);
                    blockedNavigationAction.current = undefined;
                } else {
                    navigationRef.current?.goBack();
                }
                isReplayingBlockedNavigation.current = false;
            };
            runDiscardConfirmation(onConfirm, continueNavigation, () => {
                blockedNavigationAction.current = undefined;
                navigationCallbackRef.current = undefined;
            });
        });
    };

    usePreventRemove(shouldPreventRemove, ({data}: {data: {action: NavigationAction}}) => {
        // The action delivered here carries react-navigation's visited-routes marker, so re-dispatching it skips this screen's prevention
        if (isReplayingBlockedNavigation.current || !hasUnsavedChanges()) {
            navigationRef.current?.dispatch(data.action);
            return;
        }
        if (isDiscardModalOpen.current) {
            return;
        }
        showDiscardModal(data.action);
    });

    const confirmNavigation = (navigationCallback: () => void) => {
        if (!hasUnsavedChanges()) {
            navigationCallback();
            return;
        }

        if (isDiscardModalOpen.current) {
            return;
        }

        navigationCallbackRef.current = navigationCallback;
        showDiscardModal();
    };

    // A tab-switch hardware back is an index-only TabRouter change that never fires `beforeRemove`, so intercept it here,
    // ahead of react-navigation's container handler (BackHandler runs listeners newest-first).
    useFocusEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isDiscardModalOpen.current) {
                return true;
            }
            if (!isFocused || !hasUnsavedChanges()) {
                return false;
            }
            showDiscardModal();
            return true;
        });
        return () => subscription.remove();
    });

    const suppressDiscardPrompt = (shouldSuppress = true) => {
        isSavingRef.current = shouldSuppress;
    };

    return {suppressDiscardPrompt, confirmNavigation};
}

export default useDiscardChangesConfirmation;
