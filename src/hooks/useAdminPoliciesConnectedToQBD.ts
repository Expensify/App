import ONYXKEYS from '@src/ONYXKEYS';
import {adminPoliciesConnectedToQBDSelector} from '@src/selectors/Policy';
import useOnyx from './useOnyx';

function useAdminPoliciesConnectedToQBD() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    return adminPoliciesConnectedToQBDSelector(policies);
}

export default useAdminPoliciesConnectedToQBD;
