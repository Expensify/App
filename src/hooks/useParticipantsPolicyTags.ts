import ONYXKEYS from '@src/ONYXKEYS';
import type {ParticipantsPolicyTags, PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

type ParticipantWithPolicyID = {
    policyID?: string;
};

function getPolicyTagsSelector(participants: ParticipantWithPolicyID[]): (allTags: OnyxCollection<PolicyTagLists>) => ParticipantsPolicyTags {
    return (allTags: OnyxCollection<PolicyTagLists>) => {
        if (!participants) {
            return {};
        }
        return participants.reduce<ParticipantsPolicyTags>((acc, participant) => {
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
function useParticipantsPolicyTags(participants: ParticipantWithPolicyID[]): ParticipantsPolicyTags {
    const [participantsPolicyTags = getEmptyObject<ParticipantsPolicyTags>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: getPolicyTagsSelector(participants)}, [participants]);

    return participantsPolicyTags;
}

export default useParticipantsPolicyTags;
