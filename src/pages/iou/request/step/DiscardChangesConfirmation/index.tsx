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

function DiscardChangesConfirmation({hasUnsavedChanges, onCancel}: DiscardChangesConfirmationProps) {
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const shouldNavigateBack = useRef(false);
    const isConfirmed = useRef(false);

    usePreventRemove(
        hasUnsavedChanges || shouldNavigateBack.current,
        useCallback((e) => {
            blockedNavigationAction.current = e.data.action;
            navigateAfterInteraction(() => setIsVisible((prev) => !prev));
        }, []),
    );

    /**
     * We cannot programmatically stop the browser's back navigation like react-navigation's beforeRemove
     * Events like popstate and transitionStart are triggered AFTER the back navigation has already completed
     * So we need to go forward to get back to the current page
     */
    useEffect(() => {
        const unsubscribe = navigation.addListener('transitionStart', ({data: {closing}}) => {
            if (!hasUnsavedChanges) {
                return;
            }
            shouldNavigateBack.current = true;
            if (closing) {
                window.history.go(1);
                return;
            }
            // Navigation.navigate() rerenders the current page and resets its states
            window.history.go(1);
            navigateAfterInteraction(() => setIsVisible((prev) => !prev));
        });

        return unsubscribe;
    }, [hasUnsavedChanges, navigation]);

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
                setIsVisible(false);
            }}
            onCancel={() => {
                setIsVisible(false);
                blockedNavigationAction.current = undefined;
                shouldNavigateBack.current = false;
            }}
            onModalHide={() => {
                if (isConfirmed.current) {
                    isConfirmed.current = false;
                    setNavigationActionToMicrotaskQueue(navigateBack);
                } else {
                    shouldNavigateBack.current = false;
                    onCancel?.();
                }
            }}
            shouldIgnoreBackHandlerDuringTransition
        />
    );
}

export default memo(DiscardChangesConfirmation);
