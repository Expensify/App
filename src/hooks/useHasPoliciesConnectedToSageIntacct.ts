import ONYXKEYS from '@src/ONYXKEYS';
import {hasPoliciesConnectedToSageIntacctSelector} from '@src/selectors/Policy';
import useOnyx from './useOnyx';

function useHasPoliciesConnectedToSageIntacct() {
    const [hasPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasPoliciesConnectedToSageIntacctSelector});
    return hasPolicies ?? false;
}

export default useHasPoliciesConnectedToSageIntacct;
