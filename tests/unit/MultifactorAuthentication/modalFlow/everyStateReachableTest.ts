import {matchesState} from 'xstate';
import {getShortestPaths} from 'xstate/graph';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import getSettleableLeafStates from '../../../utils/mfa/reachableStates';

// With no `events` list passed, getShortestPaths synthesizes a bare event for every transition the
// machine declares, so new events reach new states automatically. Pass `events` only to supply a payload a guard needs.
describe('every MFA modal state is reachable', () => {
    const reachableSnapshots = getShortestPaths(mfaMachine).map((path) => path.state);

    it.each(getSettleableLeafStates(mfaMachine))('reaches the $description state', ({value}) => {
        expect(reachableSnapshots.some((snapshot) => matchesState(value, snapshot.value))).toBe(true);
    });
});
