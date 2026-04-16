import type {NavigationAction} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import navigationRef from '@libs/Navigation/navigationRef';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({getHasUnsavedChanges, onCancel, onVisibilityChange, onConfirm}: UseDiscardChangesConfirmationOptions) {
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const shouldNavigateBack = useRef(false);

    const navigateBack = useCallback(() => {
        if (blockedNavigationAction.current) {
            navigationRef.current?.dispatch(blockedNavigationAction.current);
            return;
        }
        if (!shouldNavigateBack.current) {
            return;
        }
        navigationRef.current?.goBack();
    }, []);

    const showDiscardModal = useCallback(() => {
        onVisibilityChange?.(true);
        showConfirmModal({
            title: translate('discardChangesConfirmation.title'),
            prompt: translate('discardChangesConfirmation.body'),
            danger: true,
            confirmText: translate('discardChangesConfirmation.confirmText'),
            cancelText: translate('common.cancel'),
            shouldIgnoreBackHandlerDuringTransition: true,
        }).then((result) => {
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
    }, [showConfirmModal, translate, navigateBack, onCancel, onConfirm, onVisibilityChange]);

    useBeforeRemove((e) => {
        if (!getHasUnsavedChanges() || shouldNavigateBack.current) {
            return;
        }
        e.preventDefault();
        blockedNavigationAction.current = e.data.action;
        navigateAfterInteraction(showDiscardModal);
    });

    /**
     * We cannot programmatically stop the browser's back navigation like react-navigation's beforeRemove.
     * Events like popstate and transitionStart are triggered AFTER the back navigation has already completed.
     * So we need to go forward to get back to the current page.
     */
    useEffect(() => {
        const unsubscribe = navigation.addListener('transitionStart', ({data: {closing}}) => {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (!getHasUnsavedChanges()) {
                return;
            }
            shouldNavigateBack.current = true;
            if (closing) {
                window.history.go(1);
                return;
            }
            window.history.go(1);
            navigateAfterInteraction(showDiscardModal);
        });

        return unsubscribe;
    }, [navigation, getHasUnsavedChanges, showDiscardModal]);
}

export default useDiscardChangesConfirmation;
