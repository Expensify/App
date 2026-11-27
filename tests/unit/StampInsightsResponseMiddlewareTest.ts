import {READ_COMMANDS} from '@libs/API/types';
import stampInsightsResponse from '@libs/Middleware/StampInsightsResponse';

import ONYXKEYS from '@src/ONYXKEYS';
import type Response from '@src/types/onyx/Response';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';

const dashboardKey = `${ONYXKEYS.COLLECTION.INSIGHTS}spend_100` as const;
const currentSnapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}200` as const;
const previousSnapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}300` as const;

function buildResponse() {
    return createMock<Response<typeof ONYXKEYS.COLLECTION.INSIGHTS | typeof ONYXKEYS.COLLECTION.SNAPSHOT | typeof ONYXKEYS.COLLECTION.REPORT>>({
        requestID: 'request-id',
        onyxData: [
            {onyxMethod: Onyx.METHOD.SET, key: dashboardKey, value: {inputQuery: 'tagLevel:1'}},
            {onyxMethod: Onyx.METHOD.SET, key: currentSnapshotKey, value: {data: {}}},
            {onyxMethod: Onyx.METHOD.SET, key: previousSnapshotKey, value: {data: {}}},
            {onyxMethod: Onyx.METHOD.SET, key: `${ONYXKEYS.COLLECTION.REPORT}1`, value: {reportID: '1'}},
        ],
    });
}

describe('StampInsightsResponse', () => {
    it('pairs the dashboard and current and previous snapshots with an ID unique to each response', async () => {
        // Given GetInsights returned the dashboard, two chart snapshots, and an unrelated update
        const original = buildResponse();

        // When its response passes through the middleware
        const result = await stampInsightsResponse(Promise.resolve(original), {command: READ_COMMANDS.GET_INSIGHTS}, false);

        // Then both periods and the dashboard share one ID, and the unrelated update is unchanged
        const dashboardValue = result?.onyxData?.at(0)?.value;
        const version = dashboardValue && 'insightsResponseID' in dashboardValue ? dashboardValue.insightsResponseID : undefined;
        expect(version).toEqual(expect.any(String));
        expect(result?.onyxData).toEqual([
            {...original.onyxData?.at(0), value: {inputQuery: 'tagLevel:1', insightsResponseID: version}},
            {...original.onyxData?.at(1), value: {data: {}, insightsResponseID: version}},
            {...original.onyxData?.at(2), value: {data: {}, insightsResponseID: version}},
            original.onyxData?.at(3),
        ]);
        expect(original.onyxData?.at(0)?.value).toEqual({inputQuery: 'tagLevel:1'});

        // A later response can have the same server logging ID and must still have a different pairing ID.
        const nextResult = await stampInsightsResponse(Promise.resolve(buildResponse()), {command: READ_COMMANDS.GET_INSIGHTS}, false);
        expect(nextResult?.onyxData?.at(0)?.value).not.toHaveProperty('insightsResponseID', version);
    });

    it('leaves Search responses untouched', async () => {
        // Given Search returned a snapshot under a key shared with Insights
        const original = buildResponse();

        // When Search's response passes through the middleware
        const result = await stampInsightsResponse(Promise.resolve(original), {command: READ_COMMANDS.SEARCH}, false);

        // Then it is not stamped as an Insights response
        expect(result).toBe(original);
    });
});
