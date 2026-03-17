import type {NavigationAction} from '@react-navigation/native';
import {useIsFocused, useNavigation, usePreventRemove} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import navigationRef from '@libs/Navigation/navigationRef';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({hasUnsavedChanges, onCancel, onVisibilityChange, shouldNavigateAfterSave = false, navigateBack = () => {}}: UseDiscardChangesConfirmationOptions) {
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
    const {translate} = useLocalize();
    const {showConfirmModal, closeModal} = useConfirmModal();
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const [shouldNavigateBack, setShouldNavigateBack] = useState(false);
    const isDiscardModalOpenRef = useRef(false);
    const isFocused = useIsFocused();
    const isConfirmed = useRef(false);
    const [discardConfirmed, setDiscardConfirmed] = useState(false);

    const goBack = useCallback(() => {
        if (blockedNavigationAction.current) {
            navigationRef.current?.dispatch(blockedNavigationAction.current);
            return;
        }
        if (!shouldNavigateBack) {
            return;
        }
        navigationRef.current?.goBack();
    }, [shouldNavigateBack]);

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
            onModalHide: () => {
                if (isConfirmed.current) {
                    setNavigationActionToMicrotaskQueue(goBack);
                } else {
                    setShouldNavigateBack(false);
                    onCancel?.();
                }
            },
        }).then((result) => {
            isDiscardModalOpenRef.current = false;
            onVisibilityChange?.(false);
            if (result.action === ModalActions.CONFIRM) {
                setDiscardConfirmed(true);
                setNavigationActionToMicrotaskQueue(goBack);
            } else {
                blockedNavigationAction.current = undefined;
                setShouldNavigateBack(false);
                onCancel?.();
            }
        });
    }, [showConfirmModal, translate, goBack, onCancel, onVisibilityChange]);

    usePreventRemove(
        (hasUnsavedChanges && !discardConfirmed) || shouldNavigateBack,
        useCallback(
            (e) => {
                blockedNavigationAction.current = e.data.action;
                navigateAfterInteraction(showDiscardModal);
            },
            [showDiscardModal],
        ),
    );

    useEffect(() => {
        if (!shouldNavigateAfterSave) {
            return;
        }
        navigateBack();
    }, [shouldNavigateAfterSave, navigateBack]);

    /**
     * We cannot programmatically stop the browser's back navigation like react-navigation's beforeRemove.
     * Events like popstate and transitionStart are triggered AFTER the back navigation has already completed.
     * So we need to go forward to get back to the current page.
     */
    useEffect(() => {
        const unsubscribe = navigation.addListener('transitionStart', ({data: {closing}}) => {
            if (!hasUnsavedChanges || isConfirmed.current) {
                return;
            }
            setShouldNavigateBack(true);
            if (closing) {
                window.history.go(1);
                return;
            }
            window.history.go(1);
            navigateAfterInteraction(showDiscardModal);
        });

        return unsubscribe;
    }, [hasUnsavedChanges, navigation, showDiscardModal]);

    /**
     * When the screen loses focus while the discard modal is open,
     * close the modal and reset refs so we don't leave the modal visible or stale state.
     */
    useEffect(() => {
        if (isFocused) {
            return;
        }
        closeModal();
        blockedNavigationAction.current = undefined;
        setShouldNavigateBack(false);
    }, [isFocused, closeModal]);
}

export default useDiscardChangesConfirmation;
