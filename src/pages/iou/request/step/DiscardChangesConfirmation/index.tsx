import type {NavigationAction} from '@react-navigation/native';
import {usePreventRemove} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import navigationRef from '@libs/Navigation/navigationRef';
import type DiscardChangesConfirmationProps from './types';

function DiscardChangesConfirmation({hasUnsavedChanges, onCancel}: DiscardChangesConfirmationProps) {
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const [shouldNavigateBack, setShouldNavigateBack] = useState(false);
    const isConfirmed = useRef(false);
    const [discardConfirmed, setDiscardConfirmed] = useState(false);
    const isGuardActive = useRef(false);

    usePreventRemove(
        (hasUnsavedChanges || shouldNavigateBack) && !discardConfirmed,
        useCallback((e) => {
            blockedNavigationAction.current = e.data.action;
            navigateAfterInteraction(() => setIsVisible(true));
        }, []),
    );

    /**
     * Proactive browser history guard for handling browser back navigation without URL flicker.
     * When there are unsaved changes, a guard entry is pushed onto the browser history stack.
     * Pressing browser back pops the guard entry (not the real navigation entry), so the URL stays stable.
     * A popstate listener detects when the guard is popped and shows the discard confirmation modal.
     */
    useEffect(() => {
        if (!hasUnsavedChanges) {
            return;
        }

        const currentState = window.history.state as Record<string, unknown> | null;
        window.history.pushState({...currentState, isDiscardGuard: true}, '', null);
        isGuardActive.current = true;

        const handlePopState = () => {
            if (!isGuardActive.current) {
                return;
            }
            // If the current state still has isDiscardGuard, another entry above the guard was popped (e.g. a modal),
            // not our guard itself — do nothing.
            if ((window.history.state as Record<string, unknown> | null)?.isDiscardGuard) {
                return;
            }
            isGuardActive.current = false;
            setShouldNavigateBack(true);
            navigateAfterInteraction(() => setIsVisible(true));
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (isGuardActive.current) {
                isGuardActive.current = false;
                window.history.back();
            }
        };
    }, [hasUnsavedChanges]);

    const navigateBack = useCallback(() => {
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
                setIsVisible(false);
            }}
            onCancel={() => {
                setIsVisible(false);
                blockedNavigationAction.current = undefined;
                setShouldNavigateBack(false);
                // Re-push the guard entry so subsequent browser back presses are still intercepted
                if (!isGuardActive.current && hasUnsavedChanges) {
                    const currentState = window.history.state as Record<string, unknown> | null;
                    window.history.pushState({...currentState, isDiscardGuard: true}, '', null);
                    isGuardActive.current = true;
                }
            }}
            onModalHide={() => {
                if (isConfirmed.current) {
                    setNavigationActionToMicrotaskQueue(navigateBack);
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
