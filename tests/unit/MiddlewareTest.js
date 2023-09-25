import Onyx from 'react-native-onyx';
import * as NetworkStore from '../../src/libs/Network/NetworkStore';
import * as Request from '../../src/libs/Request';
import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as MainQueue from '../../src/libs/Network/MainQueue';
import HttpUtils from '../../src/libs/HttpUtils';

Onyx.init({
    keys: ONYXKEYS,
});

beforeAll(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
});

beforeEach(async () => {
    SequentialQueue.pause();
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    NetworkStore.checkRequiredData();
    await waitForNetworkPromises();
    jest.clearAllMocks();
});

describe('Middleware', () => {
    describe('HandleUnusedOptimisticID', () => {
        test('Normal request', async () => {
            const actual = jest.requireActual('../../src/libs/Middleware/HandleUnusedOptimisticID');
            const handleUnusedOptimisticID = jest.spyOn(actual, 'default');
            Request.use(handleUnusedOptimisticID);
            const requests = [
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: '1234'},
                },
                {
                    command: 'AddComment',
                    data: {authToken: 'testToken', reportID: '1234', reportActionID: '5678', reportComment: 'foo'},
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }
            SequentialQueue.unpause();
            await waitForBatchedUpdates();
            await waitForNetworkPromises();

            expect(global.fetch).expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(handleUnusedOptimisticID).not.toHaveBeenCalled();
        });
    });
});
