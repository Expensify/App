import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';
import useStableArrayReference from './useStableArrayReference';

type ParticipantWithPolicyID = {
    policyID?: string;
};

function getPolicyTagsSelector(policyIDs: Array<string | undefined>): (allTags: OnyxCollection<PolicyTagLists>) => Record<string, PolicyTagLists> {
    return (allTags: OnyxCollection<PolicyTagLists>) =>
        policyIDs.reduce<Record<string, PolicyTagLists>>((acc, policyID) => {
            const key = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`;
            if (allTags?.[key] && policyID) {
                acc[policyID] = allTags[key];
            }
            return acc;
        }, {});
}

/**
 * Hook that extracts policy tags only for participants' policies.
 *
 * @param participants - Array of participants with optional policyID
 * @returns Record mapping policyID to PolicyTagLists
 */
function useParticipantsPolicyTags(participants: ParticipantWithPolicyID[]): Record<string, PolicyTagLists> {
    // Project to the participants' policy IDs (the only data the selector reads) and stabilize the
    // reference so a caller passing a fresh array with identical IDs (e.g. a `?? []` fallback) doesn't
    // recreate the selector every render — which would defeat useOnyx's selector memoization and cause
    // it to re-subscribe each render (never settling under the store-based engine).
    const policyIDs = useStableArrayReference(participants.map((participant) => participant.policyID));
    const policyTagsSelector = useCallback((allTags: OnyxCollection<PolicyTagLists>) => getPolicyTagsSelector(policyIDs)(allTags), [policyIDs]);
    const [participantsPolicyTags = getEmptyObject<Record<string, PolicyTagLists>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: policyTagsSelector});

    return participantsPolicyTags;
}

export default useParticipantsPolicyTags;
