import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AgentPrompt, ConciergePendingFollowupList} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';

const getReportParticipantAccountIDs = (report: OnyxEntry<Report>): number[] => (report?.participants ? Object.keys(report.participants).map(Number) : []);

/**
 * Reduces the SHARED_NVP_AGENT_PROMPT collection to a `Record<accountID, true>` so callers
 * can do O(1) lookups without re-rendering on every prompt-content edit.
 */
const getAgentAccountIDFlags = (agentPrompts: OnyxCollection<AgentPrompt>): Record<number, true> => {
    if (!agentPrompts) {
        return {};
    }
    const flags: Record<number, true> = {};
    for (const key of Object.keys(agentPrompts)) {
        const accountID = Number(key.slice(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT.length));
        if (!Number.isNaN(accountID)) {
            flags[accountID] = true;
        }
    }
    return flags;
};

const hasPendingFollowupListSkeletonSelector =
    (reportActionID: string) =>
    (pending: OnyxEntry<ConciergePendingFollowupList>): boolean =>
        !pending?.hidden && pending?.reportActionID === reportActionID;

export {getReportParticipantAccountIDs, getAgentAccountIDFlags, hasPendingFollowupListSkeletonSelector};
