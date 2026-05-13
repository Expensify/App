import agentZeroProcessingIndicatorSelector from '@selectors/ReportNameValuePairs';
import type {ReportNameValuePairs} from '@src/types/onyx';

describe('ReportNameValuePairs selectors', () => {
    describe('agentZeroProcessingIndicatorSelector', () => {
        it('should return trimmed indicator when present', () => {
            const rnvp = {agentZeroProcessingRequestIndicator: '  Concierge is looking up categories...  '} as ReportNameValuePairs;
            expect(agentZeroProcessingIndicatorSelector(rnvp)).toBe('Concierge is looking up categories...');
        });

        it('should return empty string when indicator is undefined', () => {
            const rnvp = {} as ReportNameValuePairs;
            expect(agentZeroProcessingIndicatorSelector(rnvp)).toBe('');
        });

        it('should return empty string when rnvp is undefined', () => {
            expect(agentZeroProcessingIndicatorSelector(undefined)).toBe('');
        });

        it('should return empty string when indicator is whitespace-only', () => {
            const rnvp = {agentZeroProcessingRequestIndicator: '   '} as ReportNameValuePairs;
            expect(agentZeroProcessingIndicatorSelector(rnvp)).toBe('');
        });

        it('should return the indicator as-is when no trimming needed', () => {
            const rnvp = {agentZeroProcessingRequestIndicator: 'Processing your request...'} as ReportNameValuePairs;
            expect(agentZeroProcessingIndicatorSelector(rnvp)).toBe('Processing your request...');
        });
    });
});
