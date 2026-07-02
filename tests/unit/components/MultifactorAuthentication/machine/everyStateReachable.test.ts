import {getMfaShortestPaths} from 'tests/utils/mfa/flowPaths';
import getSettleableLeafStates from 'tests/utils/mfa/reachableStates';
import {matchesState} from 'xstate';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';

// The traversal synthesizes a bare event for every transition the machine declares and swaps in a
// fixture from `MFA_GRAPH_EVENTS` when its type has one, so new events reach new states automatically
// and a payload a guard needs comes from the fixture list.
describe('every MFA modal state is reachable', () => {
    const reachableSnapshots = getMfaShortestPaths().map((path) => path.state);

    it.each(getSettleableLeafStates(mfaMachine.root))('reaches the $description state', ({description}) => {
        expect(reachableSnapshots.some((snapshot) => matchesState(description, snapshot.value))).toBe(true);
    });
});
