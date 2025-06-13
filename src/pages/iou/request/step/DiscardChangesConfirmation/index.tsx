import type {NavigationAction} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import navigationRef from '@libs/Navigation/navigationRef';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type DiscardChangesConfirmationProps from './types';

function DiscardChangesConfirmation({getHasUnsavedChanges}: DiscardChangesConfirmationProps) {
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
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

    /**
     * We cannot programmatically stop the browser's back navigation like react-navigation's beforeRemove
     * Events like popstate and transitionStart are triggered AFTER the back navigation has already completed
     * So we need to go forward to get back to the current page
     */
    useEffect(() => {
        // transitionStart is triggered before the previous page is fully loaded so RHP sliding animation
        // could be less "glitchy" when going back and forth between the previous and current pages
        const unsubscribe = navigation.addListener('transitionStart', () => {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (!getHasUnsavedChanges() || blockedNavigationAction.current || shouldNavigateBack.current) {
                return;
            }

            // Navigation.navigate() rerenders the current page and resets its states
            window.history.go(1);
            setIsVisible(true);
            shouldNavigateBack.current = true;
        });

        return unsubscribe;
    }, [navigation, getHasUnsavedChanges]);

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
                    return;
                }
                if (!shouldNavigateBack.current) {
                    return;
                }
                navigationRef.current?.goBack();
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
