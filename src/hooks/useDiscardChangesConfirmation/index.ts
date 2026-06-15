import type {NavigationAction} from '@react-navigation/native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import navigationRef from '@libs/Navigation/navigationRef';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {useRegisterTabSwitchGuard} from '@libs/Navigation/TabSwitchGuardContext';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import getDiscardChangesModalConfig from './getDiscardChangesModalConfig';
import type UseDiscardChangesConfirmationOptions from './types';

function useDiscardChangesConfirmation({getHasUnsavedChanges, onCancel, onVisibilityChange, onConfirm, onTabSwitchDiscard}: UseDiscardChangesConfirmationOptions) {
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
    const route = useRoute();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    // When rendered inside an OnyxTabNavigator tab, also guard tab switches (no-op otherwise / when no onTabSwitchDiscard given).
    useRegisterTabSwitchGuard(route.name, getHasUnsavedChanges, onTabSwitchDiscard, onCancel);
    const blockedNavigationAction = useRef<NavigationAction>(undefined);
    const shouldNavigateBack = useRef(false);
    const shouldIgnoreNextBeforeRemove = useRef(false);
    const clearShouldIgnoreNextBeforeRemoveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const isDiscardModalOpen = useRef(false);

    const clearShouldIgnoreNextBeforeRemove = useCallback(() => {
        if (clearShouldIgnoreNextBeforeRemoveTimeout.current) {
            clearTimeout(clearShouldIgnoreNextBeforeRemoveTimeout.current);
            clearShouldIgnoreNextBeforeRemoveTimeout.current = undefined;
        }
        shouldIgnoreNextBeforeRemove.current = false;
    }, []);

    const markNextBeforeRemoveAsModalCleanup = useCallback(() => {
        if ((window.history.state as {shouldGoBack?: boolean} | null)?.shouldGoBack !== true) {
            return;
        }

        shouldIgnoreNextBeforeRemove.current = true;
        if (clearShouldIgnoreNextBeforeRemoveTimeout.current) {
            clearTimeout(clearShouldIgnoreNextBeforeRemoveTimeout.current);
        }
        clearShouldIgnoreNextBeforeRemoveTimeout.current = setTimeout(() => {
            shouldIgnoreNextBeforeRemove.current = false;
            clearShouldIgnoreNextBeforeRemoveTimeout.current = undefined;
        }, 250);
    }, []);

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

    const showDiscardModal = useCallback(() => {
        isDiscardModalOpen.current = true;
        onVisibilityChange?.(true);
        showConfirmModal({
            ...getDiscardChangesModalConfig(translate),
            shouldIgnoreBackHandlerDuringTransition: true,
        }).then((result) => {
            markNextBeforeRemoveAsModalCleanup();
            isDiscardModalOpen.current = false;
            onVisibilityChange?.(false);
            if (result.action === ModalActions.CONFIRM) {
                Promise.resolve()
                    .then(() => onConfirm?.())
                    .then(() => {
                        setNavigationActionToMicrotaskQueue(navigateBack);
                    })
                    .catch((error: unknown) => {
                        Log.warn('[useDiscardChangesConfirmation] Failed to run onConfirm callback', {error});
                        blockedNavigationAction.current = undefined;
                        shouldNavigateBack.current = false;
                    });
            } else {
                blockedNavigationAction.current = undefined;
                shouldNavigateBack.current = false;
                onCancel?.();
            }
        });
    }, [showConfirmModal, translate, navigateBack, onCancel, onConfirm, onVisibilityChange, markNextBeforeRemoveAsModalCleanup]);

    useBeforeRemove((e) => {
        const hasUnsavedChanges = getHasUnsavedChanges();
        if (!hasUnsavedChanges) {
            clearShouldIgnoreNextBeforeRemove();
            return;
        }

        if (isDiscardModalOpen.current || shouldIgnoreNextBeforeRemove.current) {
            clearShouldIgnoreNextBeforeRemove();
            e.preventDefault();
            return;
        }

        if (shouldNavigateBack.current) {
            clearShouldIgnoreNextBeforeRemove();
            return;
        }

        e.preventDefault();
        blockedNavigationAction.current = e.data.action;
        navigateAfterInteraction(showDiscardModal);
    });

    /**
     * We cannot programmatically stop the browser's back navigation like react-navigation's beforeRemove.
     * Events like popstate and transitionStart are triggered AFTER the back navigation has already completed.
     * So we need to go forward to get back to the current page.
     */
    useEffect(() => {
        const unsubscribe = navigation.addListener('transitionStart', ({data: {closing}}) => {
            if (!getHasUnsavedChanges()) {
                return;
            }
            shouldNavigateBack.current = true;
            if (closing) {
                window.history.go(1);
                return;
            }
            window.history.go(1);
            navigateAfterInteraction(showDiscardModal);
        });

        return unsubscribe;
    }, [navigation, getHasUnsavedChanges, showDiscardModal]);

    useEffect(() => clearShouldIgnoreNextBeforeRemove, [clearShouldIgnoreNextBeforeRemove]);
}

export default useDiscardChangesConfirmation;
