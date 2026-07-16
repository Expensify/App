import type {ModalGuardSnapshot} from './modalGuardSnapshot';

const MODAL_GUARD_STATE = {
    CLOSED: 'closed',
    OPEN: 'open',
    CLOSING_BY_DISPATCH: 'closingByDispatch',
} as const;

const MODAL_GUARD_EVENT_TYPE = {
    GUARD_REMOVED: 'GUARD_REMOVED',
    GUARD_APPEARED: 'GUARD_APPEARED',
} as const;

const MODAL_GUARD_EFFECT = {
    ON_CLOSE: 'onClose',
    ON_OPEN: 'onOpen',
} as const;

/**
 * Lifecycle of one modal's browser-history back-guard sentinel. A single state replaces the previous
 * pair of correlated booleans (`hasGuard` / `isClosingByDispatch`) so the invalid "registered AND
 * closing" combination cannot be expressed.
 *
 * - `CLOSED`: no sentinel registered.
 * - `OPEN`: sentinel registered; browser Back removes it.
 * - `CLOSING_BY_DISPATCH`: we initiated the close and removed our own sentinel, so the resulting
 *   `GUARD_REMOVED` must be swallowed rather than treated as a browser Back.
 */
type ModalGuardState = (typeof MODAL_GUARD_STATE)[keyof typeof MODAL_GUARD_STATE];

type ModalGuardEvent =
    | {
          /** Our sentinel left root history (browser Back, our own close, or forward-nav consume). */
          type: typeof MODAL_GUARD_EVENT_TYPE.GUARD_REMOVED;

          /** Whether a route was pushed alongside the removal (forward navigation consumed the guard). */
          routesGrew: boolean;
      }
    | {
          /** Our sentinel re-entered root history (browser Forward restored the saved nav state). */
          type: typeof MODAL_GUARD_EVENT_TYPE.GUARD_APPEARED;
      };

// Reducer output: next guard state plus an optional side-effect callback to fire after the transition.
type ModalGuardTransition = {
    state: ModalGuardState;
    effect?: (typeof MODAL_GUARD_EFFECT)[keyof typeof MODAL_GUARD_EFFECT];
};

/**
 * Pure transition for a modal's back-guard in response to root-history changes. The write path sets
 * `OPEN` / `CLOSING_BY_DISPATCH` directly; this reducer owns the ambiguous external events where one
 * observable change (the sentinel disappearing) has several possible causes.
 */
function reduceModalGuardState(state: ModalGuardState, event: ModalGuardEvent, isVisible: boolean): ModalGuardTransition {
    switch (event.type) {
        case MODAL_GUARD_EVENT_TYPE.GUARD_REMOVED:
            // Our own close dispatch removed the sentinel — settle without firing onClose.
            if (state === MODAL_GUARD_STATE.CLOSING_BY_DISPATCH) {
                return {state: MODAL_GUARD_STATE.CLOSED};
            }
            // Browser Back removed the guard while open. If a forward navigation consumed it instead
            // (a route was pushed), the modal is already closing via that nav, so don't double-fire onClose.
            if (state === MODAL_GUARD_STATE.OPEN) {
                if (!isVisible) {
                    return {state: MODAL_GUARD_STATE.CLOSED};
                }
                return event.routesGrew ? {state: MODAL_GUARD_STATE.CLOSED} : {state: MODAL_GUARD_STATE.CLOSED, effect: MODAL_GUARD_EFFECT.ON_CLOSE};
            }
            return {state};
        case MODAL_GUARD_EVENT_TYPE.GUARD_APPEARED:
            // Browser Forward restored the guard while the modal was closed — reopen it.
            if (state === MODAL_GUARD_STATE.CLOSED) {
                return {state: MODAL_GUARD_STATE.OPEN, effect: MODAL_GUARD_EFFECT.ON_OPEN};
            }
            return {state};
        // no default
    }
}

function getModalGuardEventFromSnapshotChange(prevSnapshot: ModalGuardSnapshot, nextSnapshot: ModalGuardSnapshot, isVisible: boolean): ModalGuardEvent | undefined {
    const guardRemoved = prevSnapshot.guardPresent && !nextSnapshot.guardPresent;
    if (guardRemoved) {
        return {
            type: MODAL_GUARD_EVENT_TYPE.GUARD_REMOVED,
            routesGrew: nextSnapshot.routesLength > prevSnapshot.routesLength,
        };
    }

    const guardAppeared = !prevSnapshot.guardPresent && nextSnapshot.guardPresent;
    if (guardAppeared && !isVisible) {
        return {type: MODAL_GUARD_EVENT_TYPE.GUARD_APPEARED};
    }

    return undefined;
}

export default reduceModalGuardState;
export {getModalGuardEventFromSnapshotChange, MODAL_GUARD_STATE, MODAL_GUARD_EFFECT};
export type {ModalGuardState};
