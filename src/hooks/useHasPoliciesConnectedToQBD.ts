import ONYXKEYS from '@src/ONYXKEYS';
import {hasPoliciesConnectedToQBDSelector} from '@src/selectors/Policy';
import useOnyx from './useOnyx';

function useHasPoliciesConnectedToQBD() {
    const [hasPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasPoliciesConnectedToQBDSelector});
    return hasPolicies ?? false;
}

export default useHasPoliciesConnectedToQBD;
