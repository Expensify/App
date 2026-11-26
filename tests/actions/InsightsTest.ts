import {getInsights} from '@libs/actions/Insights';
import {makeRequestWithSideEffects} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    waitForWrites: jest.fn(() => Promise.resolve()),
    makeRequestWithSideEffects: jest.fn(() => Promise.resolve({jsonCode: 200})),
}));

const HASH = 5;
const RESPONSE_REQUEST_ID_KEY = `${ONYXKEYS.COLLECTION.RAM_ONLY_INSIGHTS_RESPONSE_REQUEST_ID}${CONST.INSIGHTS.DASHBOARD.SPEND}_${HASH}`;

describe('actions/Insights', () => {
    it('stores the request ID only when GetInsights succeeds', async () => {
        // Given no request for the Spend dashboard yet
        // When the Spend dashboard is requested
        getInsights(CONST.INSIGHTS.DASHBOARD.SPEND, HASH, '{}', [], CONST.SEARCH.DATA_TYPES.EXPENSE, 'request1');
        await waitForBatchedUpdates();

        // Then a successful response stores the request's ID, and a failed one does not
        const [command, , onyxData] = jest.mocked(makeRequestWithSideEffects).mock.calls.at(0) ?? [];
        expect(command).toBe(READ_COMMANDS.GET_INSIGHTS);
        expect(onyxData?.successData?.some((update) => update.key === RESPONSE_REQUEST_ID_KEY && update.value === 'request1')).toBe(true);
        expect(onyxData?.failureData?.some((update) => update.key === RESPONSE_REQUEST_ID_KEY)).toBe(false);
    });
});
