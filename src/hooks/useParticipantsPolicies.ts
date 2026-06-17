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
    // Key the memoized selector on the participants' policy IDs (the only data it reads) rather than
    // the array reference. A caller passing a fresh array with identical IDs (e.g. a `?? []` fallback)
    // would otherwise recreate the selector every render, defeating useOnyx's selector memoization and
    // causing it to re-subscribe each render — which never settles under the store-based engine.
    const participantPolicyIDs = participants.map((participant) => participant.policyID).join(',');
    const policiesSelector = useCallback(
        (allPolicies: OnyxCollection<Policy>) => getPoliciesSelector(participants)(allPolicies),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [participantPolicyIDs],
    );
    const [participantsPolicies = getEmptyObject<Record<string, Policy>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector});

    return participantsPolicies;
}

export default useParticipantsPolicies;
