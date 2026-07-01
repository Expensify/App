import type {NavigationAction} from '@react-navigation/native';
import {useFocusEffect, useIsFocused, usePreventRemove, useRoute} from '@react-navigation/native';
import {useRef} from 'react';
import {BackHandler} from 'react-native';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
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

    // Also guard tab switches when this screen is an OnyxTabNavigator tab.
    // Self-disables outside a tab navigator or without an onTabSwitchDiscard handler
    useRegisterTabSwitchGuard(route.name, getHasUnsavedChanges, onTabSwitchDiscard, onCancel);

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
            Promise.resolve()
                .then(() => onConfirm?.())
                .then(confirmNavigation)
                .catch((error: unknown) => {
                    Log.warn('[useDiscardChangesConfirmation] Failed to run onConfirm callback', {error});
                    blockedNavigationAction.current = undefined;
                });
        });
    };

    usePreventRemove(true, ({data}: {data: {action: NavigationAction}}) => {
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

    const notifySaving = (isSaving = true) => {
        isSavingRef.current = isSaving;
    };

    return {notifySaving};
}

export default useDiscardChangesConfirmation;
