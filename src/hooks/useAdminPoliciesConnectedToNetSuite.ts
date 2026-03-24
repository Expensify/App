import ONYXKEYS from '@src/ONYXKEYS';
import {adminPoliciesConnectedToNetSuiteSelector} from '@src/selectors/Policy';
import useOnyx from './useOnyx';

function useAdminPoliciesConnectedToNetSuite() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    return adminPoliciesConnectedToNetSuiteSelector(policies);
}

export default useAdminPoliciesConnectedToNetSuite;
