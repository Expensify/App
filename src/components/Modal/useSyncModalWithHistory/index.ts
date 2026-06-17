import {useEffect, useId, useRef} from 'react';
import usePrevious from '@hooks/usePrevious';
import useRootNavigationState from '@hooks/useRootNavigationState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';

type UseSyncModalWithHistoryParams = {
    /** Whether the modal is currently visible */
    isVisible: boolean;

    /** Whether this modal participates in browser-history back handling */
    shouldHandleNavigationBack?: boolean;

    /** Called when a browser Back press removes this modal's history entry */
    onClose?: () => void;

    /** Called when browser Forward navigation restores this modal's history entry while the modal is closed */
    onOpen?: () => void;
};

/**
 * Web: represents a `shouldHandleNavigationBack` modal's back-guard as a uniquely-tagged sentinel in the
 * root navigator's `state.history` (dispatched via `TOGGLE_MODAL_WITH_HISTORY`). React Navigation's
 * `useLinking` mirrors the history length delta into the browser, so opening the modal pushes a browser
 * entry and browser Back removes it. This replaces the legacy direct `window.history.pushState` hack and
 * fixes the stranded-phantom double-Back bug (#90776): the router consumes the sentinel on forward
 * navigation (history length unchanged → `replaceState`) so no orphaned entry is left behind.
 *
 * The per-instance tag lets nested modals add/remove their own guard independently (LIFO).
 */
export default function useSyncModalWithHistory({isVisible, shouldHandleNavigationBack, onClose, onOpen}: UseSyncModalWithHistoryParams) {
    const modalId = useId();
    const sentinel = `${CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MODAL}:${modalId}`;

    // True while *we* are removing our own sentinel (intentional close), so the observer below doesn't
    // mistake it for a browser Back and double-fire onClose.
    const isClosingByDispatch = useRef(false);
    // Whether our guard sentinel is currently registered, so close is a no-op when it isn't.
    const hasGuard = useRef(false);

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const onOpenRef = useRef(onOpen);
    useEffect(() => {
        onOpenRef.current = onOpen;
    }, [onOpen]);

    const isGuardInHistory = useRootNavigationState((state) => !!state?.history?.includes(sentinel));
    const wasGuardInHistory = usePrevious(isGuardInHistory);
    const rootRoutesLength = useRootNavigationState((state) => state?.routes?.length ?? 0);
    const previousRootRoutesLength = usePrevious(rootRoutesLength);

    // Add the guard entry on open / remove it on close.
    useEffect(() => {
        if (!shouldHandleNavigationBack) {
            return;
        }

        if (isVisible) {
            isClosingByDispatch.current = false;
            hasGuard.current = true;
            Navigation.isNavigationReady().then(() => {
                navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MODAL_WITH_HISTORY, payload: {isVisible: true, modalId}});
            });
            return () => {
                if (!hasGuard.current) {
                    return;
                }
                hasGuard.current = false;
                navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MODAL_WITH_HISTORY, payload: {isVisible: false, modalId}});
            };
        }

        if (!hasGuard.current) {
            return;
        }
        hasGuard.current = false;
        isClosingByDispatch.current = true;
        // Defer (microtask via isNavigationReady) so any forward navigation fired from the same close
        // handler is dispatched first; the router then consumes our sentinel during that push and this
        // toggle(false) becomes a no-op, avoiding an extra browser back().
        Navigation.isNavigationReady().then(() => {
            navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MODAL_WITH_HISTORY, payload: {isVisible: false, modalId}});
        });
    }, [isVisible, shouldHandleNavigationBack, modalId]);

    // Our guard entry disappeared while the modal is still open. If it was a browser Back (history
    // shrank, routes unchanged) close the modal; if a forward navigation consumed it (routes grew) the
    // modal is already closing via that navigation, so do nothing.
    useEffect(() => {
        if (!shouldHandleNavigationBack || !isVisible) {
            return;
        }

        const guardRemoved = !!wasGuardInHistory && !isGuardInHistory;
        if (!guardRemoved) {
            return;
        }

        // Sentinel was removed by an intentional close dispatch, not a browser Back — skip onClose to avoid double-firing it.
        if (isClosingByDispatch.current) {
            isClosingByDispatch.current = false;
            return;
        }

        hasGuard.current = false;

        // Forward navigation consumed the guard (a new route was pushed). The modal is already
        // closing via that navigation action, so calling onClose here would double-fire it.
        if (rootRoutesLength > previousRootRoutesLength) {
            return;
        }

        onCloseRef.current?.();
    }, [isVisible, shouldHandleNavigationBack, isGuardInHistory, wasGuardInHistory, rootRoutesLength, previousRootRoutesLength]);

    // Our guard entry re-appeared while the modal is closed (browser Forward navigation restored
    // the saved nav state). Re-open the modal if a callback is provided.
    useEffect(() => {
        if (!shouldHandleNavigationBack || isVisible) {
            return;
        }
        // Use strict equality so we don't fire on the initial render when wasGuardInHistory is undefined.
        const guardAppeared = wasGuardInHistory === false && isGuardInHistory;
        if (!guardAppeared) {
            return;
        }
        onOpenRef.current?.();
    }, [isVisible, shouldHandleNavigationBack, isGuardInHistory, wasGuardInHistory]);
}
