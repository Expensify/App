import ONYXKEYS from '@src/ONYXKEYS';
import {adminPoliciesConnectedToQBDSelector} from '@src/selectors/Policy';
import useOnyx from './useOnyx';

function useHasPoliciesConnectedToQBD() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    return !!adminPoliciesConnectedToQBDSelector(policies).length;
}

export default useHasPoliciesConnectedToQBD;
