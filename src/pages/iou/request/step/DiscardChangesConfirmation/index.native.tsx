import type {NavigationAction} from '@react-navigation/native';
import {usePreventRemove} from '@react-navigation/native';
import React, {memo, useCallback, useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import navigationRef from '@libs/Navigation/navigationRef';
import type DiscardChangesConfirmationProps from './types';

function DiscardChangesConfirmation({getHasUnsavedChanges}: DiscardChangesConfirmationProps) {
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState(false);
    const shouldAllowNavigation = useRef(false);
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);

    const hasUnsavedChanges = getHasUnsavedChanges();
    const shouldPrevent = hasUnsavedChanges && !shouldAllowNavigation.current;

    // usePreventRemove prevents navigation at native level to avoid state sync error
    // This is critical for swipe gestures on iOS to prevent native/JS state mismatch
    // Its callback fires when navigation is prevented and shows the modal
    usePreventRemove(
        shouldPrevent,
        useCallback(({data}) => {
            blockedNavigationAction.current = data.action;
            setIsVisible(true);
        }, []),
    );

    useBeforeRemove(
        useCallback(
            (e) => {
                if (!getHasUnsavedChanges() || shouldAllowNavigation.current || isVisible) {
                    return;
                }

                e.preventDefault();
                blockedNavigationAction.current = e.data.action;
                setIsVisible(true);
            },
            [getHasUnsavedChanges, isVisible],
        ),
    );

    return (
        <ConfirmModal
            isVisible={isVisible}
            title={translate('discardChangesConfirmation.title')}
            prompt={translate('discardChangesConfirmation.body')}
            danger
            confirmText={translate('discardChangesConfirmation.confirmText')}
            cancelText={translate('common.cancel')}
            onConfirm={() => {
                setIsVisible(false);
                shouldAllowNavigation.current = true;
                if (blockedNavigationAction.current) {
                    navigationRef.current?.dispatch(blockedNavigationAction.current);
                    blockedNavigationAction.current = undefined;
                } else {
                    navigationRef.current?.goBack();
                }
            }}
            onCancel={() => {
                setIsVisible(false);
                blockedNavigationAction.current = undefined;
            }}
            shouldHandleNavigationBack
        />
    );
}

export default memo(DiscardChangesConfirmation);
