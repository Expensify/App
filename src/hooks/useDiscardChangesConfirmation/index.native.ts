import type {NavigationAction} from '@react-navigation/native';
import {usePreventRemove, useRoute} from '@react-navigation/native';
import {useCallback, useRef, useState} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import navigationRef from '@libs/Navigation/navigationRef';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';
import getDiscardChangesModalConfig from './getDiscardChangesModalConfig';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({getHasUnsavedChanges, onCancel, onVisibilityChange, onConfirm, onTabSwitchDiscard}: UseDiscardChangesConfirmationOptions) {
    const route = useRoute();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [shouldAllowNavigation, setShouldAllowNavigation] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);

    // Also guard tab switches when this screen is an OnyxTabNavigator tab. 
    // Self-disables outside a tab navigator or without an onTabSwitchDiscard handler
    useRegisterTabSwitchGuard(route.name, getHasUnsavedChanges, onTabSwitchDiscard, onCancel);

    const shouldPrevent = !shouldAllowNavigation;

    usePreventRemove(
        shouldPrevent,
        useCallback(
            ({data}: {data: {action: NavigationAction}}) => {
                if (!getHasUnsavedChanges()) {
                    setShouldAllowNavigation(true);
                    navigationRef.current?.dispatch(data.action);
                    return;
                }
                blockedNavigationAction.current = data.action;
                onVisibilityChange?.(true);
                showConfirmModal(getDiscardChangesModalConfig(translate)).then((result) => {
                    onVisibilityChange?.(false);
                    if (result.action !== ModalActions.CONFIRM) {
                        onCancel?.();
                        return;
                    }
                    const confirmNavigation = () => {
                        setShouldAllowNavigation(true);
                        if (blockedNavigationAction.current) {
                            navigationRef.current?.dispatch(blockedNavigationAction.current);
                            blockedNavigationAction.current = undefined;
                        } else {
                            navigationRef.current?.goBack();
                        }
                    };
                    Promise.resolve()
                        .then(() => onConfirm?.())
                        .then(confirmNavigation)
                        .catch((error: unknown) => {
                            Log.warn('[useDiscardChangesConfirmation] Failed to run onConfirm callback', {error});
                            blockedNavigationAction.current = undefined;
                        });
                });
            },
            [getHasUnsavedChanges, onCancel, onVisibilityChange, onConfirm, showConfirmModal, translate],
        ),
    );
}

export default useDiscardChangesConfirmation;
