import ONYXKEYS from '@src/ONYXKEYS';
import {adminPoliciesConnectedToSageIntacctSelector} from '@src/selectors/Policy';
import useOnyx from './useOnyx';

function useAdminPoliciesConnectedToSageIntacct() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    return adminPoliciesConnectedToSageIntacctSelector(policies);
}

export default useAdminPoliciesConnectedToSageIntacct;
