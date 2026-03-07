import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

type ParticipantWithPolicyID = {
    policyID?: string;
};

/**
 * Hook that extracts policy tags only for participants' policies.
 *
 * @param participants - Array of participants with optional policyID
 * @returns Record mapping policyID to PolicyTagLists
 */
function useParticipantsPolicyTags(participants: ParticipantWithPolicyID[]): Record<string, PolicyTagLists> {

    const participantPolicyIDs = useMemo(() => {
        const ids = new Set<string>();
        for (const p of participants) {
            if (p.policyID) {
                ids.add(p.policyID);
            }
        }
        return Array.from(ids).sort().join(',');
    }, [participants]);

    const policyTagsSelector = useCallback(
        (allTags: OnyxCollection<PolicyTagLists>) => {
            if (!participantPolicyIDs) {
                return {};
            }
            const policyIDs = participantPolicyIDs.split(',');
            return policyIDs.reduce<Record<string, PolicyTagLists>>((acc, participantPolicyID) => {
                const key = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${participantPolicyID}`;
                if (allTags?.[key]) {
                    acc[participantPolicyID] = allTags[key];
                }
                return acc;
            }, {});
        },
        [participantPolicyIDs],
    );

    const [participantsPolicyTags = getEmptyObject<Record<string, PolicyTagLists>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: policyTagsSelector});

    return participantsPolicyTags;
}

export default useParticipantsPolicyTags;
