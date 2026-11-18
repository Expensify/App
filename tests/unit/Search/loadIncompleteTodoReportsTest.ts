import {loadIncompleteTodoReports} from '@libs/actions/Search';
import {makeRequestWithSideEffects, read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

const mockRead = jest.mocked(read);

describe('loadIncompleteTodoReports', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('asks Search for exactly those reports, under the to-do key so the backend merges them into the main collections', () => {
        // Given two approve to-do reports the device only holds partly
        // When their full data is loaded
        loadIncompleteTodoReports(CONST.SEARCH.SEARCH_KEYS.APPROVE, ['111', '222']);

        // Then one Search request asks for those report IDs with the approve key, without totals or saving a recent search
        expect(mockRead).toHaveBeenCalledTimes(1);
        const [command, params] = mockRead.mock.calls.at(0) ?? [];
        expect(command).toBe(READ_COMMANDS.SEARCH);
        const jsonQuery: unknown = JSON.parse(params && 'jsonQuery' in params ? String(params.jsonQuery) : '{}');
        expect(jsonQuery).toMatchObject({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            searchKey: CONST.SEARCH.SEARCH_KEYS.APPROVE,
            shouldCalculateTotals: false,
            shouldSaveRecentSearch: false,
        });
        expect(JSON.stringify(jsonQuery)).toContain('111');
        expect(JSON.stringify(jsonQuery)).toContain('222');
    });

    it("writes nothing to Onyx itself, so the user's last query for the to-do list is kept", () => {
        // Given a partial approve report
        // When its full data is loaded
        loadIncompleteTodoReports(CONST.SEARCH.SEARCH_KEYS.APPROVE, ['111']);

        // Then the request carries no Onyx updates. search() would overwrite the saved Approve query and the loading state.
        expect(mockRead.mock.calls.at(0)?.[2]).toBeUndefined();
        expect(makeRequestWithSideEffects).not.toHaveBeenCalled();
    });
});
