import type {PersonalDetailsList} from '@src/types/onyx';

import {getCustomAgentAccountIDs} from '@selectors/AgentZeroChat';

const FIRST_AGENT_ACCOUNT_ID = 1001;
const HUMAN_ACCOUNT_ID = 2002;
const SECOND_AGENT_ACCOUNT_ID = 3003;

describe('getCustomAgentAccountIDs', () => {
    it('returns the custom agents only, sorted by accountID', () => {
        // Given personal details where two custom agents surround a human, out of order
        const personalDetails: PersonalDetailsList = {
            [SECOND_AGENT_ACCOUNT_ID]: {accountID: SECOND_AGENT_ACCOUNT_ID, isCustomAgent: true},
            [HUMAN_ACCOUNT_ID]: {accountID: HUMAN_ACCOUNT_ID},
            [FIRST_AGENT_ACCOUNT_ID]: {accountID: FIRST_AGENT_ACCOUNT_ID, isCustomAgent: true},
        };

        // When the custom agents are picked out
        const customAgentAccountIDs = getCustomAgentAccountIDs(personalDetails);

        // Then only the agents come back in a stable order, so the selector result compares equal between renders
        expect(customAgentAccountIDs).toEqual([FIRST_AGENT_ACCOUNT_ID, SECOND_AGENT_ACCOUNT_ID]);
    });

    it('returns an empty list when no custom agent is present', () => {
        // Given personal details for humans only
        const personalDetails: PersonalDetailsList = {[HUMAN_ACCOUNT_ID]: {accountID: HUMAN_ACCOUNT_ID}};

        // When the custom agents are picked out
        // Then nothing comes back
        expect(getCustomAgentAccountIDs(personalDetails)).toEqual([]);
    });
});
