import {usePreventRemove} from '@react-navigation/native';
import React, {memo, useCallback, useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import navigationRef from '@libs/Navigation/navigationRef';
import type DiscardChangesConfirmationProps from './types';

function DiscardChangesConfirmation({getHasUnsavedChanges}: DiscardChangesConfirmationProps) {
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState(false);
    const shouldAllowNavigation = useRef(false);

    const hasUnsavedChanges = getHasUnsavedChanges();

    usePreventRemove(
        hasUnsavedChanges && !shouldAllowNavigation.current,
        useCallback(() => {
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
                navigationRef.current?.goBack();
            }}
            onCancel={() => setIsVisible(false)}
            shouldHandleNavigationBack
        />
    );
}

export default memo(DiscardChangesConfirmation);
