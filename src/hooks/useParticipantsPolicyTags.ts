import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

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
    const policyIDs = participants.map((participant) => participant.policyID);
    const [participantsPolicyTags = getEmptyObject<Record<string, PolicyTagLists>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {
        selector: (allTags: OnyxCollection<PolicyTagLists>) => getPolicyTagsSelector(policyIDs)(allTags),
    });

    return participantsPolicyTags;
}

export default useParticipantsPolicyTags;
