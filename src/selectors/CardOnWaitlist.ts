import {getPolicyIDFromDomainName} from '@libs/PolicyUtils';

import type {CardOnWaitlist} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

/**
 * Returns the set of policyIDs currently on the Expensify Card waitlist.
 * Parsed from domainName (format: `+@expensify-policy<policyID>.exfy`).
 */
function cardOnWaitlistPolicyIDsSelector(collection: OnyxCollection<CardOnWaitlist>): Set<string> {
    const policyIDs = new Set<string>();
    for (const entry of Object.values(collection ?? {})) {
        const policyID = entry?.domainName ? getPolicyIDFromDomainName(entry.domainName) : undefined;
        if (policyID) {
            policyIDs.add(policyID);
        }
    }
    return policyIDs;
}

export default cardOnWaitlistPolicyIDsSelector;
