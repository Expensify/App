import type {NavigationAction} from '@react-navigation/native';
import {useIsFocused, usePreventRemove} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import navigationRef from '@libs/Navigation/navigationRef';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({hasUnsavedChanges, onVisibilityChange, shouldNavigateAfterSave, navigateBack = () => {}}: UseDiscardChangesConfirmationOptions) {
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const {showConfirmModal} = useConfirmModal();
    const [shouldAllowNavigation, setShouldAllowNavigation] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);

    useEffect(() => {
        if (!shouldNavigateAfterSave) {
            return;
        }
        navigateBack();
    }, [shouldNavigateAfterSave, navigateBack]);

    usePreventRemove(
        hasUnsavedChanges && isFocused && !shouldAllowNavigation,
        useCallback(
            ({data}: {data: {action: NavigationAction}}) => {
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
            [onVisibilityChange, showConfirmModal, translate],
        ),
    );
}

export default useDiscardChangesConfirmation;
