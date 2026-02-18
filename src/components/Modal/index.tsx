import React, {useCallback, useEffect, useRef, useState} from 'react';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import StatusBar from '@libs/StatusBar';
import CONST from '@src/CONST';
import BaseModal from './BaseModal';
import type BaseModalProps from './types';
import type {WindowState} from './types';

let modalHistoryIdCounter = 0;
const modalHistoryStack: number[] = [];
const pendingHistoryBackModalIds = new Set<number>();
const PENDING_HISTORY_BACK_FALLBACK_MS = 1000;

function removeModalHistoryIdFromStack(modalHistoryId: number) {
    const modalHistoryIndex = modalHistoryStack.lastIndexOf(modalHistoryId);
    if (modalHistoryIndex === -1) {
        return;
    }
    modalHistoryStack.splice(modalHistoryIndex, 1);
}

function Modal({fullscreen = true, onModalHide = () => {}, type, onModalShow = () => {}, children, shouldHandleNavigationBack, ...rest}: BaseModalProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const [previousStatusBarColor, setPreviousStatusBarColor] = useState<string>();
    const modalHistoryIdRef = useRef<number | undefined>(undefined);
    const hasPushedHistoryRef = useRef(false);
    const isClosingFromPopStateRef = useRef(false);
    const pendingHistoryBackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isVisibleRef = useRef(rest.isVisible);

    isVisibleRef.current = rest.isVisible;

    const setStatusBarColor = (color = theme.appBG) => {
        if (!fullscreen) {
            return;
        }

        StatusBar.setBackgroundColor(color);
    };

    const clearPendingHistoryBackTimeout = () => {
        if (pendingHistoryBackTimeoutRef.current === null) {
            return;
        }
        clearTimeout(pendingHistoryBackTimeoutRef.current);
        pendingHistoryBackTimeoutRef.current = null;
    };

    const hideModal = () => {
        // Ignore stale hide callbacks from a previous hide animation.
        if (isVisibleRef.current) {
            return;
        }

        const modalHistoryId = modalHistoryIdRef.current;

        if (isClosingFromPopStateRef.current) {
            isClosingFromPopStateRef.current = false;
            hasPushedHistoryRef.current = false;
            clearPendingHistoryBackTimeout();
            if (modalHistoryId !== undefined) {
                pendingHistoryBackModalIds.delete(modalHistoryId);
                removeModalHistoryIdFromStack(modalHistoryId);
            }
            modalHistoryIdRef.current = undefined;
            onModalHide();
            return;
        }

        onModalHide();

        const shouldGoBack = shouldHandleNavigationBack && modalHistoryId !== undefined && hasPushedHistoryRef.current;
        if (shouldGoBack && modalHistoryId !== undefined) {
            const historyState = window.history.state as WindowState | null;
            const isCurrentHistoryEntryOwnedByModal = historyState?.modalHistoryId === modalHistoryId && !!historyState.shouldGoBack;
            const isTopModalInStack = modalHistoryStack.at(-1) === modalHistoryId;
            hasPushedHistoryRef.current = false;
            if (isCurrentHistoryEntryOwnedByModal || isTopModalInStack) {
                pendingHistoryBackModalIds.add(modalHistoryId);
                clearPendingHistoryBackTimeout();
                // Keep a bounded fallback in case popstate is not fired.
                pendingHistoryBackTimeoutRef.current = setTimeout(() => {
                    pendingHistoryBackTimeoutRef.current = null;
                    if (!pendingHistoryBackModalIds.has(modalHistoryId)) {
                        return;
                    }
                    pendingHistoryBackModalIds.delete(modalHistoryId);
                    removeModalHistoryIdFromStack(modalHistoryId);
                    if (modalHistoryIdRef.current === modalHistoryId) {
                        modalHistoryIdRef.current = undefined;
                    }
                }, PENDING_HISTORY_BACK_FALLBACK_MS);
                window.history.back();
                return;
            }
        }

        clearPendingHistoryBackTimeout();
        if (modalHistoryId !== undefined) {
            pendingHistoryBackModalIds.delete(modalHistoryId);
            removeModalHistoryIdFromStack(modalHistoryId);
        }
        modalHistoryIdRef.current = undefined;
    };

    const handlePopStateRef = useRef(() => {
        rest.onClose?.();
    });

    // This useEffect is needed so that when the onClose function changes, the ref contains the current value of this function.
    // More information can be found here: https://github.com/Expensify/App/issues/69781
    useEffect(() => {
        handlePopStateRef.current = () => {
            rest.onClose?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rest.onClose]);

    // We use a stable callback here to avoid issues with stale closures in event listeners.
    // If we directly passed `handlePopStateRef.current` to addEventListener, the listener would
    // capture the value of `onClose` at the time it was registered and would not update when
    // `onClose` changes. By wrapping it in a stable useCallback and referencing
    // handlePopStateRef.current inside, we ensure that the listener always calls the latest
    // version of `onClose` without needing to reattach the event listener.
    const handlePopState = useCallback((event: PopStateEvent) => {
        const modalHistoryId = modalHistoryIdRef.current;

        if (modalHistoryId === undefined) {
            return;
        }

        if (modalHistoryStack.at(-1) !== modalHistoryId) {
            return;
        }

        if (pendingHistoryBackModalIds.has(modalHistoryId)) {
            pendingHistoryBackModalIds.delete(modalHistoryId);
            clearPendingHistoryBackTimeout();
            removeModalHistoryIdFromStack(modalHistoryId);
            modalHistoryIdRef.current = undefined;
            return;
        }

        if (!hasPushedHistoryRef.current) {
            return;
        }

        const historyState = (event.state ?? window.history.state) as WindowState | null;
        if (historyState?.modalHistoryId === modalHistoryId && !!historyState.shouldGoBack) {
            return;
        }

        hasPushedHistoryRef.current = false;
        isClosingFromPopStateRef.current = true;
        removeModalHistoryIdFromStack(modalHistoryId);
        modalHistoryIdRef.current = undefined;
        handlePopStateRef.current();
    }, []);

    const showModal = () => {
        // Ignore stale show callbacks from a previous show animation.
        if (!isVisibleRef.current) {
            return;
        }

        if (shouldHandleNavigationBack) {
            if (modalHistoryIdRef.current !== undefined) {
                const previousModalHistoryId = modalHistoryIdRef.current;
                const shouldResetStaleHistoryEntry = pendingHistoryBackModalIds.has(previousModalHistoryId) || !hasPushedHistoryRef.current;
                if (!shouldResetStaleHistoryEntry) {
                    // Ignore duplicate onModalShow callbacks while this modal already owns a history entry.
                    onModalShow?.();
                    return;
                }
                pendingHistoryBackModalIds.delete(previousModalHistoryId);
                clearPendingHistoryBackTimeout();
                removeModalHistoryIdFromStack(previousModalHistoryId);
                modalHistoryIdRef.current = undefined;
            }

            const modalHistoryId = ++modalHistoryIdCounter;
            modalHistoryIdRef.current = modalHistoryId;
            hasPushedHistoryRef.current = true;
            removeModalHistoryIdFromStack(modalHistoryId);
            modalHistoryStack.push(modalHistoryId);

            const historyState: unknown = window.history.state;
            const mergedHistoryState =
                typeof historyState === 'object' && historyState !== null
                    ? {...(historyState as Record<string, unknown>), shouldGoBack: true, modalHistoryId}
                    : {shouldGoBack: true, modalHistoryId};
            window.history.pushState(mergedHistoryState as WindowState, '', null);
            window.addEventListener('popstate', handlePopState);
        }
        onModalShow?.();
    };

    useEffect(
        () => () => {
            window.removeEventListener('popstate', handlePopState);
            clearPendingHistoryBackTimeout();
            if (modalHistoryIdRef.current !== undefined) {
                pendingHistoryBackModalIds.delete(modalHistoryIdRef.current);
                removeModalHistoryIdFromStack(modalHistoryIdRef.current);
            }
            modalHistoryIdRef.current = undefined;
            hasPushedHistoryRef.current = false;
            isClosingFromPopStateRef.current = false;
        },
        [handlePopState],
    );

    const onModalWillShow = () => {
        const statusBarColor = StatusBar.getBackgroundColor() ?? theme.appBG;

        const isFullScreenModal =
            type === CONST.MODAL.MODAL_TYPE.CENTERED ||
            type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE ||
            type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED ||
            type === CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT;

        if (statusBarColor) {
            setPreviousStatusBarColor(statusBarColor);
            // If it is a full screen modal then match it with appBG, otherwise we use the backdrop color
            setStatusBarColor(isFullScreenModal ? theme.appBG : StyleUtils.getThemeBackgroundColor(statusBarColor));
        }
        rest.onModalWillShow?.();
    };

    const onModalWillHide = () => {
        setStatusBarColor(previousStatusBarColor);
        rest.onModalWillHide?.();
    };

    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            onModalHide={hideModal}
            onModalShow={showModal}
            onModalWillShow={onModalWillShow}
            onModalWillHide={onModalWillHide}
            avoidKeyboard={false}
            fullscreen={fullscreen}
            type={type}
        >
            {children}
        </BaseModal>
    );
}

export default Modal;
