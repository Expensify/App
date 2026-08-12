import {READ_COMMANDS} from '@libs/API/types';
import SaveResponseInOnyx from '@libs/Middleware/SaveResponseInOnyx';

import CONST from '@src/CONST';
import * as PersistedRequests from '@src/libs/actions/PersistedRequests';
import type MoveIOUReportToExistingPolicyParams from '@src/libs/API/parameters/MoveIOUReportToExistingPolicyParams';
import HttpUtils from '@src/libs/HttpUtils';
// This import is needed to initialize the Onyx connections that call replaceOptimisticReportWithActualReport
import '@src/libs/actions/replaceOptimisticReportWithActualReport';
import handleUnusedOptimisticID from '@src/libs/Middleware/HandleUnusedOptimisticID';
import * as Network from '@src/libs/Network';
import * as MainQueue from '@src/libs/Network/MainQueue';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import * as Request from '@src/libs/Request';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report as OnyxReport, PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

let fetchMock: ReturnType<typeof TestHelper.createGlobalFetchMock>;

Onyx.init({
    keys: ONYXKEYS,
});

beforeEach(async () => {
    // Network arms a module-level setInterval(processMainQueue) once ActiveClientManager is
    // ready. Left running, it re-fires non-cancellable MainQueue requests (e.g. Log) into the
    // next test — inflating global.fetch call counts — and is itself the open handle behind the
    // "worker process failed to exit gracefully" leak. Clear it the same way NetworkTest does.
    Network.clearProcessQueueInterval();
    await Onyx.clear();
    await waitForBatchedUpdates();
    // Explicitly reset PersistedRequests module state (knownRequestIDs, ongoingRequest,
    // pendingSaveOperations) which Onyx.clear() alone does not fully reset.
    await PersistedRequests.clear();
    await waitForBatchedUpdates();
    SequentialQueue.resetQueue();
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    NetworkStore.checkRequiredData();
    await waitForNetworkPromises();
    // Reassign global.fetch to a fresh mock to clear any leftover mockImplementationOnce
    // queue from the previous test. jest.clearAllMocks() only resets call counts, not the queue.
    fetchMock = TestHelper.createGlobalFetchMock();
    global.fetch = fetchMock;
    jest.clearAllMocks();
    Request.clearMiddlewares();
});

describe('Middleware', () => {
    describe('SaveResponseInOnyx', () => {
        test('preserves the response for side-effect requests when the update is already applied', async () => {
            // Given the client already has a lastUpdateID applied
            await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 100);
            await waitForBatchedUpdates();

            Request.addMiddleware(SaveResponseInOnyx);

            const mockResponse = {
                jsonCode: 200,
                lastUpdateID: 100,
                previousUpdateID: 99,
                transactionsPending3DSReview: {
                    // an ID map key is not a name!
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    1234: {amount: 500, currency: 'USD', created: '2026-02-23', expires: '2026-02-24', lastFourPAN: '1234', merchant: 'TestMerchant', transactionID: '1234'},
                },
            };
            jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce(mockResponse);

            // When we process a side-effect request with no successData/failureData/finallyData
            const result = await Request.processWithMiddleware({
                command: 'GetTransactionsPending3DSReview',
                data: {apiRequestType: 'makeRequestWithSideEffects'},
                requestIndex: 1,
            });

            // Then the response should not be undefined — the caller may need the raw response for side effects
            expect(result).toBeDefined();
            expect(result?.jsonCode).toBe(200);
        });

        test.each([
            ['the client watermark is behind the response', 1],
            ['the client has no watermark yet', undefined],
        ])('applies a sign-in response on arrival when %s', async (_case, clientLastUpdateID) => {
            if (clientLastUpdateID) {
                await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, clientLastUpdateID);
            }
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN, true);
            await waitForBatchedUpdates();

            Request.addMiddleware(SaveResponseInOnyx);
            jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({jsonCode: 200, lastUpdateID: 501, previousUpdateID: 500});

            await Request.processWithMiddleware({
                command: READ_COMMANDS.SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN,
                data: {apiRequestType: CONST.API_REQUEST_TYPE.READ},
                finallyData: [
                    {
                        onyxMethod: Onyx.METHOD.SET,
                        key: ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN,
                        value: false,
                    },
                ],
            });
            await waitForBatchedUpdates();

            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN)).toBe(false);
            expect(await getOnyxValue(ONYXKEYS.ONYX_UPDATES_FROM_SERVER)).toBeUndefined();
            expect(await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT)).toBe(clientLastUpdateID);
        });
    });

    describe('HandleUnusedOptimisticID', () => {
        test('Normal request', async () => {
            Request.addMiddleware(handleUnusedOptimisticID);
            const requests = [
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: '1234'},
                    requestIndex: 2,
                },
                {
                    command: 'AddComment',
                    data: {authToken: 'testToken', reportID: '1234', reportActionID: '5678'},
                    requestIndex: 3,
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api/AddComment?', expect.anything());
            const addCommentFormData = fetchMock.mock.calls.at(1)?.[1]?.body;
            if (!(addCommentFormData instanceof FormData)) {
                throw new Error('Expected AddComment request body to be native FormData.');
            }
            TestHelper.assertFormDataMatchesObject(createMock<OnyxReport>({reportID: '1234'}), {entries: () => Array.from(addCommentFormData.entries())});
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api/OpenReport?', expect.anything());
            const openReportFormData = fetchMock.mock.calls.at(0)?.[1]?.body;
            if (!(openReportFormData instanceof FormData)) {
                throw new Error('Expected OpenReport request body to be native FormData.');
            }
            TestHelper.assertFormDataMatchesObject(createMock<OnyxReport>({reportID: '1234'}), {entries: () => Array.from(openReportFormData.entries())});
        });

        test('Request with preexistingReportID', async () => {
            Request.addMiddleware(handleUnusedOptimisticID);
            const requests = [
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: '1234'},
                    requestIndex: 4,
                },
                {
                    command: 'AddComment',
                    data: {authToken: 'testToken', reportID: '1234', reportActionID: '5678'},
                    requestIndex: 5,
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }

            fetchMock.mockAPICommand('OpenReport', () => ({
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
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api/AddComment?', expect.anything());
            const addCommentFormData = fetchMock.mock.calls.at(1)?.[1]?.body;
            if (!(addCommentFormData instanceof FormData)) {
                throw new Error('Expected AddComment request body to be native FormData.');
            }
            TestHelper.assertFormDataMatchesObject(createMock<OnyxReport>({reportID: '5555'}), {entries: () => Array.from(addCommentFormData.entries())});
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api/OpenReport?', expect.anything());
            const openReportFormData = fetchMock.mock.calls.at(0)?.[1]?.body;
            if (!(openReportFormData instanceof FormData)) {
                throw new Error('Expected OpenReport request body to be native FormData.');
            }
            TestHelper.assertFormDataMatchesObject(createMock<OnyxReport>({reportID: '1234'}), {entries: () => Array.from(openReportFormData.entries())});
        });

        test('Request with preexistingReportID and no reportID in params', async () => {
            Request.addMiddleware(handleUnusedOptimisticID);
            const requests = [
                {
                    command: 'RequestMoney',
                    data: {authToken: 'testToken'},
                    requestIndex: 6,
                },
                {
                    command: 'AddComment',
                    data: {authToken: 'testToken', reportID: '1234', reportActionID: '5678'},
                    requestIndex: 7,
                },
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: '2345', reportActionID: undefined, parentReportActionID: undefined},
                    requestIndex: 8,
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }

            fetchMock.mockAPICommand('RequestMoney', () => ({
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
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            expect(global.fetch).toHaveBeenCalledTimes(3);
            expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api/OpenReport?', expect.anything());
            const openReportFormData = fetchMock.mock.calls.at(1)?.[1]?.body;
            if (!(openReportFormData instanceof FormData)) {
                throw new Error('Expected OpenReport request body to be native FormData.');
            }
            TestHelper.assertFormDataMatchesObject(createMock<OnyxReport>({reportID: '5555'}), {entries: () => Array.from(openReportFormData.entries())});
            const rawFormData = fetchMock.mock.calls.at(2)?.[1]?.body;
            expect(rawFormData).not.toBeUndefined();
            if (!(rawFormData instanceof FormData)) {
                throw new Error('Expected the third request body to be native FormData.');
            }
            expect(rawFormData.get('reportActionID')).toBeNull();
            expect(rawFormData.get('parentReportActionID')).toBeNull();
        });

        test('Request with preexistingReportID and optimisticReportID param', async () => {
            Request.addMiddleware(handleUnusedOptimisticID);
            const requests = [
                {
                    command: 'MoveIOUReportToExistingPolicy',
                    data: {authToken: 'testToken', optimisticReportID: '1234'},
                    requestIndex: 9,
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }

            fetchMock.mockAPICommand('MoveIOUReportToExistingPolicy', () => ({
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
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api/MoveIOUReportToExistingPolicy?', expect.anything());
            const moveReportFormData = fetchMock.mock.calls.at(0)?.[1]?.body;
            if (!(moveReportFormData instanceof FormData)) {
                throw new Error('Expected MoveIOUReportToExistingPolicy request body to be native FormData.');
            }
            const expectedMoveReportParams = {optimisticReportID: '1234'} satisfies Pick<MoveIOUReportToExistingPolicyParams, 'optimisticReportID'>;
            expect(moveReportFormData.get('optimisticReportID')).toBe(expectedMoveReportParams.optimisticReportID);
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
                    requestIndex: 10,
                },
                {
                    command: 'OpenReport',
                    data: {authToken: 'testToken', reportID: preexistingReportID},
                    requestIndex: 11,
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }

            fetchMock.mockAPICommand('OpenReport', ({reportID}) => {
                if (reportID === optimisticReportID) {
                    return {
                        onyxData: [
                            {
                                onyxMethod: Onyx.METHOD.MERGE,
                                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                                value: {
                                    preexistingReportID,
                                },
                            },
                        ],
                    };
                }

                return {
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
                };
            });

            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
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
                    requestIndex: 12,
                },
            ];
            for (const request of requests) {
                SequentialQueue.push(request);
            }

            fetchMock.mockAPICommand('OpenReport', () => ({
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
            }));

            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
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

        test('OpenReport restores the invited login when the settled participant arrives without one', async () => {
            const optimisticReportID = '1234';
            const optimisticAccountID = 999;
            const settledAccountID = 333;
            const invitedEmail = 'invited@example.com';
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}` as const]: {
                    reportID: optimisticReportID,
                    participants: {[optimisticAccountID]: {notificationPreference: 'always'}},
                },
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [optimisticAccountID]: {
                        accountID: optimisticAccountID,
                        login: invitedEmail,
                        isOptimisticPersonalDetail: true,
                    },
                },
            });

            Request.addMiddleware(handleUnusedOptimisticID);
            Request.addMiddleware(SaveResponseInOnyx);

            SequentialQueue.push({
                command: 'OpenReport',
                data: {authToken: 'testToken', reportID: optimisticReportID, createdReportActionID: '5678', emailList: invitedEmail},
                requestIndex: 13,
            });

            jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({
                jsonCode: 200,
                onyxData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                        value: {
                            reportID: optimisticReportID,
                            participants: {[settledAccountID]: {notificationPreference: 'always'}},
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {
                            [settledAccountID]: {
                                accountID: settledAccountID,
                            },
                        },
                    },
                ],
            });

            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

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
            expect(personalDetails?.[settledAccountID]?.login).toBe(invitedEmail);
        });

        test('OpenReport does not restore the invited login when the settled participant already has one', async () => {
            const optimisticReportID = '1234';
            const optimisticAccountID = 999;
            const settledAccountID = 333;
            const serverLogin = 'server@example.com';
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}` as const]: {
                    reportID: optimisticReportID,
                    participants: {[optimisticAccountID]: {notificationPreference: 'always'}},
                },
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [optimisticAccountID]: {
                        accountID: optimisticAccountID,
                        login: 'invited@example.com',
                        isOptimisticPersonalDetail: true,
                    },
                },
            });

            Request.addMiddleware(handleUnusedOptimisticID);
            Request.addMiddleware(SaveResponseInOnyx);

            SequentialQueue.push({
                command: 'OpenReport',
                data: {authToken: 'testToken', reportID: optimisticReportID, createdReportActionID: '5678', emailList: 'invited@example.com'},
                requestIndex: 14,
            });

            jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({
                jsonCode: 200,
                onyxData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                        value: {
                            reportID: optimisticReportID,
                            participants: {[settledAccountID]: {notificationPreference: 'always'}},
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {
                            [settledAccountID]: {
                                accountID: settledAccountID,
                                login: serverLogin,
                            },
                        },
                    },
                ],
            });

            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

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
            expect(personalDetails?.[settledAccountID]?.login).toBe(serverLogin);
        });

        test('OpenReport does not restore the invited login when the response sets an explicitly empty one', async () => {
            const optimisticReportID = '1234';
            const optimisticAccountID = 999;
            const settledAccountID = 333;
            const invitedEmail = 'invited@example.com';
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}` as const]: {
                    reportID: optimisticReportID,
                    participants: {[optimisticAccountID]: {notificationPreference: 'always'}},
                },
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [optimisticAccountID]: {
                        accountID: optimisticAccountID,
                        login: invitedEmail,
                        isOptimisticPersonalDetail: true,
                    },
                },
            });

            Request.addMiddleware(handleUnusedOptimisticID);
            Request.addMiddleware(SaveResponseInOnyx);

            SequentialQueue.push({
                command: 'OpenReport',
                data: {authToken: 'testToken', reportID: optimisticReportID, createdReportActionID: '5678', emailList: invitedEmail},
                requestIndex: 18,
            });

            jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({
                jsonCode: 200,
                onyxData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                        value: {
                            reportID: optimisticReportID,
                            participants: {[settledAccountID]: {notificationPreference: 'always'}},
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {
                            [settledAccountID]: {
                                accountID: settledAccountID,
                                login: '',
                            },
                        },
                    },
                ],
            });

            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

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
            expect(personalDetails?.[settledAccountID]?.login).toBe('');
        });

        test('OpenReport restores the invited login when the participant is already known without a login key', async () => {
            const optimisticReportID = '1234';
            const knownAccountID = 333;
            const invitedEmail = 'invited@example.com';
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}` as const]: {
                    reportID: optimisticReportID,
                    participants: {[knownAccountID]: {notificationPreference: 'always'}},
                },
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [knownAccountID]: {
                        accountID: knownAccountID,
                    },
                },
            });

            Request.addMiddleware(handleUnusedOptimisticID);
            Request.addMiddleware(SaveResponseInOnyx);

            SequentialQueue.push({
                command: 'OpenReport',
                data: {authToken: 'testToken', reportID: optimisticReportID, createdReportActionID: '5678', emailList: invitedEmail},
                requestIndex: 15,
            });

            jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({
                jsonCode: 200,
                onyxData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                        value: {
                            reportID: optimisticReportID,
                            participants: {[knownAccountID]: {notificationPreference: 'always'}},
                        },
                    },
                ],
            });

            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            const personalDetails = await new Promise<OnyxEntry<PersonalDetailsList>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    callback: (data) => {
                        Onyx.disconnect(connection);
                        resolve(data);
                    },
                });
            });
            expect(personalDetails?.[knownAccountID]?.login).toBe(invitedEmail);
        });

        test('OpenReport does not restore the invited login when the participant is already known with an explicitly empty one', async () => {
            const optimisticReportID = '1234';
            const knownAccountID = 333;
            const invitedEmail = 'invited@example.com';
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}` as const]: {
                    reportID: optimisticReportID,
                    participants: {[knownAccountID]: {notificationPreference: 'always'}},
                },
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [knownAccountID]: {
                        accountID: knownAccountID,
                        login: '',
                        displayName: '',
                    },
                },
            });

            Request.addMiddleware(handleUnusedOptimisticID);
            Request.addMiddleware(SaveResponseInOnyx);

            SequentialQueue.push({
                command: 'OpenReport',
                data: {authToken: 'testToken', reportID: optimisticReportID, createdReportActionID: '5678', emailList: invitedEmail},
                requestIndex: 16,
            });

            jest.spyOn(HttpUtils, 'xhr').mockResolvedValueOnce({
                jsonCode: 200,
                onyxData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                        value: {
                            reportID: optimisticReportID,
                            participants: {[knownAccountID]: {notificationPreference: 'always'}},
                        },
                    },
                ],
            });

            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            const personalDetails = await new Promise<OnyxEntry<PersonalDetailsList>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    callback: (data) => {
                        Onyx.disconnect(connection);
                        resolve(data);
                    },
                });
            });
            expect(personalDetails?.[knownAccountID]?.login).toBe('');
        });
    });
});
