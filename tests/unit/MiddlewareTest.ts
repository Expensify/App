import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import SaveResponseInOnyx from '@libs/Middleware/SaveResponseInOnyx';
import HttpUtils from '@src/libs/HttpUtils';
import handleUnusedOptimisticID from '@src/libs/Middleware/HandleUnusedOptimisticID';
import * as MainQueue from '@src/libs/Network/MainQueue';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
// This import is needed to initialize the Onyx connections that call replaceOptimisticReportWithActualReport
import '@src/libs/PreexistingReportHandler';
import * as Request from '@src/libs/Request';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report as OnyxReport, PersonalDetailsList} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

type FormDataObject = {body: TestHelper.FormData};

Onyx.init({
    keys: ONYXKEYS,
});

beforeAll(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
});

beforeEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
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
            Request.addMiddleware(handleUnusedOptimisticID);
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
            Request.addMiddleware(handleUnusedOptimisticID);
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
                },
                ((global.fetch as jest.Mock).mock.calls.at(1) as FormDataObject[]).at(1)?.body,
            );
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api/OpenReport?', expect.anything());
            TestHelper.assertFormDataMatchesObject({reportID: '1234'}, ((global.fetch as jest.Mock).mock.calls.at(0) as FormDataObject[]).at(1)?.body);
        });

        test('Request with preexistingReportID and no reportID in params', async () => {
            Request.addMiddleware(handleUnusedOptimisticID);
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

            expect(global.fetch).toHaveBeenCalledTimes(3);
            expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api/OpenReport?', expect.anything());
            TestHelper.assertFormDataMatchesObject(
                {
                    reportID: '5555',
                },
                ((global.fetch as jest.Mock).mock.calls.at(1) as FormDataObject[]).at(1)?.body,
            );
            const formData = ((global.fetch as jest.Mock).mock.calls.at(2) as FormDataObject[]).at(1)?.body;
            expect(formData).not.toBeUndefined();
            if (formData) {
                const formDataObject = Array.from(formData.entries()).reduce(
                    (acc, [key, val]) => {
                        acc[key] = val;
                        return acc;
                    },
                    {} as Record<string, string | Blob | undefined>,
                );
                expect(formDataObject.reportActionID).toBeUndefined();
                expect(formDataObject.parentReportActionID).toBeUndefined();
            }
        });

        test('Request with preexistingReportID and optimisticReportID param', async () => {
            Request.addMiddleware(handleUnusedOptimisticID);
            const requests = [
                {
                    command: 'MoveIOUReportToExistingPolicy',
                    data: {authToken: 'testToken', optimisticReportID: '1234'},
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

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api/MoveIOUReportToExistingPolicy?', expect.anything());
            TestHelper.assertFormDataMatchesObject({optimisticReportID: '1234'} as unknown as OnyxReport, ((global.fetch as jest.Mock).mock.calls.at(0) as FormDataObject[]).at(1)?.body);
        });

        test('OpenReport to a chat with preexistingReportID and clean up optimistic participant data', async () => {
            const optimisticReportID = '1234';
            const preexistingReportID = '5555';
            const optimisticAccountID = 999;
            const preexistingAccountID = 333;
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}` as const]: {
                    reportID: optimisticReportID,
                    participants: {[optimisticAccountID]: {notificationPreference: 'always'}},
                },
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [optimisticAccountID]: {
                        accountID: optimisticAccountID,
                        isOptimisticPersonalDetail: true,
                    },
                },
            });

            Request.addMiddleware(handleUnusedOptimisticID);
            Request.addMiddleware(SaveResponseInOnyx);

            const requests = [
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: optimisticReportID, createdReportActionID: '5678'},
                },
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: preexistingReportID},
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }

            // eslint-disable-next-line @typescript-eslint/require-await
            (global.fetch as jest.Mock)
                .mockImplementationOnce(async () => ({
                    ok: true,
                    // eslint-disable-next-line @typescript-eslint/require-await
                    json: async () => ({
                        jsonCode: 200,
                        onyxData: [
                            {
                                onyxMethod: Onyx.METHOD.MERGE,
                                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                                value: {
                                    preexistingReportID,
                                },
                            },
                        ],
                    }),
                }))
                .mockImplementationOnce(async () => ({
                    ok: true,
                    // eslint-disable-next-line @typescript-eslint/require-await
                    json: async () => ({
                        jsonCode: 200,
                        onyxData: [
                            {
                                onyxMethod: Onyx.METHOD.MERGE,
                                key: `${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`,
                                value: {
                                    reportID: preexistingReportID,
                                    participants: {[preexistingAccountID]: {notificationPreference: 'always'}},
                                },
                            },
                            {
                                onyxMethod: Onyx.METHOD.MERGE,
                                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                                value: {
                                    [preexistingAccountID]: {
                                        accountID: preexistingAccountID,
                                    },
                                },
                            },
                        ],
                    }),
                }));

            SequentialQueue.unpause();
            await waitForBatchedUpdates();

            expect(global.fetch).toHaveBeenCalledTimes(2);

            const optimisticReportUpdated = await new Promise<OnyxEntry<OnyxReport>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });
            expect(optimisticReportUpdated?.participants?.[optimisticAccountID]).toBeUndefined();

            const preexistingReportUpdated = await new Promise<OnyxEntry<OnyxReport>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });
            expect(preexistingReportUpdated?.participants?.[optimisticAccountID]).toBeUndefined();
            expect(preexistingReportUpdated?.participants?.[preexistingAccountID]).not.toBeUndefined();

            const personalDetails = await new Promise<OnyxEntry<PersonalDetailsList>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    callback: (data) => {
                        Onyx.disconnect(connection);
                        resolve(data);
                    },
                });
            });
            expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
            expect(personalDetails?.[preexistingAccountID]).not.toBeUndefined();
        });

        test('OpenReport to a new chat without preexistingReportID and clean up optimistic participant data', async () => {
            const optimisticReportID = '1234';
            const optimisticAccountID = 999;
            const preexistingAccountID = 333;
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}` as const]: {
                    reportID: optimisticReportID,
                    participants: {[optimisticAccountID]: {notificationPreference: 'always'}},
                },
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [optimisticAccountID]: {
                        accountID: optimisticAccountID,
                        isOptimisticPersonalDetail: true,
                    },
                },
            });

            Request.addMiddleware(handleUnusedOptimisticID);
            Request.addMiddleware(SaveResponseInOnyx);

            const requests = [
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: optimisticReportID, createdReportActionID: '5678'},
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
                            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                            value: {
                                reportID: optimisticReportID,
                                participants: {[preexistingAccountID]: {notificationPreference: 'always'}},
                            },
                        },
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                [preexistingAccountID]: {
                                    accountID: preexistingAccountID,
                                },
                            },
                        },
                    ],
                }),
            }));

            SequentialQueue.unpause();
            await waitForBatchedUpdates();

            expect(global.fetch).toHaveBeenCalledTimes(1);

            const optimisticReportUpdated = await new Promise<OnyxEntry<OnyxReport>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });
            expect(optimisticReportUpdated?.participants?.[optimisticAccountID]).toBeUndefined();
            expect(optimisticReportUpdated?.participants?.[preexistingAccountID]).not.toBeUndefined();

            const personalDetails = await new Promise<OnyxEntry<PersonalDetailsList>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    callback: (data) => {
                        Onyx.disconnect(connection);
                        resolve(data);
                    },
                });
            });
            expect(personalDetails?.[optimisticAccountID]).toBeUndefined();
            expect(personalDetails?.[preexistingAccountID]).not.toBeUndefined();
        });
    });
});
