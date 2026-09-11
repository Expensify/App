import {getPolicyIDOrDefault} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

export default function useActivePolicy() {
    const [activePolicyID, activePolicyIDMetadata] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDOrDefault(activePolicyID)}`);
    return [policy, activePolicyIDMetadata.status === 'loaded' && policyMetadata.status === 'loaded'] as const;
}
