import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';

import navigationRef from '@libs/Navigation/navigationRef';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';

import type {NavigationAction} from '@react-navigation/native';

import {useFocusEffect, useIsFocused, usePreventRemove, useRoute} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
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
}: UseDiscardChangesConfirmationOptions): DiscardChangesConfirmation {
    const route = useRoute();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);
    const isDiscardModalOpen = useRef(false);
    const isReplayingBlockedNavigation = useRef(false);

    // Only the focused screen should prompt — a flow-leave reset fires `beforeRemove` for hidden siblings too.
    const isFocused = useIsFocused();
    const isSavingRef = useRef(false);
    useFocusEffect(() => {
        isSavingRef.current = false;
    });
    const hasUnsavedChanges = () => isFocused && !isSavingRef.current && getHasUnsavedChanges();

    // `usePreventRemove` reads this during render, so the block signal must be state (never a ref) to stay React Compiler-safe.
    // The save ref and the screen's dirtiness callback are read inside this callback/effect, not during render.
    const [shouldPreventRemove, setShouldPreventRemove] = useState(false);
    // The recompute is deferred past the commit: ref-backed inputs update their child's state in the same event that
    // calls this, so a synchronous read would see the previous render's value and lag one input event behind.
    const recheckUnsavedChanges = useCallback(() => {
        setTimeout(() => {
            setShouldPreventRemove(isFocused && !isSavingRef.current && getHasUnsavedChanges());
        }, 0);
    }, [isFocused, getHasUnsavedChanges]);
    // No dependency array on purpose: dirtiness often lives in refs the compiler cannot track through
    // `getHasUnsavedChanges`, so re-evaluate after every commit (the set bails out when the boolean is unchanged).
    // Screens that go dirty without re-rendering at all call `recheckUnsavedChanges` from their change handlers.
    useEffect(recheckUnsavedChanges);

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
                isReplayingBlockedNavigation.current = true;
                if (blockedNavigationAction.current) {
                    navigationRef.current?.dispatch(blockedNavigationAction.current);
                    blockedNavigationAction.current = undefined;
                } else {
                    navigationRef.current?.goBack();
                }
                isReplayingBlockedNavigation.current = false;
            };
            runDiscardConfirmation(onConfirm, confirmNavigation, () => {
                blockedNavigationAction.current = undefined;
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

    return {suppressDiscardPrompt, recheckUnsavedChanges};
}

export default useDiscardChangesConfirmation;
