import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

type ParticipantWithPolicyID = {
    policyID?: string;
};

function getPoliciesSelector(policyIDs: Array<string | undefined>): (allPolicies: OnyxCollection<Policy>) => Record<string, Policy> {
    return (allPolicies: OnyxCollection<Policy>) =>
        policyIDs.reduce<Record<string, Policy>>((acc, policyID) => {
            const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
            if (allPolicies?.[key] && policyID) {
                acc[policyID] = allPolicies[key];
            }
            return acc;
        }, {});
}

/**
 * Hook that extracts policies only for participants' policies.
 *
 * @param participants - Array of participants with optional policyID
 * @returns Record mapping policyID to Policy
 */
function useParticipantsPolicies(participants: ParticipantWithPolicyID[]): Record<string, Policy> {
    const policyIDs = participants.map((participant) => participant.policyID);
    const [participantsPolicies = getEmptyObject<Record<string, Policy>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (allPolicies: OnyxCollection<Policy>) => getPoliciesSelector(policyIDs)(allPolicies),
    });

    return participantsPolicies;
}

export default useParticipantsPolicies;
