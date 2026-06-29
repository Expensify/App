import {shouldSynthesizeWorkspaceFeedsLoadError, shouldWaitForDomainFeedData} from '@libs/CompanyCardsFeedLoadingUtils';
import CONST from '@src/CONST';

describe('domain feed loading helpers', () => {
    describe('shouldWaitForDomainFeedData', () => {
        it('returns true while domain feed data is still hydrating', () => {
            expect(shouldWaitForDomainFeedData(CONST.DEFAULT_NUMBER_ID, CONST.DEFAULT_NUMBER_ID, false, false, false)).toBe(true);
        });

        it('returns false once feeds have loaded', () => {
            expect(shouldWaitForDomainFeedData(CONST.DEFAULT_NUMBER_ID, CONST.DEFAULT_NUMBER_ID, true, false, true)).toBe(false);
        });

        it('returns false once the domain account ID resolves', () => {
            expect(shouldWaitForDomainFeedData(CONST.DEFAULT_NUMBER_ID, 12345678, false, false, false)).toBe(false);
        });
    });

    describe('shouldSynthesizeWorkspaceFeedsLoadError', () => {
        it('does not synthesize an error while waiting for domain feed data', () => {
            expect(shouldSynthesizeWorkspaceFeedsLoadError(CONST.DEFAULT_NUMBER_ID, true, false, true)).toBe(false);
        });

        it('synthesizes an error when feed loading settled without a resolvable account ID', () => {
            expect(shouldSynthesizeWorkspaceFeedsLoadError(CONST.DEFAULT_NUMBER_ID, true, false, false)).toBe(true);
        });

        it('does not synthesize an error while offline', () => {
            expect(shouldSynthesizeWorkspaceFeedsLoadError(CONST.DEFAULT_NUMBER_ID, true, true, false)).toBe(false);
        });
    });
});
