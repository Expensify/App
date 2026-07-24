import subscribeToRootNavigation from '@libs/Navigation/helpers/subscribeToRootNavigation';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';

import {useEffect, useEffectEvent, useId, useRef, useSyncExternalStore} from 'react';

import type {ModalGuardState} from './modalGuardState';

import {EMPTY_MODAL_GUARD_SNAPSHOT_KEY, getModalGuardSnapshotKey, parseModalGuardSnapshotKey} from './modalGuardSnapshot';
import reduceModalGuardState, {getModalGuardEventFromSnapshotChange, MODAL_GUARD_EFFECT, MODAL_GUARD_STATE} from './modalGuardState';

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
 * entry and browser Back removes it. The router consumes the sentinel on forward navigation
 * (history length unchanged → `replaceState`) so no orphaned entry is left behind.
 *
 * The per-instance tag lets nested modals add/remove their own guard independently (LIFO).
 */
export default function useSyncModalWithHistory({isVisible, shouldHandleNavigationBack, onClose, onOpen}: UseSyncModalWithHistoryParams) {
    const modalId = useId();
    const sentinel = `${CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MODAL}:${modalId}`;

    const guardStateRef = useRef<ModalGuardState>(MODAL_GUARD_STATE.CLOSED);

    const onCloseEvent = useEffectEvent(() => {
        onClose?.();
    });

    const onOpenEvent = useEffectEvent(() => {
        onOpen?.();
    });

    const snapshotKey = useSyncExternalStore(
        subscribeToRootNavigation,
        () => getModalGuardSnapshotKey(sentinel),
        () => EMPTY_MODAL_GUARD_SNAPSHOT_KEY,
    );
    // We can't use usePrevious here because we need to imperatively reset this ref mid-effect
    // (to sync up when shouldHandleNavigationBack is false, so no stale transition fires when
    // the flag toggles back on). usePrevious only updates after render and is read-only to callers.
    const prevSnapshotKeyRef = useRef(snapshotKey);

    // Add the guard entry on open / remove it on close.
    useEffect(() => {
        if (!shouldHandleNavigationBack) {
            return;
        }

        if (isVisible) {
            guardStateRef.current = MODAL_GUARD_STATE.OPEN;
            Navigation.isNavigationReady().then(() => {
                navigationRef.dispatch({
                    type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MODAL_WITH_HISTORY,
                    payload: {isVisible: true, modalId},
                });
            });
            return () => {
                if (guardStateRef.current !== MODAL_GUARD_STATE.OPEN) {
                    return;
                }
                guardStateRef.current = MODAL_GUARD_STATE.CLOSED;
                navigationRef.dispatch({
                    type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MODAL_WITH_HISTORY,
                    payload: {isVisible: false, modalId},
                });
            };
        }

        if (guardStateRef.current !== MODAL_GUARD_STATE.OPEN) {
            return;
        }
        guardStateRef.current = MODAL_GUARD_STATE.CLOSING_BY_DISPATCH;
        // Defer (microtask via isNavigationReady) so any forward navigation fired from the same close
        // handler is dispatched first; the router then consumes our sentinel during that push and this
        // toggle(false) becomes a no-op, avoiding an extra browser back().
        Navigation.isNavigationReady().then(() => {
            navigationRef.dispatch({
                type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MODAL_WITH_HISTORY,
                payload: {isVisible: false, modalId},
            });
        });
    }, [isVisible, shouldHandleNavigationBack, modalId]);

    // Browser Back/Forward changes the guard sentinel in root history — react via snapshot transitions.
    useEffect(() => {
        if (!shouldHandleNavigationBack) {
            prevSnapshotKeyRef.current = snapshotKey;
            return;
        }

        if (prevSnapshotKeyRef.current === snapshotKey) {
            return;
        }

        const prevSnapshot = parseModalGuardSnapshotKey(prevSnapshotKeyRef.current);
        const nextSnapshot = parseModalGuardSnapshotKey(snapshotKey);
        prevSnapshotKeyRef.current = snapshotKey;

        const event = getModalGuardEventFromSnapshotChange(prevSnapshot, nextSnapshot, isVisible);
        if (!event) {
            return;
        }

        const {state, effect} = reduceModalGuardState(guardStateRef.current, event, isVisible);
        guardStateRef.current = state;

        if (effect === MODAL_GUARD_EFFECT.ON_CLOSE) {
            onCloseEvent();
        } else if (effect === MODAL_GUARD_EFFECT.ON_OPEN) {
            onOpenEvent();
        }
    }, [snapshotKey, isVisible, shouldHandleNavigationBack]);
}
