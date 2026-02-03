import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

export default function useActivePolicy() {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    return usePolicy(activePolicyID);
}
