import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

type ParticipantWithPolicyID = {
    policyID?: string;
};

function getPolicyTagsSelector(participants: ParticipantWithPolicyID[]): (allTags: OnyxCollection<PolicyTagLists>) => Record<string, PolicyTagLists> {
    return (allTags: OnyxCollection<PolicyTagLists>) => {
        if (!participants) {
            return {};
        }
        return participants.reduce<Record<string, PolicyTagLists>>((acc, participant) => {
            const key = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${participant.policyID}`;
            if (allTags?.[key] && participant.policyID) {
                acc[participant.policyID] = allTags[key];
            }
            return acc;
        }, {});
    };
}

/**
 * Hook that extracts policy tags only for participants' policies.
 *
 * @param participants - Array of participants with optional policyID
 * @returns Record mapping policyID to PolicyTagLists
 */
function useParticipantsPolicyTags(participants: ParticipantWithPolicyID[]): Record<string, PolicyTagLists> {
    const [participantsPolicyTags = getEmptyObject<Record<string, PolicyTagLists>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: getPolicyTagsSelector(participants)}, [
        participants,
    ]);

    return participantsPolicyTags;
}

export default useParticipantsPolicyTags;
