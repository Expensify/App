import {act, renderHook, waitFor} from '@testing-library/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import useOnyx from '@hooks/useOnyx';
import {changeTransactionsReport, markAsCash} from '@libs/actions/Transaction';
import DateUtils from '@libs/DateUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {rand64} from '@libs/NumberUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {ReportAction, ReportActions, Transaction} from '../../src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function generateTransaction(values: Partial<Transaction> = {}): Transaction {
    const reportID = '1';
    const amount = 100;
    const currency = 'USD';
    const comment = '';
    const attendees: Attendee[] = [];
    const created = '2023-10-01';
    const baseValues = TransactionUtils.buildOptimisticTransaction({
        transactionParams: {
            amount,
            currency,
            reportID,
            comment,
            attendees,
            created,
        },
    });

    return {...baseValues, ...values};
}

const CURRENT_USER_ID = 1;
const FAKE_NEW_REPORT_ID = '2';
const FAKE_OLD_REPORT_ID = '3';
const FAKE_SELF_DM_REPORT_ID = '4';

const newReport = {
    reportID: FAKE_NEW_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
};
const selfDM = {
    reportID: FAKE_SELF_DM_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
};

const reportCollectionDataSet: ReportCollectionDataSet = {
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`]: newReport,
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_SELF_DM_REPORT_ID}`]: selfDM,
};

describe('Transaction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ID},
                ...reportCollectionDataSet,
            },
        });
    });

    let mockFetch: TestHelper.MockFetch;
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = global.fetch as TestHelper.MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('changeTransactionsReport', () => {
        it('correctly moves the IOU report action when an unreported transaction is added to an expense report', async () => {
            const transaction = generateTransaction({
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: '0',
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_SELF_DM_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com');
            await waitForBatchedUpdates();
            const reportActions = await new Promise<OnyxEntry<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_NEW_REPORT_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(getIOUActionForTransactionID(Object.values(reportActions ?? {}), transaction.transactionID)).toBeDefined();
        });

        it('correctly moves the IOU report action when a transaction is moved from one expense report to another', async () => {
            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com');
            await waitForBatchedUpdates();
            const reportActions = await new Promise<OnyxEntry<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_NEW_REPORT_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(getIOUActionForTransactionID(Object.values(reportActions ?? {}), transaction.transactionID)).toBeDefined();
        });

        it('correctly handles reportNextStep parameter when moving transactions between reports', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };

            const mockReportNextStep = {
                type: 'neutral' as const,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [
                    {
                        text: 'Test next step message',
                    },
                ],
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com', undefined, mockReportNextStep);
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const failureData = (apiWriteCall?.[2] as {failureData?: Array<{key: string; value: unknown}>})?.failureData;

            const nextStepFailureData = failureData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${FAKE_NEW_REPORT_ID}`);

            expect(nextStepFailureData).toBeDefined();
            expect(nextStepFailureData?.value).toEqual(mockReportNextStep);

            mockAPIWrite.mockRestore();
        });

        it('correctly handles reportNextStep parameter when moving transactions to unreported report', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };

            const mockReportNextStep = {
                type: 'alert' as const,
                icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
                message: [
                    {
                        text: 'Alert next step message',
                    },
                ],
                requiresUserAction: true,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            changeTransactionsReport([transaction.transactionID], CONST.REPORT.UNREPORTED_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com', undefined, mockReportNextStep);
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const failureData = (apiWriteCall?.[2] as {failureData?: Array<{key: string; value: unknown}>})?.failureData;

            const nextStepFailureData = failureData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${CONST.REPORT.UNREPORTED_REPORT_ID}`);

            expect(nextStepFailureData).toBeDefined();
            expect(nextStepFailureData?.value).toEqual(mockReportNextStep);

            mockAPIWrite.mockRestore();
        });

        it('correctly handles undefined reportNextStep parameter', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com', undefined, undefined);
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const failureData = (apiWriteCall?.[2] as {failureData?: Array<{key: string; value: unknown}>})?.failureData;

            const nextStepFailureData = failureData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${FAKE_NEW_REPORT_ID}`);

            expect(nextStepFailureData).toBeDefined();
            expect(nextStepFailureData?.value).toBeUndefined();

            mockAPIWrite.mockRestore();
        });

        it('correctly handles ASAP submit beta enabled when moving transactions', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, true, CURRENT_USER_ID, 'test@example.com');
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const parameters = apiWriteCall?.[1] as {reportID: string; transactionList: string; transactionIDToReportActionAndThreadData: string};

            expect(parameters).toBeDefined();
            expect(parameters.reportID).toBe(FAKE_NEW_REPORT_ID);
            expect(parameters.transactionList).toBe(transaction.transactionID);

            mockAPIWrite.mockRestore();
        });

        it('correctly handles different account IDs and emails when moving transactions', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const customAccountID = 999;
            const customEmail = 'custom@example.com';

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, customAccountID, customEmail);
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const parameters = apiWriteCall?.[1] as {reportID: string; transactionList: string; transactionIDToReportActionAndThreadData: string};

            expect(parameters).toBeDefined();
            expect(parameters.reportID).toBe(FAKE_NEW_REPORT_ID);
            expect(parameters.transactionList).toBe(transaction.transactionID);

            mockAPIWrite.mockRestore();
        });
    });

    describe('getAllNonDeletedTransactions', () => {
        it('returns the transaction when it has a pending delete action and is offline', () => {
            const transaction = generateTransaction({
                reportID: '1',
            });
            const IOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
            const result = getAllNonDeletedTransactions({[transaction.transactionID]: transaction}, [IOUAction], true);
            expect(result.at(0)).toEqual(transaction);
        });
    });

    describe('markAsCash', () => {
        it('should optimistically remove RTER violation and add dismissed violation report action', async () => {
            // Given a transaction with an RTER violation
            const transactionID = 'transaction123';
            const transactionThreadReportID = 'threadReport456';
            const mockViolations: TransactionViolation[] = [
                {name: CONST.VIOLATIONS.RTER, type: 'warning'},
                {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'},
            ];

            mockFetch.pause();

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, mockViolations);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {});

            // When markAsCash is called
            markAsCash(transactionID, transactionThreadReportID, mockViolations);
            await waitForBatchedUpdates();

            // Then the RTER violation should be removed optimistically
            const optimisticViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);

            expect(optimisticViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'}]);

            // And a dismissed violation report action should be added
            const reportActions = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`);

            const reportActionValues = Object.values(reportActions ?? {});
            expect(reportActionValues.length).toBe(1);
            expect(reportActionValues.at(0)?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION);

            // After API call succeeds, the optimistic updates should persist
            await mockFetch.resume();
            await waitForBatchedUpdates();

            const finalViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(finalViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'}]);

            const finalReportActions = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`);
            const finalReportActionValues = Object.values(finalReportActions ?? {});
            expect(finalReportActionValues.length).toBe(1);
            expect(finalReportActionValues.at(0)?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION);
        });

        it('should restore RTER violation and remove report action when API fails', async () => {
            // Given a transaction with an RTER violation
            const transactionID = 'transaction123';
            const transactionThreadReportID = 'threadReport456';
            const mockViolations: TransactionViolation[] = [{name: CONST.VIOLATIONS.RTER, type: 'warning'}];

            mockFetch.pause();

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, mockViolations);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {});

            mockFetch.fail();

            // When markAsCash is called and API fails
            markAsCash(transactionID, transactionThreadReportID, mockViolations);
            await waitForBatchedUpdates();

            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the RTER violation should be restored to original state
            const failureViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);

            expect(failureViolations).toEqual(mockViolations);

            // And the dismissed violation report action should be removed
            const reportActions = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`);

            expect(Object.keys(reportActions ?? {}).length).toBe(0);
        });

        it('should handle empty transaction violations array', async () => {
            // Given a transaction with no violations
            const transactionID = 'transaction123';
            const transactionThreadReportID = 'threadReport456';
            const mockViolations: TransactionViolation[] = [];

            mockFetch.pause();

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, mockViolations);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {});

            // When markAsCash is called with empty violations array
            markAsCash(transactionID, transactionThreadReportID, mockViolations);
            await waitForBatchedUpdates();

            // Then the violations should remain empty after filtering out RTER
            const optimisticViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);

            expect(optimisticViolations).toEqual([]);

            await mockFetch.resume();
        });

        it('should work with data from useOnyx hook', async () => {
            // Given a transaction with an RTER violation loaded via useOnyx
            const transactionID = 'transaction123';
            const transactionThreadReportID = 'threadReport456';
            const mockViolations: TransactionViolation[] = [
                {name: CONST.VIOLATIONS.RTER, type: 'warning'},
                {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'},
            ];

            mockFetch.pause();

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, mockViolations);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {});

            const {result} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`));

            await waitFor(() => {
                expect(result.current[0]).toBeDefined();
            });

            // When markAsCash is called with data from useOnyx hook
            await act(async () => {
                markAsCash(transactionID, transactionThreadReportID, result.current[0] ?? []);
                await waitForBatchedUpdates();
            });

            // Then the RTER violation should be removed optimistically
            await waitFor(() => {
                expect(result.current[0]).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'}]);
            });

            // And a dismissed violation report action should be added
            const reportActions = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`);

            const reportActionValues = Object.values(reportActions ?? {});
            expect(reportActionValues.length).toBe(1);
            expect(reportActionValues.at(0)?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION);

            await mockFetch.resume();
        });
    });
});
