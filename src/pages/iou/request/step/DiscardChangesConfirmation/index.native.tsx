import {useIsFocused} from '@react-navigation/native';
import type {NavigationAction} from '@react-navigation/native';
import React, {memo, useCallback, useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import navigationRef from '@libs/Navigation/navigationRef';
import type DiscardChangesConfirmationProps from './types';

function DiscardChangesConfirmation({getHasUnsavedChanges, isEnabled = true}: DiscardChangesConfirmationProps) {
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const [isVisible, setIsVisible] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction | undefined>(undefined);

    useBeforeRemove(
        useCallback(
            (e) => {
                if (!isEnabled || !isFocused || !getHasUnsavedChanges()) {
                    return;
                }

                e.preventDefault();
                blockedNavigationAction.current = e.data.action;
                setIsVisible(true);
            },
            [getHasUnsavedChanges, isFocused, isEnabled],
        ),
        isEnabled && isFocused,
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
                if (blockedNavigationAction.current) {
                    navigationRef.current?.dispatch(blockedNavigationAction.current);
                }
            }}
            onCancel={() => setIsVisible(false)}
            shouldHandleNavigationBack
        />
    );
}

export default memo(DiscardChangesConfirmation);
