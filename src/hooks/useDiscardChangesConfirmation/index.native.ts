import type {NavigationAction} from '@react-navigation/native';
import {useIsFocused, usePreventRemove} from '@react-navigation/native';
import {useCallback, useRef, useState} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import navigationRef from '@libs/Navigation/navigationRef';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({getHasUnsavedChanges, onVisibilityChange, isEnabled = true}: UseDiscardChangesConfirmationOptions) {
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const {showConfirmModal} = useConfirmModal();
    const [shouldAllowNavigation, setShouldAllowNavigation] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);

    const shouldPrevent = isEnabled && isFocused && !shouldAllowNavigation;

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
                showConfirmModal({
                    title: translate('discardChangesConfirmation.title'),
                    prompt: translate('discardChangesConfirmation.body'),
                    danger: true,
                    confirmText: translate('discardChangesConfirmation.confirmText'),
                    cancelText: translate('common.cancel'),
                }).then((result) => {
                    onVisibilityChange?.(false);
                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    setShouldAllowNavigation(true);
                    if (blockedNavigationAction.current) {
                        navigationRef.current?.dispatch(blockedNavigationAction.current);
                        blockedNavigationAction.current = undefined;
                    } else {
                        navigationRef.current?.goBack();
                    }
                });
            },
            [getHasUnsavedChanges, onVisibilityChange, showConfirmModal, translate],
        ),
    );
}

export default useDiscardChangesConfirmation;
