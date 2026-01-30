import type {NavigationAction} from '@react-navigation/native';
import {useIsFocused, usePreventRemove} from '@react-navigation/native';
import React, {memo, useCallback, useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import navigationRef from '@libs/Navigation/navigationRef';
import type DiscardChangesConfirmationProps from './types';

function DiscardChangesConfirmation({getHasUnsavedChanges, isEnabled = true}: DiscardChangesConfirmationProps) {
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const [isVisible, setIsVisible] = useState(false);
    const shouldAllowNavigation = useRef(false);
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);

    const hasUnsavedChanges = isEnabled && isFocused && getHasUnsavedChanges();
    const shouldPrevent = hasUnsavedChanges && !shouldAllowNavigation.current;

    usePreventRemove(
        shouldPrevent,
        useCallback(({data}) => {
            blockedNavigationAction.current = data.action;
            setIsVisible(true);
        }, []),
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
