import type {NavigationAction} from '@react-navigation/native';
import {useNavigation, usePreventRemove} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import navigationRef from '@libs/Navigation/navigationRef';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type DiscardChangesConfirmationProps from './types';

function DiscardChangesConfirmation({hasUnsavedChanges, onVisibilityChange, onCancel, shouldNavigateAfterSave = false, navigateBack = () => {}}: DiscardChangesConfirmationProps) {
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const [shouldNavigateBack, setShouldNavigateBack] = useState(false);
    const isConfirmed = useRef(false);
    const [discardConfirmed, setDiscardConfirmed] = useState(false);

    const setModalVisible = useCallback(
        (nextVisible: boolean) => {
            setIsVisible(nextVisible);
            onVisibilityChange?.(nextVisible);
        },
        [onVisibilityChange],
    );

    usePreventRemove(
        (hasUnsavedChanges && !discardConfirmed) || shouldNavigateBack,
        useCallback(
            (e) => {
                blockedNavigationAction.current = e.data.action;
                navigateAfterInteraction(() => setModalVisible(true));
            },
            [setModalVisible],
        ),
    );

    useEffect(() => {
        if (!shouldNavigateAfterSave) {
            return;
        }
        navigateBack();
    }, [shouldNavigateAfterSave, navigateBack]);

    /**
     * We cannot programmatically stop the browser's back navigation like react-navigation's beforeRemove
     * Events like popstate and transitionStart are triggered AFTER the back navigation has already completed
     * So we need to go forward to get back to the current page
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
            // Navigation.navigate() rerenders the current page and resets its states
            window.history.go(1);
            navigateAfterInteraction(() => setModalVisible(true));
        });

        return unsubscribe;
    }, [hasUnsavedChanges, navigation, setModalVisible]);

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        setModalVisible(false);
        blockedNavigationAction.current = undefined;
    }, [isVisible, setModalVisible]);

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

    return (
        <ConfirmModal
            isVisible={isVisible}
            title={translate('discardChangesConfirmation.title')}
            prompt={translate('discardChangesConfirmation.body')}
            danger
            confirmText={translate('discardChangesConfirmation.confirmText')}
            cancelText={translate('common.cancel')}
            onConfirm={() => {
                isConfirmed.current = true;
                setDiscardConfirmed(true);
                setModalVisible(false);
            }}
            onCancel={() => {
                setModalVisible(false);
                blockedNavigationAction.current = undefined;
                setShouldNavigateBack(false);
            }}
            onModalHide={() => {
                if (isConfirmed.current) {
                    setNavigationActionToMicrotaskQueue(goBack);
                } else {
                    setShouldNavigateBack(false);
                    onCancel?.();
                }
            }}
            shouldIgnoreBackHandlerDuringTransition
        />
    );
}

export default memo(DiscardChangesConfirmation);
