import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

/** Keeps the workspaces that pass the predicate, or returns every workspace when there is none. */
function filterPolicies(policies: OnyxCollection<Policy>, isPolicyAvailable?: (policy: Policy) => boolean): OnyxCollection<Policy> {
    if (!policies || !isPolicyAvailable) {
        return policies;
    }
    const result: OnyxCollection<Policy> = {};
    for (const [key, policy] of Object.entries(policies)) {
        if (policy && isPolicyAvailable(policy)) {
            result[key] = policy;
        }
    }
    return result;
}

export default filterPolicies;
