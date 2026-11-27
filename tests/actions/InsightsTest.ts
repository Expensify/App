import {getInsights} from '@libs/actions/Insights';
import {makeRequestWithSideEffects} from '@libs/API';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    waitForWrites: jest.fn(() => Promise.resolve()),
    makeRequestWithSideEffects: jest.fn(() => Promise.resolve({jsonCode: 200})),
}));

const HASH = 5;
const REQUEST_TIME = 1_800_000_000_000;
const DASHBOARD_KEY = `${ONYXKEYS.COLLECTION.INSIGHTS}${CONST.INSIGHTS.DASHBOARD.SPEND}_${HASH}` as const;
const RESPONSE_TAG_LEVELS_KEY = `${ONYXKEYS.COLLECTION.INSIGHTS_TAG_LEVELS}${CONST.INSIGHTS.DASHBOARD.SPEND}_${HASH}` as const;
const INPUT_QUERY = 'groupBy:month policyID:A date:this-month';
const ONE_LEVEL: InsightsTagLevel[] = [{level: 1, names: ['Department']}];
const TWO_LEVELS: InsightsTagLevel[] = [...ONE_LEVEL, {level: 2, names: ['Project']}];

/** Builds a GetInsights response that lists the dashboard's tag levels */
function makeResponse(tagLevels: InsightsTagLevel[], jsonCode: number = CONST.JSON_CODE.SUCCESS) {
    return {jsonCode, onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: DASHBOARD_KEY, value: {tagLevels}}]};
}

function requestSpendDashboard(requestID: string) {
    getInsights(CONST.INSIGHTS.DASHBOARD.SPEND, HASH, '{}', [], CONST.SEARCH.DATA_TYPES.EXPENSE, requestID, INPUT_QUERY);
}

describe('actions/Insights', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(makeRequestWithSideEffects).mockReset();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('stores the request ID, time and filters together with the tag levels its response listed', async () => {
        // Given a successful response that lists two tag levels, for a request sent at a known time
        jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
        jest.setSystemTime(REQUEST_TIME);
        jest.mocked(makeRequestWithSideEffects).mockResolvedValue(makeResponse(TWO_LEVELS));

        // When the Spend dashboard is requested
        requestSpendDashboard('request1');
        await waitForBatchedUpdates();

        // Then the request and the levels from its own response are stored as one value
        expect(await getOnyxValue(RESPONSE_TAG_LEVELS_KEY)).toEqual({requestID: 'request1', requestedAt: REQUEST_TIME, inputQuery: INPUT_QUERY, tagLevels: TWO_LEVELS});
    });

    it('stores nothing for a failed request', async () => {
        // Given a backend error that still carries tag levels
        jest.mocked(makeRequestWithSideEffects).mockResolvedValue(makeResponse(TWO_LEVELS, 402));

        // When the Spend dashboard is requested
        requestSpendDashboard('request1');
        await waitForBatchedUpdates();

        // Then no levels are stored, since the response can't be trusted
        expect(await getOnyxValue(RESPONSE_TAG_LEVELS_KEY)).toBeUndefined();
    });

    it('keeps the newer request ID and its levels when an older response for the same filters finishes last', async () => {
        // Given an older refresh that is slower than a newer one for the same filters, and lists fewer levels
        let resolveOlder: (value: ReturnType<typeof makeResponse>) => void = () => {};
        jest.mocked(makeRequestWithSideEffects)
            .mockReturnValueOnce(
                new Promise((resolve) => {
                    resolveOlder = resolve;
                }),
            )
            .mockResolvedValueOnce(makeResponse(TWO_LEVELS));

        // When the newer refresh finishes first and the older one finishes last
        requestSpendDashboard('older');
        requestSpendDashboard('newer');
        await waitForBatchedUpdates();
        resolveOlder(makeResponse(ONE_LEVEL));
        await waitForBatchedUpdates();

        // Then the newer request's ID and levels stay stored, so neither the reset, the menu nor the loading state reads the older levels, even after a restart
        expect(await getOnyxValue(RESPONSE_TAG_LEVELS_KEY)).toEqual(expect.objectContaining({requestID: 'newer', tagLevels: TWO_LEVELS}));
    });

    it('stores only the request ID when the response lists no tag levels', async () => {
        // Given a successful response for a dashboard that didn't ask for Top tags
        jest.mocked(makeRequestWithSideEffects).mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS, onyxData: []});

        // When the dashboard is requested
        requestSpendDashboard('request1');
        await waitForBatchedUpdates();

        // Then the request is recorded without levels, so nothing resets the selected level
        const stored = await getOnyxValue(RESPONSE_TAG_LEVELS_KEY);
        expect(stored?.requestID).toBe('request1');
        expect(stored?.tagLevels).toBeUndefined();
    });

    it('stores nothing when the request never gets a response', async () => {
        // Given a request the network rejects
        jest.mocked(makeRequestWithSideEffects).mockRejectedValue(new Error('offline'));

        // When the dashboard is requested
        requestSpendDashboard('request1');
        await waitForBatchedUpdates();

        // Then no levels are stored, since there is no response to trust
        expect(await getOnyxValue(RESPONSE_TAG_LEVELS_KEY)).toBeUndefined();
    });
});
