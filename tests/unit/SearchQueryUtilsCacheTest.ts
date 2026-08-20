import * as SearchParser from '@libs/SearchParser/searchParser';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

// A query that the mocked parser refuses to parse. Real search queries almost never throw (the PEG parser is
// permissive), so we force the failure path with a sentinel and delegate every other query to the real parser.
const UNPARSEABLE_QUERY = 'MELVIN_UNPARSEABLE_SENTINEL';

jest.mock('@libs/SearchParser/searchParser', () => {
    const actual = jest.requireActual<typeof SearchParser>('@libs/SearchParser/searchParser');
    return {
        ...actual,
        parse: jest.fn((query: string, options?: Parameters<typeof actual.parse>[1]) => {
            // Keep the sentinel inline: jest.mock factories can't reference out-of-scope variables.
            if (query === 'MELVIN_UNPARSEABLE_SENTINEL') {
                throw new Error('Simulated parse failure');
            }
            // The generated peggy parser is untyped (`any`); widen to `unknown` so callers keep their own cast.
            return actual.parse(query, options) as unknown;
        }),
    };
});

describe('buildSearchQueryJSON failure caching', () => {
    it('caches parse failures so a broken query is not re-parsed or re-logged on every call', () => {
        const parseMock = jest.mocked(SearchParser.parse);
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        const first = buildSearchQueryJSON(UNPARSEABLE_QUERY);
        const second = buildSearchQueryJSON(UNPARSEABLE_QUERY);

        // The failing query resolves to undefined (icon callers then fall back to the generic bookmark).
        expect(first).toBeUndefined();
        expect(second).toBeUndefined();

        // The PEG parser runs only once for the failing query; the second call is served from the cache.
        const parseCallsForQuery = parseMock.mock.calls.filter((call) => call.at(0) === UNPARSEABLE_QUERY).length;
        expect(parseCallsForQuery).toBe(1);

        // console.error is emitted only once instead of on every render. The sentinel is the only thing this
        // test parses, so a single total error log means the failure was logged once and then served from cache.
        expect(errorSpy).toHaveBeenCalledTimes(1);

        errorSpy.mockRestore();
    });
});
