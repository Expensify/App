import getSettleableLeafStates from 'tests/utils/mfa/reachableStates';
import {matchesState} from 'xstate';
import {getShortestPaths} from 'xstate/graph';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';

// With no `events` list passed, getShortestPaths synthesizes a bare event for every transition the
// machine declares, so new events reach new states automatically. Pass `events` only to supply a payload a guard needs.
describe('every MFA modal state is reachable', () => {
    const reachableSnapshots = getShortestPaths(mfaMachine).map((path) => path.state);

    it.each(getSettleableLeafStates(mfaMachine.root))('reaches the $description state', ({description}) => {
        expect(reachableSnapshots.some((snapshot) => matchesState(description, snapshot.value))).toBe(true);
    });
});
