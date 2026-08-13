import {getPolicyIDFromDomainName} from '@libs/PolicyUtils';

import type {CardOnWaitlist} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

/**
 * Returns the list of policyIDs currently on the Expensify Card waitlist.
 * Parsed from domainName (format: `+@expensify-policy<policyID>.exfy`).
 */
function cardOnWaitlistPolicyIDsSelector(collection: OnyxCollection<CardOnWaitlist>): string[] {
    const policyIDs: string[] = [];
    for (const entry of Object.values(collection ?? {})) {
        const policyID = entry?.domainName ? getPolicyIDFromDomainName(entry.domainName) : undefined;
        if (policyID) {
            policyIDs.push(policyID);
        }
    }
    return policyIDs;
}

export default cardOnWaitlistPolicyIDsSelector;
