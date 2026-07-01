import {matchesState} from 'xstate';
import {getShortestPaths, TestModel} from 'xstate/graph';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';
import createInitEvent from './flowFixtures';

/**
 * Wraps `mfaMachine` in `xstate/graph`'s public `TestModel`, so each generated path exposes
 * `path.test({events, states})`: drive the matching gesture at each step, then run every matching state
 * assertion.
 *
 * We build `new TestModel(...)` directly rather than calling `createTestModel(mfaMachine)`, because
 * `createTestModel` runs `validateMachine`, which throws "After events on test machines are not
 * supported", and `mfaMachine.closing` has an `after` (closeFallback) transition. The constructor skips
 * that validation. `stateMatcher` routes a dot-path key such as `open.outcome.success` to the reached
 * state; it is the one machine-aware option the constructor does not default for us.
 *
 * Coverage paths come from the STANDALONE `getShortestPaths(mfaMachine)`, which synthesizes a bare event
 * for every transition the machine declares - including framework-internal `xstate.done.actor.*` /
 * `xstate.error.actor.*` once invoked actors land - so a new state is walked with no edit here. We route
 * that generator through `TestModel.getPaths` only to attach `.test()`. Pinning `events` on the model
 * instead would cap the walk to a hand-listed set and silently drop those auto-discovered transitions.
 *
 * `path.test` drives one executor per step and SKIPS any step whose event has no executor. That is right
 * for the synthetic `xstate.init` step, and it is the seam the actors slice grows into: framework events
 * (`xstate.done.actor.*`, `xstate.error.actor.*`, `xstate.after.*`) are not gestures, so they will be
 * driven by the real flow settling (e.g. the biometrics mock resolving) rather than an executor here -
 * classify each consciously when it appears. An application event cannot slip through unnoticed: the
 * `mfaEventExecutors satisfies Record<MfaEventType, ...>` in the harness makes a missing one a build error.
 */

// The explicit teardown sequence, NOT the coverage source (that is auto-discovered above), so it need not
// list every event. INIT carries the real scenario payload; CLOSE_MODAL and MODAL_CLOSED are bare.
const DRIVING_EVENTS: MfaEvent[] = [createInitEvent(), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}];

const mfaTestModel = new TestModel(mfaMachine, {
    stateMatcher: (state, stateValue) => matchesState(stateValue, state.value),
});

/**
 * `getShortestPaths` reaches every settleable leaf. `getPathsFromEvents` adds the full
 * INIT -> CLOSE_MODAL -> MODAL_CLOSED teardown that the shortest path to `closed` skips, since `closed`
 * is the initial state and is already reached at zero weight.
 *
 * `allowDuplicatePaths` keeps the shortest path to each leaf even when it is a prefix of a longer one
 * (the path to `open.outcome.success` is a prefix of the path to `closing`). Without it, deduplication
 * drops the shorter path, so a leaf would only ever be an intermediate step and never a path endpoint.
 */
function getWalkedPaths() {
    return [...mfaTestModel.getPaths((logic) => getShortestPaths(logic), {allowDuplicatePaths: true}), ...mfaTestModel.getPathsFromEvents(DRIVING_EVENTS)];
}

export default getWalkedPaths;
