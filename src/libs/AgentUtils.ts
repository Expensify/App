import ONYXKEYS from '@src/ONYXKEYS';
import type {Agent, PersonalDetailsList} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {isValidAgentAccountID} from './AgentAccountIDMapping';
import {getLatestError} from './ErrorUtils';

function getAgentErrors(agent: OnyxEntry<Agent>): Errors | undefined {
    if (!agent) {
        return undefined;
    }
    const mergedErrors = {
        ...getLatestError(agent.errors ?? undefined),
        ...getLatestError(agent.nameErrors ?? undefined),
        ...getLatestError(agent.promptErrors ?? undefined),
        ...getLatestError(agent.avatarErrors ?? undefined),
    };
    return getLatestError(mergedErrors);
}

function doesAgentHaveErrors(agent: OnyxEntry<Agent>): boolean {
    const agentErrors = getAgentErrors(agent);
    return Object.keys(agentErrors ?? {}).length > 0;
}

function hasAgentErrorsSelector(agents: OnyxCollection<Agent>): boolean {
    return Object.values(agents ?? {}).some(doesAgentHaveErrors);
}

function agentAccountIDsSelector(agents: OnyxCollection<Agent>): number[] {
    return Object.keys(agents ?? {}).map((key) => Number(key.slice(ONYXKEYS.COLLECTION.AGENT.length)));
}

type AgentAccountIDStateInput = {
    /** The accountID a screen or list row was opened with */
    accountID: number;

    /** What this tab's optimistic-to-real mapping gives for that accountID */
    mappedAccountID: unknown;

    /** Whether that accountID is the real one of a known mapping */
    isMappedRealAccountID: boolean;

    /** What this tab holds for that accountID */
    hasAgent: boolean;
    hasDetails: boolean;
    hasDetailsWithLogin: boolean;

    /** Whether this tab's record for that accountID is a new agent's temporary record (it carries a fallback name) */
    isTemporaryRecord: boolean;

    /** What this tab holds for the mapped real accountID */
    hasRealAgent: boolean;
    hasRealDetailsWithLogin: boolean;
};

type AgentAccountIDState = {
    /** The accountID to show and act on: the real one once this tab holds the real agent and its server details */
    accountID: number;

    /** The accountID to read personal details with: the real one as soon as this tab holds the real details */
    personalDetailsAccountID: number;

    /** The agent's data is still reaching this tab, so saving or deleting would write from an incomplete copy */
    isSettling: boolean;
};

/**
 * One rule for agent screens and lists. Another tab's writes reach this tab key by key, in any order: the mapping, the
 * personal details (which add the real agent and remove the temporary one in one write) and the real agent's record.
 * The agent is settling while this tab knows its real accountID but does not hold both the real record and the real
 * details with a login, or while a new agent's temporary details are already gone before the mapping arrived.
 */
function getAgentAccountIDState({
    accountID,
    mappedAccountID,
    isMappedRealAccountID,
    hasAgent,
    hasDetails,
    hasDetailsWithLogin,
    isTemporaryRecord,
    hasRealAgent,
    hasRealDetailsWithLogin,
}: AgentAccountIDStateInput): AgentAccountIDState {
    const realAccountID = isValidAgentAccountID(mappedAccountID) ? mappedAccountID : undefined;
    if (realAccountID) {
        const holdsRealAgent = hasRealAgent && hasRealDetailsWithLogin;
        // With nothing temporary left to show, the real accountID is the only one a screen can use.
        const resolvedAccountID = holdsRealAgent || (!hasAgent && !hasDetails) ? realAccountID : accountID;
        return {accountID: resolvedAccountID, personalDetailsAccountID: hasRealDetailsWithLogin ? realAccountID : resolvedAccountID, isSettling: !holdsRealAgent};
    }
    if (isMappedRealAccountID) {
        return {accountID, personalDetailsAccountID: accountID, isSettling: !hasAgent || !hasDetailsWithLogin};
    }
    // Only a new agent's temporary record settles here; an existing agent whose details aren't loaded keeps its actions.
    return {accountID, personalDetailsAccountID: accountID, isSettling: hasAgent && isTemporaryRecord && !hasDetails};
}

/**
 * The same rule for a list row built from one agent record in the collections this tab holds. A temporary record whose
 * real agent this tab already holds returns undefined: the real record has its own row, so each agent is listed once.
 */
function getAgentRecordAccountIDState(
    agentAccountID: number,
    agents: OnyxCollection<Agent>,
    personalDetailsList: OnyxEntry<PersonalDetailsList>,
    agentAccountIDMapping: OnyxEntry<Record<string, number>>,
    mappedRealAccountIDs: Set<number>,
): AgentAccountIDState | undefined {
    const mappedAccountID = agentAccountIDMapping?.[agentAccountID];
    const realAccountID = isValidAgentAccountID(mappedAccountID) ? mappedAccountID : undefined;
    const state = getAgentAccountIDState({
        accountID: agentAccountID,
        mappedAccountID,
        isMappedRealAccountID: mappedRealAccountIDs.has(agentAccountID),
        hasAgent: !!agents?.[`${ONYXKEYS.COLLECTION.AGENT}${agentAccountID}`],
        hasDetails: !!personalDetailsList?.[agentAccountID],
        hasDetailsWithLogin: !!personalDetailsList?.[agentAccountID]?.login,
        isTemporaryRecord: agents?.[`${ONYXKEYS.COLLECTION.AGENT}${agentAccountID}`]?.fallbackDisplayName !== undefined,
        hasRealAgent: !!realAccountID && !!agents?.[`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`],
        hasRealDetailsWithLogin: !!realAccountID && !!personalDetailsList?.[realAccountID]?.login,
    });
    return state.accountID === agentAccountID ? state : undefined;
}

export type {AgentAccountIDState};
export {getAgentErrors, hasAgentErrorsSelector, agentAccountIDsSelector, getAgentAccountIDState, getAgentRecordAccountIDState};
