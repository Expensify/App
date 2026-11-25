import {getAgentAccountIDState, getAgentRecordAccountIDState} from '@libs/AgentUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Agent, PersonalDetailsList} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

const TEMPORARY_ACCOUNT_ID = 7392018465730291;
const REAL_ACCOUNT_ID = 12348;
const MAPPING = {[TEMPORARY_ACCOUNT_ID]: REAL_ACCOUNT_ID};
const TEMPORARY_AGENT: Agent = {prompt: 'Pending instructions', fallbackDisplayName: 'Pending agent'};
const REAL_AGENT: Agent = {prompt: 'Created instructions'};
const TEMPORARY_DETAILS = {accountID: TEMPORARY_ACCOUNT_ID, displayName: 'Pending agent', isOptimisticPersonalDetail: true};
const REAL_DETAILS = {accountID: REAL_ACCOUNT_ID, displayName: 'Created agent', login: 'agent+12348@expensify.ai'};

// Builds what a tab holds after some of another tab's writes reached it: the mapping (M), the personal details write that
// adds the real agent and removes the temporary one (D), and the real agent's record (R).
function buildTabData({hasMapping, hasDetailsWrite, hasRealRecord}: {hasMapping: boolean; hasDetailsWrite: boolean; hasRealRecord: boolean}) {
    const agents: OnyxCollection<Agent> = {
        [`${ONYXKEYS.COLLECTION.AGENT}${TEMPORARY_ACCOUNT_ID}`]: TEMPORARY_AGENT,
        ...(hasRealRecord ? {[`${ONYXKEYS.COLLECTION.AGENT}${REAL_ACCOUNT_ID}`]: REAL_AGENT} : {}),
    };
    const personalDetailsList: PersonalDetailsList = hasDetailsWrite ? {[REAL_ACCOUNT_ID]: REAL_DETAILS} : {[TEMPORARY_ACCOUNT_ID]: TEMPORARY_DETAILS};
    const mapping: Record<string, number> = hasMapping ? MAPPING : {};
    return {agents, personalDetailsList, mapping};
}

describe('getAgentAccountIDState', () => {
    it.each([
        // Mapping, details write, real record -> expected screen ID, personal details ID, settling
        {name: 'nothing arrived yet', hasMapping: false, hasDetailsWrite: false, hasRealRecord: false, accountID: TEMPORARY_ACCOUNT_ID, detailsID: TEMPORARY_ACCOUNT_ID, isSettling: false},
        {name: 'mapping only', hasMapping: true, hasDetailsWrite: false, hasRealRecord: false, accountID: TEMPORARY_ACCOUNT_ID, detailsID: TEMPORARY_ACCOUNT_ID, isSettling: true},
        {name: 'details only', hasMapping: false, hasDetailsWrite: true, hasRealRecord: false, accountID: TEMPORARY_ACCOUNT_ID, detailsID: TEMPORARY_ACCOUNT_ID, isSettling: true},
        {name: 'record only', hasMapping: false, hasDetailsWrite: false, hasRealRecord: true, accountID: TEMPORARY_ACCOUNT_ID, detailsID: TEMPORARY_ACCOUNT_ID, isSettling: false},
        {name: 'mapping and details', hasMapping: true, hasDetailsWrite: true, hasRealRecord: false, accountID: TEMPORARY_ACCOUNT_ID, detailsID: REAL_ACCOUNT_ID, isSettling: true},
        {name: 'mapping and record', hasMapping: true, hasDetailsWrite: false, hasRealRecord: true, accountID: TEMPORARY_ACCOUNT_ID, detailsID: TEMPORARY_ACCOUNT_ID, isSettling: true},
        {name: 'details and record', hasMapping: false, hasDetailsWrite: true, hasRealRecord: true, accountID: TEMPORARY_ACCOUNT_ID, detailsID: TEMPORARY_ACCOUNT_ID, isSettling: true},
        {name: 'everything', hasMapping: true, hasDetailsWrite: true, hasRealRecord: true, accountID: REAL_ACCOUNT_ID, detailsID: REAL_ACCOUNT_ID, isSettling: false},
    ])('for a screen opened on the temporary agent with $name in this tab', ({hasMapping, hasDetailsWrite, hasRealRecord, accountID, detailsID, isSettling}) => {
        // Given a tab that received only some of another tab's writes for a new agent, in any order
        const {agents, personalDetailsList, mapping} = buildTabData({hasMapping, hasDetailsWrite, hasRealRecord});

        // When a screen opened on the temporary accountID resolves which agent to show
        const state = getAgentAccountIDState({
            accountID: TEMPORARY_ACCOUNT_ID,
            mappedAccountID: mapping[TEMPORARY_ACCOUNT_ID],
            isMappedRealAccountID: false,
            hasAgent: !!agents?.[`${ONYXKEYS.COLLECTION.AGENT}${TEMPORARY_ACCOUNT_ID}`],
            hasDetails: !!personalDetailsList[TEMPORARY_ACCOUNT_ID],
            hasDetailsWithLogin: !!personalDetailsList[TEMPORARY_ACCOUNT_ID]?.login,
            isTemporaryRecord: agents?.[`${ONYXKEYS.COLLECTION.AGENT}${TEMPORARY_ACCOUNT_ID}`]?.fallbackDisplayName !== undefined,
            hasRealAgent: !!agents?.[`${ONYXKEYS.COLLECTION.AGENT}${REAL_ACCOUNT_ID}`],
            hasRealDetailsWithLogin: !!personalDetailsList[REAL_ACCOUNT_ID]?.login,
        });

        // Then it moves to the real agent only once this tab holds its record and details, reads the real details as soon
        // as they arrive, and is settling (no save or delete) until then, unless nothing of the real agent arrived yet
        expect(state).toStrictEqual({accountID, personalDetailsAccountID: detailsID, isSettling});
    });

    it('is settling for a screen on the real accountID while this tab lacks the real record', () => {
        // Given a screen that moved to the real accountID because nothing temporary was left, before the real record arrived
        // When it resolves which agent to show
        const state = getAgentAccountIDState({
            accountID: REAL_ACCOUNT_ID,
            mappedAccountID: undefined,
            isMappedRealAccountID: true,
            hasAgent: false,
            hasDetails: true,
            hasDetailsWithLogin: true,
            isTemporaryRecord: false,
            hasRealAgent: false,
            hasRealDetailsWithLogin: false,
        });

        // Then it is settling, so it doesn't save into a record this tab doesn't hold
        expect(state.isSettling).toBe(true);
    });

    it('is not settling for an agent that was not created in this session', () => {
        // Given an existing agent with its record and server details and no mapping
        // When a screen resolves it
        const state = getAgentAccountIDState({
            accountID: REAL_ACCOUNT_ID,
            mappedAccountID: undefined,
            isMappedRealAccountID: false,
            hasAgent: true,
            hasDetails: true,
            hasDetailsWithLogin: true,
            isTemporaryRecord: false,
            hasRealAgent: false,
            hasRealDetailsWithLogin: false,
        });

        // Then nothing changes for it
        expect(state).toStrictEqual({accountID: REAL_ACCOUNT_ID, personalDetailsAccountID: REAL_ACCOUNT_ID, isSettling: false});
    });

    it('is not settling for an existing agent whose details this tab has not loaded', () => {
        // Given an existing agent's record without a fallback name, so not a new agent's temporary record, whose personal
        // details this tab doesn't hold, for example because they haven't loaded yet
        // When a screen resolves it
        const state = getAgentAccountIDState({
            accountID: REAL_ACCOUNT_ID,
            mappedAccountID: undefined,
            isMappedRealAccountID: false,
            hasAgent: true,
            hasDetails: false,
            hasDetailsWithLogin: false,
            isTemporaryRecord: false,
            hasRealAgent: false,
            hasRealDetailsWithLogin: false,
        });

        // Then its actions stay on, because only a new agent's temporary record waits for the mapping
        expect(state.isSettling).toBe(false);
    });
});

describe('getAgentRecordAccountIDState', () => {
    it.each([
        {name: 'mapping only', hasMapping: true, hasDetailsWrite: false, hasRealRecord: false},
        {name: 'details only', hasMapping: false, hasDetailsWrite: true, hasRealRecord: false},
        {name: 'mapping and details', hasMapping: true, hasDetailsWrite: true, hasRealRecord: false},
        {name: 'mapping and record', hasMapping: true, hasDetailsWrite: false, hasRealRecord: true},
        {name: 'everything', hasMapping: true, hasDetailsWrite: true, hasRealRecord: true},
    ])('lists a new agent exactly once with $name in this tab', ({hasMapping, hasDetailsWrite, hasRealRecord}) => {
        // Given a tab that received only some of another tab's writes for a new agent
        const {agents, personalDetailsList, mapping} = buildTabData({hasMapping, hasDetailsWrite, hasRealRecord});

        // When the agents list decides which records get a row, each needing details or a fallback name to show
        const rows = [TEMPORARY_ACCOUNT_ID, REAL_ACCOUNT_ID].flatMap((accountID) => {
            const agent = agents?.[`${ONYXKEYS.COLLECTION.AGENT}${accountID}`];
            const state = agent ? getAgentRecordAccountIDState(accountID, agents, personalDetailsList, mapping, new Set(Object.values(mapping))) : undefined;
            if (!state) {
                return [];
            }
            const details = personalDetailsList[state.personalDetailsAccountID];
            return details || agent?.fallbackDisplayName !== undefined ? [{accountID, name: details?.displayName ?? agent?.fallbackDisplayName}] : [];
        });

        // Then the agent has exactly one row, with a name, in every arrival order
        expect(rows).toHaveLength(1);
        expect(rows.at(0)?.name).toBeTruthy();
    });

    it('lists the agent twice only while its details and record arrived before the mapping', () => {
        // Given a tab that received the details write and the real record but not the mapping yet, so nothing links the two
        const {agents, personalDetailsList, mapping} = buildTabData({hasMapping: false, hasDetailsWrite: true, hasRealRecord: true});

        // When the agents list decides which records get a row
        const listed = [TEMPORARY_ACCOUNT_ID, REAL_ACCOUNT_ID].filter(
            (accountID) => !!getAgentRecordAccountIDState(accountID, agents, personalDetailsList, mapping, new Set(Object.values(mapping))),
        );

        // Then both records are listed until the mapping arrives; the temporary one is settling, so it offers no actions
        expect(listed).toStrictEqual([TEMPORARY_ACCOUNT_ID, REAL_ACCOUNT_ID]);
        expect(getAgentRecordAccountIDState(TEMPORARY_ACCOUNT_ID, agents, personalDetailsList, mapping, new Set(Object.values(mapping)))?.isSettling).toBe(true);
    });
});
