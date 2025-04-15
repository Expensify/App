import type {NavigationAction} from '@react-navigation/native';
import React, {memo, useCallback, useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import navigationRef from '@libs/Navigation/navigationRef';

type DiscardChangesConfirmationProps = {
    getHasUnsavedChanges: () => boolean;
};

function DiscardChangesConfirmation({getHasUnsavedChanges}: DiscardChangesConfirmationProps) {
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction>();

    useBeforeRemove(
        useCallback(
            (e) => {
                if (!getHasUnsavedChanges()) {
                    return;
                }

                e.preventDefault();
                blockedNavigationAction.current = e.data.action;
                setIsVisible(true);
            },
            [getHasUnsavedChanges],
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
