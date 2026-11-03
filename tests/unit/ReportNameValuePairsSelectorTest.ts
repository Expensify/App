import CONST from '@src/CONST';
import type {ReportNameValuePairs} from '@src/types/onyx';

import {agentZeroProcessingAgentIDsSelector, getAgentZeroProcessingLabel} from '@selectors/ReportNameValuePairs';

const CONCIERGE = CONST.ACCOUNT_ID.CONCIERGE;
const CUSTOM_AGENT = 12345678;

describe('ReportNameValuePairs selectors', () => {
    describe('getAgentZeroProcessingLabel', () => {
        it('returns the trimmed label for the requested agent from the per-agent map', () => {
            const rnvp: ReportNameValuePairs = {agentZeroProcessingRequestIndicator: {[`${CUSTOM_AGENT}`]: '  Looking up categories...  '}};
            expect(getAgentZeroProcessingLabel(rnvp, CUSTOM_AGENT)).toBe('Looking up categories...');
        });

        it('returns empty string for an agent with no entry, leaving co-resident agents unaffected', () => {
            const rnvp: ReportNameValuePairs = {agentZeroProcessingRequestIndicator: {[`${CONCIERGE}`]: 'Concierge is thinking...'}};
            expect(getAgentZeroProcessingLabel(rnvp, CUSTOM_AGENT)).toBe('');
            expect(getAgentZeroProcessingLabel(rnvp, CONCIERGE)).toBe('Concierge is thinking...');
        });

        it('attributes a legacy scalar value to Concierge (deploy overlap)', () => {
            const rnvp = {agentZeroProcessingRequestIndicator: '  Concierge is thinking...  '} as ReportNameValuePairs;
            expect(getAgentZeroProcessingLabel(rnvp, CONCIERGE)).toBe('Concierge is thinking...');
            expect(getAgentZeroProcessingLabel(rnvp, CUSTOM_AGENT)).toBe('');
        });

        it('returns empty string when the NVP or indicator is missing', () => {
            expect(getAgentZeroProcessingLabel(undefined, CONCIERGE)).toBe('');
            expect(getAgentZeroProcessingLabel({} as ReportNameValuePairs, CONCIERGE)).toBe('');
        });

        it('returns empty string when an agent slot is whitespace-only', () => {
            const rnvp: ReportNameValuePairs = {agentZeroProcessingRequestIndicator: {[`${CONCIERGE}`]: '   '}};
            expect(getAgentZeroProcessingLabel(rnvp, CONCIERGE)).toBe('');
        });
    });

    describe('agentZeroProcessingAgentIDsSelector', () => {
        it('returns every agent with a non-empty label, sorted', () => {
            const rnvp: ReportNameValuePairs = {agentZeroProcessingRequestIndicator: {[`${CUSTOM_AGENT}`]: 'Thinking...', [`${CONCIERGE}`]: 'Concierge is thinking...'}};
            expect(agentZeroProcessingAgentIDsSelector(rnvp)).toEqual([CONCIERGE, CUSTOM_AGENT].sort((a, b) => a - b));
        });

        it('omits agents whose label is empty or whitespace-only', () => {
            const rnvp: ReportNameValuePairs = {agentZeroProcessingRequestIndicator: {[`${CONCIERGE}`]: 'Concierge is thinking...', [`${CUSTOM_AGENT}`]: '   '}};
            expect(agentZeroProcessingAgentIDsSelector(rnvp)).toEqual([CONCIERGE]);
        });

        it('treats a legacy scalar value as a single Concierge entry', () => {
            const rnvp = {agentZeroProcessingRequestIndicator: 'Concierge is thinking...'} as ReportNameValuePairs;
            expect(agentZeroProcessingAgentIDsSelector(rnvp)).toEqual([CONCIERGE]);
        });

        it('returns an empty list when there is nothing processing', () => {
            expect(agentZeroProcessingAgentIDsSelector(undefined)).toEqual([]);
            expect(agentZeroProcessingAgentIDsSelector({} as ReportNameValuePairs)).toEqual([]);
            expect(agentZeroProcessingAgentIDsSelector({agentZeroProcessingRequestIndicator: '   '} as ReportNameValuePairs)).toEqual([]);
        });
    });
});
