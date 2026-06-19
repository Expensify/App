import type {ModalGuardSnapshot} from './modalGuardSnapshot';

/**
 * Lifecycle of one modal's browser-history back-guard sentinel. A single state replaces the previous
 * pair of correlated booleans (`hasGuard` / `isClosingByDispatch`) so the invalid "registered AND
 * closing" combination cannot be expressed.
 *
 * - `closed`: no sentinel registered.
 * - `open`: sentinel registered; browser Back removes it.
 * - `closingByDispatch`: we initiated the close and removed our own sentinel, so the resulting
 *   `GUARD_REMOVED` must be swallowed rather than treated as a browser Back.
 */
type ModalGuardState = 'closed' | 'open' | 'closingByDispatch';

type ModalGuardEvent =
    | {
          /** Our sentinel left root history (browser Back, our own close, or forward-nav consume). */
          type: 'GUARD_REMOVED';

          /** Whether a route was pushed alongside the removal (forward navigation consumed the guard). */
          routesGrew: boolean;
      }
    | {
          /** Our sentinel re-entered root history (browser Forward restored the saved nav state). */
          type: 'GUARD_APPEARED';
      };

type ModalGuardTransition = {
    state: ModalGuardState;
    effect?: 'onClose' | 'onOpen';
};

/**
 * Pure transition for a modal's back-guard in response to root-history changes. The write path sets
 * `open` / `closingByDispatch` directly; this reducer owns the ambiguous external events where one
 * observable change (the sentinel disappearing) has several possible causes.
 */
function reduceModalGuardState(state: ModalGuardState, event: ModalGuardEvent, isVisible: boolean): ModalGuardTransition {
    switch (event.type) {
        case 'GUARD_REMOVED':
            // Our own close dispatch removed the sentinel — settle without firing onClose.
            if (state === 'closingByDispatch') {
                return {state: 'closed'};
            }
            // Browser Back removed the guard while open. If a forward navigation consumed it instead
            // (a route was pushed), the modal is already closing via that nav, so don't double-fire onClose.
            if (state === 'open') {
                if (!isVisible) {
                    return {state: 'closed'};
                }
                return event.routesGrew ? {state: 'closed'} : {state: 'closed', effect: 'onClose'};
            }
            return {state};
        case 'GUARD_APPEARED':
            // Browser Forward restored the guard while the modal was closed — reopen it.
            if (state === 'closed') {
                return {state: 'open', effect: 'onOpen'};
            }
            return {state};
        default:
            return {state};
    }
}

function getModalGuardEventFromSnapshotChange(prevSnapshot: ModalGuardSnapshot, nextSnapshot: ModalGuardSnapshot, isVisible: boolean): ModalGuardEvent | undefined {
    const guardRemoved = prevSnapshot.guardPresent && !nextSnapshot.guardPresent;
    if (guardRemoved) {
        return {
            type: 'GUARD_REMOVED',
            routesGrew: nextSnapshot.routesLength > prevSnapshot.routesLength,
        };
    }

    const guardAppeared = !prevSnapshot.guardPresent && nextSnapshot.guardPresent;
    if (guardAppeared && !isVisible) {
        return {type: 'GUARD_APPEARED'};
    }

    return undefined;
}

export default reduceModalGuardState;
export {getModalGuardEventFromSnapshotChange};
export type {ModalGuardState};
