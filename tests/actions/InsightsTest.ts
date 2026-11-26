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
const REQUEST_TIME = 1_800_000_000_000;
const RESPONSE_REQUEST_ID_KEY = `${ONYXKEYS.COLLECTION.RAM_ONLY_INSIGHTS_RESPONSE_REQUEST_ID}${CONST.INSIGHTS.DASHBOARD.SPEND}_${HASH}`;

describe('actions/Insights', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('stores the request ID and request time only when GetInsights succeeds', async () => {
        // Given no request for the Spend dashboard yet, at a known time
        jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
        jest.setSystemTime(REQUEST_TIME);

        // When the Spend dashboard is requested
        getInsights(CONST.INSIGHTS.DASHBOARD.SPEND, HASH, '{}', [], CONST.SEARCH.DATA_TYPES.EXPENSE, 'request1');
        await waitForBatchedUpdates();

        // Then a successful response stores the request's ID and when it was sent, and a failed one does not
        const [command, , onyxData] = jest.mocked(makeRequestWithSideEffects).mock.calls.at(0) ?? [];
        expect(command).toBe(READ_COMMANDS.GET_INSIGHTS);
        expect(onyxData?.successData?.some((update) => update.key === RESPONSE_REQUEST_ID_KEY && update.value === 'request1')).toBe(true);
        expect(onyxData?.failureData?.some((update) => update.key === RESPONSE_REQUEST_ID_KEY)).toBe(false);
        expect(
            onyxData?.successData?.some(
                (update) =>
                    update.key === `${ONYXKEYS.COLLECTION.INSIGHTS}${CONST.INSIGHTS.DASHBOARD.SPEND}_${HASH}` &&
                    typeof update.value === 'object' &&
                    update.value !== null &&
                    'requestedAt' in update.value &&
                    update.value.requestedAt === REQUEST_TIME,
            ),
        ).toBe(true);
    });
});
