import {useCallback} from 'react';
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
    // Key the memoized selector on the participants' policy IDs (the only data it reads) rather than
    // the array reference. A caller passing a fresh array with identical IDs (e.g. a `?? []` fallback)
    // would otherwise recreate the selector every render, defeating useOnyx's selector memoization and
    // causing it to re-subscribe each render — which never settles under the store-based engine.
    const participantPolicyIDs = participants.map((participant) => participant.policyID).join(',');
    const policyTagsSelector = useCallback(
        (allTags: OnyxCollection<PolicyTagLists>) => getPolicyTagsSelector(participants)(allTags),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [participantPolicyIDs],
    );
    const [participantsPolicyTags = getEmptyObject<Record<string, PolicyTagLists>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: policyTagsSelector});

    return participantsPolicyTags;
}

export default useParticipantsPolicyTags;
