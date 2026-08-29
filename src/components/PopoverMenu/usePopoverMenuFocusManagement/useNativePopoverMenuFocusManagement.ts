import type BaseModalProps from '@components/Modal/types';

import {acquireBackgroundInputFocusSuppression} from '@libs/ModalFocusManager';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';

import {useEffect, useLayoutEffect, useRef, useState} from 'react';

import type {FocusManagedMenuItem, UsePopoverMenuFocusManagementParams, UsePopoverMenuFocusManagementResult} from './types';

type PendingClose = {
    onModalClose: () => void | Promise<void>;
    shouldCloseAllModals?: boolean;
};

function hasFocusRestoreSuppressionOption(items: FocusManagedMenuItem[]): boolean {
    return items.some((item) => item.shouldSkipFocusRestore ?? (item.subMenuItems ? hasFocusRestoreSuppressionOption(item.subMenuItems) : false));
}

function useNativePopoverMenuFocusManagement(
    {isVisible, menuItems, restoreFocusType, shouldEnableNewFocusManagement}: UsePopoverMenuFocusManagementParams,
    isFocusHandoffEnabled: boolean,
): UsePopoverMenuFocusManagementResult {
    const [restoreFocusTypeOverride, setRestoreFocusTypeOverride] = useState<BaseModalProps['restoreFocusType'] | null>(null);
    const [pendingClose, setPendingClose] = useState<PendingClose | null>(null);
    const releaseBackgroundInputFocusSuppressionRef = useRef<(() => void) | null>(null);
    const isVisibleRef = useRef(isVisible);
    const shouldUseNewFocusManagement = shouldEnableNewFocusManagement ? true : isFocusHandoffEnabled && hasFocusRestoreSuppressionOption(menuItems);
    const effectiveRestoreFocusType = restoreFocusTypeOverride ?? restoreFocusType;

    useLayoutEffect(() => {
        isVisibleRef.current = isVisible;
    }, [isVisible]);

    useLayoutEffect(() => {
        if (!pendingClose) {
            return;
        }

        close(pendingClose.onModalClose, undefined, pendingClose.shouldCloseAllModals);
    }, [pendingClose]);

    useEffect(
        () => () => {
            releaseBackgroundInputFocusSuppressionRef.current?.();
            releaseBackgroundInputFocusSuppressionRef.current = null;
        },
        [],
    );

    const prepareForSelection = (item: FocusManagedMenuItem): boolean => {
        const shouldSuppressFocusRestore = isFocusHandoffEnabled && !!item.shouldSkipFocusRestore;
        if (!shouldSuppressFocusRestore) {
            return false;
        }

        if (!releaseBackgroundInputFocusSuppressionRef.current) {
            releaseBackgroundInputFocusSuppressionRef.current = acquireBackgroundInputFocusSuppression();
        }
        setRestoreFocusTypeOverride(CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE);
        return true;
    };

    const requestCloseAfterFocusPolicyCommit = (onModalClose: PendingClose['onModalClose'], shouldCloseAllModals?: boolean) => {
        setPendingClose({onModalClose, shouldCloseAllModals});
    };

    const handleModalHide = () => {
        if (!isFocusHandoffEnabled || isVisibleRef.current) {
            return;
        }

        releaseBackgroundInputFocusSuppressionRef.current?.();
        releaseBackgroundInputFocusSuppressionRef.current = null;
        setRestoreFocusTypeOverride(null);
        setPendingClose(null);
    };

    return {
        effectiveRestoreFocusType,
        handleModalHide,
        prepareForSelection,
        requestCloseAfterFocusPolicyCommit,
        shouldUseNewFocusManagement,
    };
}

export default useNativePopoverMenuFocusManagement;
