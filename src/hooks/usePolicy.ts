import {getPolicyIDOrDefault} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

function usePolicy(policyID?: string) {
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDOrDefault(policyID)}`);
    return policy;
}

export default usePolicy;
