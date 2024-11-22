import Onyx from 'react-native-onyx';
import HttpUtils from '@src/libs/HttpUtils';
import handleUnusedOptimisticID from '@src/libs/Middleware/HandleUnusedOptimisticID';
import * as MainQueue from '@src/libs/Network/MainQueue';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import * as Request from '@src/libs/Request';
import ONYXKEYS from '@src/ONYXKEYS';
import * as TestHelper from '../utils/TestHelper';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

type FormDataObject = {body: TestHelper.FormData};

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
            Request.use(handleUnusedOptimisticID);
            const requests = [
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: '1234'},
                },
                {
                    command: 'AddComment',
                    data: {authToken: 'testToken', reportID: '1234', reportActionID: '5678'},
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }
            SequentialQueue.unpause();
            await waitForNetworkPromises();

            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api/AddComment?', expect.anything());
            TestHelper.assertFormDataMatchesObject(
                {
                    reportID: '1234',
                    reportActionID: '5678',
                },
                ((global.fetch as jest.Mock).mock.calls.at(1) as FormDataObject[]).at(1)?.body,
            );
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api/OpenReport?', expect.anything());
            TestHelper.assertFormDataMatchesObject(
                {
                    reportID: '1234',
                },
                ((global.fetch as jest.Mock).mock.calls.at(0) as FormDataObject[]).at(1)?.body,
            );
        });

        test('Request with preexistingReportID', async () => {
            Request.use(handleUnusedOptimisticID);
            const requests = [
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: '1234'},
                },
                {
                    command: 'AddComment',
                    data: {authToken: 'testToken', reportID: '1234', reportActionID: '5678'},
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }

            // eslint-disable-next-line @typescript-eslint/require-await
            (global.fetch as jest.Mock).mockImplementationOnce(async () => ({
                ok: true,
                // eslint-disable-next-line @typescript-eslint/require-await
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
            expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api/AddComment?', expect.anything());
            TestHelper.assertFormDataMatchesObject(
                {
                    reportID: '5555',
                    reportActionID: '5678',
                },
                ((global.fetch as jest.Mock).mock.calls.at(1) as FormDataObject[]).at(1)?.body,
            );
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api/OpenReport?', expect.anything());
            TestHelper.assertFormDataMatchesObject({reportID: '1234'}, ((global.fetch as jest.Mock).mock.calls.at(0) as FormDataObject[]).at(1)?.body);
        });
    });
});
