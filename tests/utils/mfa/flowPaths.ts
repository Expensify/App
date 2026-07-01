import {matchesState} from 'xstate';
import {getShortestPaths, TestModel} from 'xstate/graph';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';
import createInitEvent from './flowFixtures';

// This list adds the explicit teardown path and is not the coverage source.
// `INIT` carries the scenario payload, while `CLOSE_MODAL` and `MODAL_CLOSED` are bare.
const DRIVING_EVENTS: MfaEvent[] = [createInitEvent(), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}];

// `createTestModel` rejects the machine's `after` transition, so this uses the constructor directly.
// The custom matcher lets state assertion keys use dot paths such as `open.outcome.success`.
const mfaTestModel = new TestModel(mfaMachine, {
    stateMatcher: (state, stateValue) => matchesState(stateValue, state.value),
});

/**
 * Returns the shortest coverage paths and the explicit teardown path, because the shortest path to the
 * initial `closed` state contains no events. Duplicate paths are retained so every settleable leaf remains
 * a path endpoint.
 *
 * `getShortestPaths` synthesizes an event for every transition the machine declares, so new transitions are
 * covered without editing here, and pinning an explicit `events` list could silently skip one. `path.test`
 * skips a step whose event has no executor, which keeps framework steps such as `xstate.init` harmless while
 * the harness `satisfies Record<MfaEventType, ...>` still forces an executor for every application event.
 */
function getWalkedPaths() {
    return [...mfaTestModel.getPaths((logic) => getShortestPaths(logic), {allowDuplicatePaths: true}), ...mfaTestModel.getPathsFromEvents(DRIVING_EVENTS)];
}

export default getWalkedPaths;
