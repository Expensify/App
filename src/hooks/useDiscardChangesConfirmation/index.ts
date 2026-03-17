import type {NavigationAction} from '@react-navigation/native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import navigationRef from '@libs/Navigation/navigationRef';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({getHasUnsavedChanges, onCancel, onVisibilityChange, isEnabled = true}: UseDiscardChangesConfirmationOptions) {
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const {showConfirmModal, closeModal} = useConfirmModal();
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const shouldNavigateBack = useRef(false);
    const isDiscardModalOpenRef = useRef(false);

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
        isDiscardModalOpenRef.current = true;
        showConfirmModal({
            title: translate('discardChangesConfirmation.title'),
            prompt: translate('discardChangesConfirmation.body'),
            danger: true,
            confirmText: translate('discardChangesConfirmation.confirmText'),
            cancelText: translate('common.cancel'),
            shouldIgnoreBackHandlerDuringTransition: true,
        }).then((result) => {
            isDiscardModalOpenRef.current = false;
            onVisibilityChange?.(false);
            if (result.action === ModalActions.CONFIRM) {
                setNavigationActionToMicrotaskQueue(navigateBack);
            } else {
                blockedNavigationAction.current = undefined;
                shouldNavigateBack.current = false;
                onCancel?.();
            }
        });
    }, [showConfirmModal, translate, navigateBack, onCancel, onVisibilityChange]);

    useBeforeRemove(
        useCallback(
            (e) => {
                if (!isEnabled || !isFocused || !getHasUnsavedChanges() || shouldNavigateBack.current) {
                    return;
                }

                e.preventDefault();
                blockedNavigationAction.current = e.data.action;
                navigateAfterInteraction(showDiscardModal);
            },
            [getHasUnsavedChanges, isFocused, isEnabled, showDiscardModal],
        ),
        isEnabled && isFocused,
    );

    /**
     * We cannot programmatically stop the browser's back navigation like react-navigation's beforeRemove.
     * Events like popstate and transitionStart are triggered AFTER the back navigation has already completed.
     * So we need to go forward to get back to the current page.
     */
    useEffect(() => {
        if (!isEnabled || !isFocused) {
            return undefined;
        }
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
    }, [navigation, getHasUnsavedChanges, isFocused, isEnabled, showDiscardModal]);

    /**
     * When the screen loses focus (or is disabled) while the discard modal is open,
     * close the modal and reset refs so we don't leave the modal visible or stale state.
     */
    useEffect(() => {
        if ((isFocused && isEnabled) || !isDiscardModalOpenRef.current) {
            return;
        }
        closeModal();
        blockedNavigationAction.current = undefined;
        shouldNavigateBack.current = false;
    }, [isFocused, isEnabled, closeModal]);
}

export default useDiscardChangesConfirmation;
