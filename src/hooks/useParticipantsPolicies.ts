import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

type ParticipantWithPolicyID = {
    policyID?: string;
};

function getPoliciesSelector(participants: ParticipantWithPolicyID[]): (allPolicies: OnyxCollection<Policy>) => Record<string, Policy> {
    return (allPolicies: OnyxCollection<Policy>) => {
        if (!participants) {
            return {};
        }
        return participants.reduce<Record<string, Policy>>((acc, participant) => {
            const key = `${ONYXKEYS.COLLECTION.POLICY}${participant.policyID}`;
            if (allPolicies?.[key] && participant.policyID) {
                acc[participant.policyID] = allPolicies[key];
            }
            return acc;
        }, {});
    };
}

/**
 * Hook that extracts policies only for participants' policies.
 *
 * @param participants - Array of participants with optional policyID
 * @returns Record mapping policyID to Policy
 */
function useParticipantsPolicies(participants: ParticipantWithPolicyID[]): Record<string, Policy> {
    const policiesSelector = useCallback((allPolicies: OnyxCollection<Policy>) => getPoliciesSelector(participants)(allPolicies), [participants]);
    const [participantsPolicies = getEmptyObject<Record<string, Policy>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector});

    return participantsPolicies;
}

export default useParticipantsPolicies;
