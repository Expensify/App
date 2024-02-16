import Onyx from 'react-native-onyx';
import HttpUtils from '../../src/libs/HttpUtils';
import * as MainQueue from '../../src/libs/Network/MainQueue';
import * as NetworkStore from '../../src/libs/Network/NetworkStore';
import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import * as Request from '../../src/libs/Request';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as TestHelper from '../utils/TestHelper';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

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
    Request.clearMiddlewares();
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
            await waitForNetworkPromises();

            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api?command=AddComment', expect.anything());
            TestHelper.assertFormDataMatchesObject(global.fetch.mock.calls[1][1].body, {reportID: '1234', reportActionID: '5678', reportComment: 'foo'});
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api?command=OpenReport', expect.anything());
            TestHelper.assertFormDataMatchesObject(global.fetch.mock.calls[0][1].body, {reportID: '1234'});
        });

        test('Request with preexistingReportID', async () => {
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

            global.fetch.mockImplementationOnce(async () => ({
                ok: true,
                json: async () => ({
                    jsonCode: 200,
                    onyxData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.REPORT}1234`,
                            value: {
                                preexistingReportID: '5555',
                            },
                        },
                    ],
                }),
            }));

            SequentialQueue.unpause();
            await waitForNetworkPromises();

            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api?command=AddComment', expect.anything());
            TestHelper.assertFormDataMatchesObject(global.fetch.mock.calls[1][1].body, {reportID: '5555', reportActionID: '5678', reportComment: 'foo'});
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api?command=OpenReport', expect.anything());
            TestHelper.assertFormDataMatchesObject(global.fetch.mock.calls[0][1].body, {reportID: '1234'});
        });
    });
});
