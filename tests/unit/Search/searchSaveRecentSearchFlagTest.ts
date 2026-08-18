import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import * as fs from 'fs';
import * as path from 'path';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

const mockedMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);
const mockedWaitForWrites = jest.mocked(waitForWrites);

function getQueryJSON(query = '') {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }

    return queryJSON;
}

function getLastRequestJsonQuery(): unknown {
    const requestParams = mockedMakeRequestWithSideEffects.mock.calls.at(-1)?.[1];
    if (!requestParams || !('jsonQuery' in requestParams) || typeof requestParams.jsonQuery !== 'string') {
        throw new Error('Search request params with jsonQuery should be defined');
    }

    const parsedJsonQuery: unknown = JSON.parse(requestParams.jsonQuery);
    return parsedJsonQuery;
}

// The backend only saves a query to the recent searches NVP when the payload declares it was
// user-submitted, so these tests pin down exactly when the flag is (and is not) serialized.
describe('search shouldSaveRecentSearch flag', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedWaitForWrites.mockResolvedValue(undefined);
        mockedMakeRequestWithSideEffects.mockResolvedValue(undefined);
    });

    it('serializes the flag into jsonQuery when passed', async () => {
        await search({
            queryJSON: getQueryJSON('merchant:uber'),
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            isLoading: false,
            shouldSaveRecentSearch: true,
        });

        expect(getLastRequestJsonQuery()).toEqual(expect.objectContaining({shouldSaveRecentSearch: true}));
    });

    it('omits the flag entirely by default so programmatic searches cannot be saved', async () => {
        await search({
            queryJSON: getQueryJSON('merchant:lyft'),
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            isLoading: false,
        });

        expect(getLastRequestJsonQuery()).not.toHaveProperty('shouldSaveRecentSearch');
    });

    it('preserves the flag on a totals request queued behind an in-flight search', async () => {
        const queryJSON = getQueryJSON('type:expense merchant:starbucks');
        let resolveFirstRequest: () => void = () => {};
        const firstRequestPromise = new Promise<void>((resolve) => {
            resolveFirstRequest = resolve;
        });
        mockedMakeRequestWithSideEffects.mockImplementationOnce(() => firstRequestPromise);

        const firstSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: false,
            isLoading: false,
        });
        search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: true,
            isLoading: false,
            shouldSaveRecentSearch: true,
        });

        await Promise.resolve();
        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(1);

        resolveFirstRequest();
        await firstSearch;
        await Promise.resolve();

        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(2);
        expect(getLastRequestJsonQuery()).toEqual(expect.objectContaining({shouldCalculateTotals: true, shouldSaveRecentSearch: true}));
    });

    it('re-fires a flagged request when a user submit collides with an unflagged in-flight request', async () => {
        const queryJSON = getQueryJSON('merchant:rail');
        let resolveFirstRequest: () => void = () => {};
        const firstRequestPromise = new Promise<void>((resolve) => {
            resolveFirstRequest = resolve;
        });
        mockedMakeRequestWithSideEffects.mockImplementationOnce(() => firstRequestPromise);

        const firstSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            isLoading: false,
        });
        search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            isLoading: false,
            shouldSaveRecentSearch: true,
        });

        await Promise.resolve();
        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(1);

        resolveFirstRequest();
        await firstSearch;
        await Promise.resolve();

        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(2);
        expect(getLastRequestJsonQuery()).toEqual(expect.objectContaining({shouldSaveRecentSearch: true}));
    });

    it('unions totals and save upgrades when both collide with the same in-flight request', async () => {
        const queryJSON = getQueryJSON('type:expense merchant:ferry');
        let resolveFirstRequest: () => void = () => {};
        const firstRequestPromise = new Promise<void>((resolve) => {
            resolveFirstRequest = resolve;
        });
        mockedMakeRequestWithSideEffects.mockImplementationOnce(() => firstRequestPromise);

        const firstSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: false,
            isLoading: false,
        });
        search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: true,
            isLoading: false,
        });
        search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: false,
            isLoading: false,
            shouldSaveRecentSearch: true,
        });

        await Promise.resolve();
        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(1);

        resolveFirstRequest();
        await firstSearch;
        await Promise.resolve();

        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(2);
        expect(getLastRequestJsonQuery()).toEqual(expect.objectContaining({shouldCalculateTotals: true, shouldSaveRecentSearch: true}));
    });

    // The original bug was a wiring problem: programmatic callers looked identical to user submits.
    // Guard the wiring statically so a future caller cannot re-flag a programmatic path unnoticed.
    describe('call-site wiring', () => {
        function collectSourceFiles(directory: string, collected: string[] = []): string[] {
            for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
                const fullPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                    collectSourceFiles(fullPath, collected);
                } else if (/\.tsx?$/.test(entry.name)) {
                    collected.push(fullPath);
                }
            }
            return collected;
        }

        it('only useSearchPageSetup passes shouldSaveRecentSearch: true', () => {
            const sourceRoot = path.resolve(__dirname, '../../../src');
            // The action file serializes the flag into the payload, so it legitimately contains the literal.
            const definitionSite = path.join(sourceRoot, 'libs/actions/Search.ts');
            const flaggedCallSites = collectSourceFiles(sourceRoot).filter(
                (filePath) => filePath !== definitionSite && /shouldSaveRecentSearch:\s*true/.test(fs.readFileSync(filePath, 'utf8')),
            );
            expect(flaggedCallSites).toEqual([path.join(sourceRoot, 'hooks/useSearchPageSetup.ts')]);
        });
    });
});
