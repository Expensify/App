import {getAgentRuleSuggestions} from '@libs/actions/Policy/Rules';
import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

jest.mock('@libs/API');

const mockRead = jest.mocked(API.read);

describe('getAgentRuleSuggestions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls GetAgentRuleSuggestions with the policyID', () => {
        getAgentRuleSuggestions('policy123');

        expect(mockRead).toHaveBeenCalledWith(READ_COMMANDS.GET_AGENT_RULE_SUGGESTIONS, {policyID: 'policy123'});
    });

    it('does not call the API when policyID is missing', () => {
        getAgentRuleSuggestions(undefined);

        expect(mockRead).not.toHaveBeenCalled();
    });
});
