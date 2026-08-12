import getDefaultDeeplinkSearchQuery from '@libs/Navigation/helpers/getDefaultDeeplinkSearchQuery';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

describe('getDefaultDeeplinkSearchQuery', () => {
    // getDefaultDeeplinkSearchQuery reimplements buildCannedSearchQuery() using only the standalone PEG parser
    // to avoid a require cycle. This guards that the two stay in sync if the canned-query defaults change.
    it('matches buildCannedSearchQuery() with no arguments', () => {
        expect(getDefaultDeeplinkSearchQuery()).toBe(buildCannedSearchQuery());
    });
});
