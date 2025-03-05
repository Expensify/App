import {useNavigation} from '@react-navigation/native';
import type {NavigationAction} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import type DiscardChangesConfirmationProps from './types';

function DiscardChangesConfirmation({getHasUnsavedChanges}: DiscardChangesConfirmationProps) {
    const navigation = useNavigation();
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction>();
    const shouldNavigateBack = useRef(false);

    useBeforeRemove(
        useCallback(
            (e) => {
                if (!getHasUnsavedChanges() || shouldNavigateBack.current) {
                    return;
                }

                e.preventDefault();
                blockedNavigationAction.current = e.data.action;
                setIsVisible(true);
            },
            [getHasUnsavedChanges],
        ),
    );

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (!getHasUnsavedChanges() || blockedNavigationAction.current || shouldNavigateBack.current) {
                return;
            }

            event.preventDefault();
            window.history.go(1);
            setIsVisible(true);
            shouldNavigateBack.current = true;
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [getHasUnsavedChanges]);

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
                    navigation.dispatch(blockedNavigationAction.current);
                    return;
                }
                if (shouldNavigateBack.current) {
                    setTimeout(() => {
                        navigation.goBack();
                    }, 0);
                }
            }}
            onCancel={() => {
                setIsVisible(false);
                blockedNavigationAction.current = undefined;
                shouldNavigateBack.current = false;
            }}
        />
    );
}

export default memo(DiscardChangesConfirmation);
