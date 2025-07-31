import Onyx from 'react-native-onyx';
import HttpUtils from '@src/libs/HttpUtils';
import handleUnusedOptimisticID from '@src/libs/Middleware/HandleUnusedOptimisticID';
import * as MainQueue from '@src/libs/Network/MainQueue';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import * as Request from '@src/libs/Request';
import ONYXKEYS from '@src/ONYXKEYS';
import * as TestHelper from '../utils/TestHelper';
import type {MockAxios} from '../utils/TestHelper';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

jest.mock('axios');

Onyx.init({
    keys: ONYXKEYS,
});

let mockAxios: MockAxios;
beforeAll(() => {
    mockAxios = TestHelper.setupGlobalAxiosMock();
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

            TestHelper.expectAxiosCommandToHaveBeenCalled('OpenReport', 1);
            TestHelper.expectAxiosCommandToHaveBeenCalled('AddComment', 1);
            TestHelper.expectAxiosCommandToHaveBeenCalledWith('AddComment', 0, {
                reportID: '1234',
            });
            TestHelper.expectAxiosCommandToHaveBeenCalledWith('OpenReport', 0, {
                reportID: '1234',
            });
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

            mockAxios.mockAPICommand('OpenReport', () => ({
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
            }));

            SequentialQueue.unpause();
            await waitForNetworkPromises();

            TestHelper.expectAxiosCommandToHaveBeenCalled('OpenReport', 1);
            TestHelper.expectAxiosCommandToHaveBeenCalled('AddComment', 1);
            TestHelper.expectAxiosCommandToHaveBeenCalledWith('AddComment', 0, {
                reportID: '5555',
            });
            TestHelper.expectAxiosCommandToHaveBeenCalledWith('OpenReport', 0, {
                reportID: '1234',
            });
        });

        test('Request with preexistingReportID and no reportID in params', async () => {
            Request.use(handleUnusedOptimisticID);
            const requests = [
                {
                    command: 'RequestMoney',
                    data: {authToken: 'testToken'},
                },
                {
                    command: 'AddComment',
                    data: {authToken: 'testToken', reportID: '1234', reportActionID: '5678'},
                },
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: '2345', reportActionID: undefined, parentReportActionID: undefined},
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }

            mockAxios.mockAPICommand('RequestMoney', () => ({
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
            }));

            SequentialQueue.unpause();
            await waitForNetworkPromises();

            TestHelper.expectAxiosCommandToHaveBeenCalled('RequestMoney', 1);
            TestHelper.expectAxiosCommandToHaveBeenCalled('AddComment', 1);
            TestHelper.expectAxiosCommandToHaveBeenCalled('OpenReport', 1);
            TestHelper.expectAxiosCommandToHaveBeenCalledWith('AddComment', 0, {
                reportID: '5555',
            });

            // Verify that the third OpenReport call doesn't have reportActionID or parentReportActionID
            const openReportCalls = TestHelper.getAxiosMockCalls('OpenReport');
            expect(openReportCalls).toHaveLength(1);
            const openReportConfig = openReportCalls.at(0)?.[0];
            const requestData = (openReportConfig as {data?: FormData})?.data;
            if (requestData instanceof FormData) {
                const formDataObject = Object.fromEntries(requestData);
                expect(formDataObject.reportActionID).toBeUndefined();
                expect(formDataObject.parentReportActionID).toBeUndefined();
            }
        });
    });
});
