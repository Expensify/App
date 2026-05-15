import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AgentPrompt, PersonalDetailsList} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';

/**
 * Canonical email pattern for custom-agent accounts. Mirrors the value PHP mints in
 * `AgentAPI::createAgent` (`agent_<accountID>@expensify.ai`).
 */
const CUSTOM_AGENT_EMAIL_REGEX = /^agent_(\d+)@expensify\.ai$/;

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

/**
 * Reduces PERSONAL_DETAILS_LIST to a `Record<accountID, true>` for accounts whose login
 * matches the canonical agent email pattern. Used as a cold-start fallback when the user
 * hasn't visited the Agents page yet (so SHARED_NVP_AGENT_PROMPT isn't populated). Output
 * stays small so deepEqual on irrelevant personal-details updates is cheap.
 */
const getAgentLoginAccountIDFlags = (personalDetails: OnyxEntry<PersonalDetailsList>): Record<number, true> => {
    if (!personalDetails) {
        return {};
    }
    const flags: Record<number, true> = {};
    for (const detail of Object.values(personalDetails)) {
        if (!detail?.login || !detail.accountID) {
            continue;
        }
        if (CUSTOM_AGENT_EMAIL_REGEX.test(detail.login)) {
            flags[detail.accountID] = true;
        }
    }
    return flags;
};

export {CUSTOM_AGENT_EMAIL_REGEX, getReportParticipantAccountIDs, getAgentAccountIDFlags, getAgentLoginAccountIDFlags};
