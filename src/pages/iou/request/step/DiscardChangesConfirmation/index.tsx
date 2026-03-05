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

function DiscardChangesConfirmation({hasUnsavedChanges, onCancel, useParentStackForWebBack}: DiscardChangesConfirmationProps) {
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState(false);
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const [shouldNavigateBack, setShouldNavigateBack] = useState(false);
    const isConfirmed = useRef(false);
    const [discardConfirmed, setDiscardConfirmed] = useState(false);
    const hasGuardEntry = useRef(false);

    usePreventRemove(
        (hasUnsavedChanges || shouldNavigateBack) && !discardConfirmed,
        useCallback((e) => {
            blockedNavigationAction.current = e.data.action;
            navigateAfterInteraction(() => setIsVisible(true));
        }, []),
    );

    /**
     * We cannot programmatically stop the browser's back navigation like react-navigation's beforeRemove
     * Events like popstate and transitionStart are triggered AFTER the back navigation has already completed
     * So we need to go forward to get back to the current page
     */
    useEffect(() => {
        if (useParentStackForWebBack) {
            return;
        }
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
            navigateAfterInteraction(() => setIsVisible(true));
        });

        return unsubscribe;
    }, [hasUnsavedChanges, navigation, useParentStackForWebBack]);

    /**
     * MaterialTopTabNavigator does not emit 'transitionStart' events, so the above approach
     * doesn't work when rendered inside a tab navigator. Instead, we push a dummy history entry
     * that acts as a guard. When browser back is pressed, the guard entry is popped (keeping
     * the URL stable) and we show the discard modal.
     */
    useEffect(() => {
        if (!useParentStackForWebBack || !hasUnsavedChanges || isConfirmed.current) {
            return;
        }

        // Only push a guard entry if there isn't one already on top
        const currentState = window.history.state as {discardChangesGuard?: boolean} | null;
        if (!currentState?.discardChangesGuard) {
            window.history.pushState({discardChangesGuard: true}, '');
        }
        hasGuardEntry.current = true;

        const handlePopState = () => {
            const state = window.history.state as {discardChangesGuard?: boolean} | null;
            if (!hasGuardEntry.current || state?.discardChangesGuard) {
                return;
            }
            hasGuardEntry.current = false;
            setShouldNavigateBack(true);
            navigateAfterInteraction(() => setIsVisible(true));
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [useParentStackForWebBack, hasUnsavedChanges]);

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
                // Re-push the guard entry so the next browser back is also intercepted
                if (useParentStackForWebBack && hasUnsavedChanges) {
                    window.history.pushState({discardChangesGuard: true}, '');
                    hasGuardEntry.current = true;
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
