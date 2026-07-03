import getWalkedPaths from 'tests/utils/mfa/flowPaths';
import getSettleableLeafStates from 'tests/utils/mfa/settleableLeafStates';
import {getExercisedTransitionKeys, getInitEdgeLandings, getUiDrivableTransitions} from 'tests/utils/mfa/transitionCoverage';
import {matchesState} from 'xstate';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';

// The suites in this file guard the generated coverage itself: they analyze the walked paths that
// `viewMatchesMachine.test.tsx` drives through the real UI, without rendering anything themselves. A
// failure here usually means the walk stopped covering a state or transition, not that the modal broke.

const walkedPaths = getWalkedPaths();

// Every settleable leaf must occur in a path that the UI walk drives. `path.test` asserts every step,
// so paths removed as prefixes of longer paths do not reduce state coverage.
describe('every settleable MFA state is reachable through the real UI', () => {
    const walkedStateValues = walkedPaths.flatMap((path) => path.steps.map((step) => step.state.value));

    it.each(getSettleableLeafStates(mfaMachine.root))('$description can be reached through the real UI', ({description}) => {
        expect(walkedStateValues.some((reached) => matchesState(description, reached))).toBe(true);
    });
});

// Shortest paths keep only one route into each distinct state and context, so a transition can
// silently drop out of the walk when another route to its target is shorter. If this fails after
// adding a transition, add a journey to `DRIVING_JOURNEYS` that drives it. If the failing entry has an
// unexpected context, fix the machine so it resets that context again instead of adding a journey.
describe('every UI-drivable state-changing transition is exercised', () => {
    const exercisedTransitionKeys = getExercisedTransitionKeys(walkedPaths);

    it.each(getUiDrivableTransitions())('$description is exercised', ({key}) => {
        expect(exercisedTransitionKeys.has(key)).toBe(true);
    });
});

// The payload INIT fixture exists so that the flow with a payload gets its own entries in the graph.
// When the machine stops copying the payload into its context, the graph no longer tells the two
// flows apart and the other suites still pass. Only this suite fails in that case.
describe('INIT fixtures produce distinct context vertices', () => {
    it('keeps at least one landing vertex per distinct INIT fixture', () => {
        const landings = getInitEdgeLandings();
        const distinctFixtures = new Set(landings.map(({eventKey}) => eventKey));
        const distinctLandings = new Set(landings.map(({landingKey}) => landingKey));
        expect(distinctLandings.size).toBeGreaterThanOrEqual(distinctFixtures.size);
    });
});
