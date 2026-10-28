import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';

import {
    isFlowDiscardPromptSuppressed,
    isReplayingDiscardedNavigation,
    releaseFlowDiscardPromptSuppression,
    runWhileReplayingDiscardedNavigation,
} from '@libs/Navigation/helpers/discardPromptState';
import getIsFlowRootGuardActive, {getFlowRootStackKey} from '@libs/Navigation/helpers/getIsFlowRootGuardActive';
import getNavigationActionForReplay from '@libs/Navigation/helpers/getNavigationActionForReplay';
import isInFlowNavigationForRoot from '@libs/Navigation/helpers/isInFlowNavigationForRoot';
import navigationRef from '@libs/Navigation/navigationRef';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import type {NavigationAction} from '@react-navigation/native';

import {useFocusEffect, useIsFocused, useNavigation, usePreventRemove, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {BackHandler} from 'react-native';

import type {DiscardChangesConfirmation} from './types';
import type UseDiscardChangesConfirmationOptions from './types';

import getDiscardChangesModalConfig from './getDiscardChangesModalConfig';
import runDiscardConfirmation from './runDiscardConfirmation';

function useDiscardChangesConfirmation({
    getHasUnsavedChanges,
    onCancel,
    onVisibilityChange,
    onConfirm,
    onTabSwitchDiscard,
    shouldPromptWhenUnfocused = false,
    shouldPromptForNavigationAction,
    onDiscarded,
}: UseDiscardChangesConfirmationOptions): DiscardChangesConfirmation {
    const route = useRoute();
    const navigation = useNavigation();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);
    const isDiscardModalOpen = useRef(false);
    const isReplayingBlockedNavigation = useRef(false);

    // Only the focused screen should prompt — a flow-leave reset fires `beforeRemove` for hidden siblings too.
    // A flow root instead prompts while later steps cover it, and its gate rejects hidden sibling tabs.
    const isFocused = useIsFocused();
    const isSavingRef = useRef(false);
    useFocusEffect(() => {
        isSavingRef.current = false;
        return () => {
            // A flow root stays mounted under the step a "Next" moved forward to, so that suppression must not outlive the focus.
            if (!shouldPromptWhenUnfocused) {
                return;
            }
            isSavingRef.current = false;
        };
    });
    useEffect(() => {
        if (!shouldPromptWhenUnfocused) {
            return undefined;
        }
        // A suppression only serves the exit of the flow that armed it: a new flow root starts unmuted, and one that unmounts has left its flow.
        releaseFlowDiscardPromptSuppression();
        return () => releaseFlowDiscardPromptSuppression();
    }, [shouldPromptWhenUnfocused]);
    const isGuardActive = () => (shouldPromptWhenUnfocused ? getIsFlowRootGuardActive(navigation, route.key) : isFocused);
    const isMuted = () => isSavingRef.current || (shouldPromptWhenUnfocused && isFlowDiscardPromptSuppressed());
    const hasUnsavedChanges = () => isGuardActive() && !isMuted() && getHasUnsavedChanges();
    const shouldPromptFor = (action: NavigationAction) => {
        if (shouldPromptWhenUnfocused && isInFlowNavigationForRoot(action, route, getFlowRootStackKey(navigation))) {
            return false;
        }
        return shouldPromptForNavigationAction?.(action) ?? true;
    };

    // Callers derive dirtiness from current values and baselines, so this is safe to read during render.
    // The save suppression and the flow-root gate stay out of it because they read refs and navigation state: the callback below applies them.
    const shouldPreventRemove = (shouldPromptWhenUnfocused || isFocused) && getHasUnsavedChanges();

    useRegisterTabSwitchGuard(route.name, hasUnsavedChanges, onTabSwitchDiscard, onCancel);

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
                onDiscarded?.();
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
        if (isReplayingBlockedNavigation.current) {
            letThrough();
            return;
        }
        if (isReplayingDiscardedNavigation()) {
            // Another guard already got the user's Discard for this navigation, so only discard here too
            if (hasUnsavedChanges()) {
                onDiscarded?.();
            }
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

    const suppressDiscardPrompt = (shouldSuppress = true) => {
        isSavingRef.current = shouldSuppress;
    };

    return {suppressDiscardPrompt};
}

export default useDiscardChangesConfirmation;
