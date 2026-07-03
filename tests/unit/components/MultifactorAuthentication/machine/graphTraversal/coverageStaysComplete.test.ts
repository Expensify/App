import getWalkedPaths from 'tests/utils/mfa/flowPaths';
import getSettleableLeafStates from 'tests/utils/mfa/settleableLeafStates';
import {getExercisedTransitionKeys, getInitEdgeLandings, getUiDrivableTransitions} from 'tests/utils/mfa/transitionCoverage';
import {matchesState} from 'xstate';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';

// The suites in this file guard the generated coverage itself: they analyze the walked paths that
// `viewMatchesMachine.test.tsx` drives through the real UI, without rendering anything themselves. A
// failure here usually means the walk stopped covering a state or transition, not that the modal broke.
// Each failure names the missing piece.

const walkedPaths = getWalkedPaths();

// Every settleable leaf must end a path that the UI walk drives, not merely appear mid-path.
describe('every settleable MFA state is reachable through the real UI', () => {
    const walkedLeafValues = walkedPaths.map((path) => path.state.value);

    it.each(getSettleableLeafStates(mfaMachine.root))('$description can be reached through the real UI', ({description}) => {
        expect(walkedLeafValues.some((reached) => matchesState(description, reached))).toBe(true);
    });
});

// Shortest paths keep a single incoming route per distinct state-and-context vertex, so a transition can
// silently drop out of the walk once another route to its target is shorter. A failure here has two
// possible causes. When a transition was added to the machine, the fix is an explicit journey in
// `DRIVING_JOURNEYS` that drives it. When the machine stopped resetting part of its context, the same
// state value splits into a second vertex whose transitions have no route, so compare the failing
// vertex's context with the intended one and fix the machine instead of adding a journey.
describe('every UI-drivable state-changing transition is exercised', () => {
    const exercisedTransitionKeys = getExercisedTransitionKeys(walkedPaths);

    it.each(getUiDrivableTransitions())('$description is exercised', ({key}) => {
        expect(exercisedTransitionKeys.has(key)).toBe(true);
    });
});

// The payload INIT fixture exists to give the payload flow its own context vertices. When the machine
// stops copying the payload into its context, every INIT fixture lands in the same vertex, the split
// disappears, and the explicit journeys keep the walk green. This guard pins the split itself.
describe('INIT fixtures produce distinct context vertices', () => {
    it('keeps at least one landing vertex per distinct INIT fixture', () => {
        const landings = getInitEdgeLandings();
        const distinctFixtures = new Set(landings.map(({eventKey}) => eventKey));
        const distinctLandings = new Set(landings.map(({landingKey}) => landingKey));
        expect(distinctLandings.size).toBeGreaterThanOrEqual(distinctFixtures.size);
    });
});
