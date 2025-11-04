import {act, renderHook, waitFor} from '@testing-library/react-native';
import {getUnixTime} from 'date-fns';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import useOnyx from '@hooks/useOnyx';
import {changeTransactionsReport, dismissDuplicateTransactionViolation, saveWaypoint} from '@libs/actions/Transaction';
import DateUtils from '@libs/DateUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, Transaction as TransactionType, TransactionViolation} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {RecentWaypoint, ReportAction, ReportActions, Transaction} from '../../src/types/onyx';
import type ReportNextStep from '../../src/types/onyx/ReportNextStep';
import {createExpenseReportForTest, createIOUReportActionForTest, createSelfDMReportForTest} from '../utils/ReportTestUtils';
import createRandomPolicy from '../utils/collections/policies';
import {createExpenseReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
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

const baseNewReport = createExpenseReportForTest(FAKE_NEW_REPORT_ID, {
    ownerAccountID: CURRENT_USER_ID,
});
const baseSelfDMReport = createSelfDMReportForTest(FAKE_SELF_DM_REPORT_ID, CURRENT_USER_ID);

const reportCollectionDataSet: ReportCollectionDataSet = {
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`]: baseNewReport,
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_SELF_DM_REPORT_ID}`]: baseSelfDMReport,
};

const emptyNextStepsCollection = {} as OnyxCollection<ReportNextStep>;

const getReportFromUseOnyx = async (reportID: string) => {
    const {result} = renderHook(() => {
        const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
        return {report};
    });
    return result.current.report;
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
            const oldIOUAction = createIOUReportActionForTest({
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                actorAccountID: CURRENT_USER_ID,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_SELF_DM_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, undefined, undefined, emptyNextStepsCollection);
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
            const oldIOUAction = createIOUReportActionForTest({
                reportID: FAKE_OLD_REPORT_ID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                actorAccountID: CURRENT_USER_ID,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, undefined, undefined, emptyNextStepsCollection);
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
            const oldIOUAction = createIOUReportActionForTest({
                reportID: FAKE_OLD_REPORT_ID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                actorAccountID: CURRENT_USER_ID,
            });

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

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, mockReportNextStep, undefined, emptyNextStepsCollection);
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

            const oldReport = createExpenseReportForTest(FAKE_OLD_REPORT_ID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 100,
            });

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUReportActionForTest({
                reportID: FAKE_OLD_REPORT_ID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                actorAccountID: CURRENT_USER_ID,
            });

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

            // Create a dummy unreported report so the new logic can find it
            const unreportedReport = createExpenseReportForTest(CONST.REPORT.UNREPORTED_REPORT_ID, {
                ownerAccountID: CURRENT_USER_ID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`, oldReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CONST.REPORT.UNREPORTED_REPORT_ID}`, unreportedReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await waitForBatchedUpdates();

            const report = await getReportFromUseOnyx(CONST.REPORT.UNREPORTED_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, mockReportNextStep, undefined, emptyNextStepsCollection);
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

            const oldReport = createExpenseReportForTest(FAKE_OLD_REPORT_ID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 100,
            });

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUReportActionForTest({
                reportID: FAKE_OLD_REPORT_ID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                actorAccountID: CURRENT_USER_ID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`, oldReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, {...baseNewReport});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, undefined, undefined, emptyNextStepsCollection);
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const failureData = (apiWriteCall?.[2] as {failureData?: Array<{key: string; value: unknown}>})?.failureData;

            const nextStepFailureData = failureData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${FAKE_NEW_REPORT_ID}`);

            expect(nextStepFailureData).toBeDefined();
            expect(nextStepFailureData?.value).toBeNull();

            mockAPIWrite.mockRestore();
        });

        it('correctly handles ASAP submit beta enabled when moving transactions', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const oldReport = createExpenseReportForTest(FAKE_OLD_REPORT_ID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 100,
            });

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUReportActionForTest({
                reportID: FAKE_OLD_REPORT_ID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                actorAccountID: CURRENT_USER_ID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`, oldReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, {...baseNewReport});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], true, CURRENT_USER_ID, 'test@example.com', report, undefined, undefined, undefined, emptyNextStepsCollection);
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

            const oldReport = createExpenseReportForTest(FAKE_OLD_REPORT_ID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 100,
            });

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUReportActionForTest({
                reportID: FAKE_OLD_REPORT_ID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                actorAccountID: CURRENT_USER_ID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`, oldReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, {...baseNewReport});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await waitForBatchedUpdates();

            const customAccountID = 999;
            const customEmail = 'custom@example.com';
            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, customAccountID, customEmail, report, undefined, undefined, undefined, emptyNextStepsCollection);
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
            const IOUAction = {
                ...createIOUReportActionForTest({
                    reportID: FAKE_OLD_REPORT_ID,
                    transactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    actorAccountID: CURRENT_USER_ID,
                }),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            } satisfies ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
            const result = getAllNonDeletedTransactions({[transaction.transactionID]: transaction}, [IOUAction], true);
            expect(result.at(0)).toEqual(transaction);
        });
    });

    describe('changeTransactionsReport - Next Step Updates', () => {
        it('should update next step message when removing last expense from report', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const oldReportID = '100';
            const oldReport = createExpenseReportForTest(oldReportID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 100,
            });

            const transaction = generateTransaction({
                reportID: oldReportID,
                amount: 100,
            });

            const oldIOUAction = createIOUReportActionForTest({
                reportID: oldReportID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                actorAccountID: CURRENT_USER_ID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${oldReportID}`, oldReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, {...baseNewReport});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldReportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await waitForBatchedUpdates();

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, undefined, undefined, emptyNextStepsCollection);
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const optimisticData = (apiWriteCall?.[2] as {optimisticData?: Array<{key: string; value: unknown}>})?.optimisticData;

            // Verify next step is updated for old report (source)
            const oldReportNextStep = optimisticData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${oldReportID}`);
            expect(oldReportNextStep).toBeDefined();

            // Verify next step is updated for new report (destination)
            const newReportNextStep = optimisticData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${FAKE_NEW_REPORT_ID}`);
            expect(newReportNextStep).toBeDefined();

            mockAPIWrite.mockRestore();
        });

        it('should maintain submit message when removing expense from multi-expense report', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const oldReportID = '101';
            const oldReport = createExpenseReportForTest(oldReportID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 300,
            });

            const transaction1 = generateTransaction({
                reportID: oldReportID,
                amount: 100,
            });

            const transaction2 = generateTransaction({
                reportID: oldReportID,
                amount: 200,
            });

            const oldIOUAction1 = createIOUReportActionForTest({
                reportID: oldReportID,
                transactionID: transaction1.transactionID,
                amount: transaction1.amount,
                currency: transaction1.currency,
                actorAccountID: CURRENT_USER_ID,
            });

            const oldIOUAction2 = createIOUReportActionForTest({
                reportID: oldReportID,
                transactionID: transaction2.transactionID,
                amount: transaction2.amount,
                currency: transaction2.currency,
                actorAccountID: CURRENT_USER_ID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${oldReportID}`, oldReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, {...baseNewReport});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`, transaction2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldReportID}`, {
                [oldIOUAction1.reportActionID]: oldIOUAction1,
                [oldIOUAction2.reportActionID]: oldIOUAction2,
            });
            await waitForBatchedUpdates();

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            // Move only one transaction, leaving the other in the old report
            changeTransactionsReport([transaction1.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, undefined, undefined, emptyNextStepsCollection);
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const optimisticData = (apiWriteCall?.[2] as {optimisticData?: Array<{key: string; value: unknown}>})?.optimisticData;

            // Verify next step is still present for old report (should still have submit message)
            const oldReportNextStep = optimisticData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${oldReportID}`);
            expect(oldReportNextStep).toBeDefined();

            // Verify next step is updated for new report
            const newReportNextStep = optimisticData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${FAKE_NEW_REPORT_ID}`);
            expect(newReportNextStep).toBeDefined();

            mockAPIWrite.mockRestore();
        });

        it('should update next steps for both source and destination reports', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const sourceReportID = '102';
            const destinationReportID = '103';

            const sourceReport = createExpenseReportForTest(sourceReportID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 150,
            });

            const destinationReport = createExpenseReportForTest(destinationReportID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 250,
            });

            const transaction = generateTransaction({
                reportID: sourceReportID,
                amount: 150,
            });

            const oldIOUAction = createIOUReportActionForTest({
                reportID: sourceReportID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                actorAccountID: CURRENT_USER_ID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${sourceReportID}`, sourceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${destinationReportID}`, destinationReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sourceReportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await waitForBatchedUpdates();

            const report = await getReportFromUseOnyx(destinationReportID);
            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, undefined, undefined, emptyNextStepsCollection);
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const optimisticData = (apiWriteCall?.[2] as {optimisticData?: Array<{key: string; value: unknown}>})?.optimisticData;

            // Verify next step is updated for source report
            const sourceReportNextStep = optimisticData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${sourceReportID}`);
            expect(sourceReportNextStep).toBeDefined();
            expect(sourceReportNextStep?.value).toBeDefined();

            // Verify next step is updated for destination report
            const destinationReportNextStep = optimisticData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${destinationReportID}`);
            expect(destinationReportNextStep).toBeDefined();
            expect(destinationReportNextStep?.value).toBeDefined();

            // Verify that failure data restores both reports to their previous next step values
            const failureData = (apiWriteCall?.[2] as {failureData?: Array<{key: string; value: unknown}>})?.failureData;
            const destinationReportNextStepFailure = failureData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${destinationReportID}`);
            const sourceReportNextStepFailure = failureData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${sourceReportID}`);

            expect(destinationReportNextStepFailure).toBeDefined();
            expect(destinationReportNextStepFailure?.value).toBeNull();
            expect(sourceReportNextStepFailure).toBeDefined();
            expect(sourceReportNextStepFailure?.value).toBeNull();

            mockAPIWrite.mockRestore();
        });

        it('should revert next steps for all affected reports when the request fails', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const sourceReportID = '200';
            const destinationReportID = '201';

            const sourceReport = createExpenseReportForTest(sourceReportID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 500,
            });

            const destinationReport = createExpenseReportForTest(destinationReportID, {
                ownerAccountID: CURRENT_USER_ID,
                total: 0,
            });

            const sourceNextStep = {
                type: 'neutral' as const,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [{text: 'Submit expenses for approval'}],
            };

            const destinationNextStep = {
                type: 'neutral' as const,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [{text: 'Waiting for new expenses'}],
            };

            const transaction = generateTransaction({
                reportID: sourceReportID,
                amount: 500,
            });

            const oldIOUAction = createIOUReportActionForTest({
                reportID: sourceReportID,
                transactionID: transaction.transactionID,
                amount: transaction.amount,
                currency: transaction.currency,
                actorAccountID: CURRENT_USER_ID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${sourceReportID}`, sourceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${destinationReportID}`, destinationReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.NEXT_STEP}${sourceReportID}`, sourceNextStep);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.NEXT_STEP}${destinationReportID}`, destinationNextStep);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sourceReportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await waitForBatchedUpdates();

            const getNextStep = (reportID: string) =>
                new Promise<OnyxEntry<ReportNextStep>>((resolve) => {
                    const connection = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
                        callback: (value) => {
                            Onyx.disconnect(connection);
                            resolve(value);
                        },
                    });
                });

            expect(await getNextStep(sourceReportID)).toEqual(sourceNextStep);
            expect(await getNextStep(destinationReportID)).toEqual(destinationNextStep);

            const nextStepsCollection = {
                [`${ONYXKEYS.COLLECTION.NEXT_STEP}${sourceReportID}`]: sourceNextStep,
                [`${ONYXKEYS.COLLECTION.NEXT_STEP}${destinationReportID}`]: destinationNextStep,
            } satisfies OnyxCollection<ReportNextStep>;

            const report = await getReportFromUseOnyx(destinationReportID);
            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, destinationNextStep, undefined, nextStepsCollection);
            await waitForBatchedUpdates();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const {optimisticData = [], failureData = []} = (apiWriteCall?.[2] as {optimisticData?: OnyxUpdate[]; failureData?: OnyxUpdate[]}) ?? {};

            const optimisticSourceNextStepUpdate = optimisticData.find((update) => update.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${sourceReportID}`);
            const optimisticDestinationNextStepUpdate = optimisticData.find((update) => update.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${destinationReportID}`);

            expect(optimisticSourceNextStepUpdate).toBeDefined();
            expect(optimisticDestinationNextStepUpdate).toBeDefined();

            expect(failureData).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${sourceReportID}`, value: sourceNextStep}),
                    expect.objectContaining({key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${destinationReportID}`, value: destinationNextStep}),
                ]),
            );

            await Onyx.update(failureData);
            await waitForBatchedUpdates();

            expect(await getNextStep(sourceReportID)).toEqual(sourceNextStep);
            expect(await getNextStep(destinationReportID)).toEqual(destinationNextStep);

            mockAPIWrite.mockRestore();
        });
    });

    describe('saveWaypoint', () => {
        it('should save a waypoint with lat/lng and not YOUR_LOCATION_TEXT', async () => {
            const transactionID = 'txn1';
            const index = '0';
            const waypoint: RecentWaypoint = {
                address: '123 Main St',
                lat: 10,
                lng: 20,
            };
            const recentWaypointsList: RecentWaypoint[] = [];
            saveWaypoint({transactionID, index, waypoint, isDraft: false, recentWaypointsList});
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            const updatedRecentWaypoints = await OnyxUtils.get(ONYXKEYS.NVP_RECENT_WAYPOINTS);

            expect(transaction?.comment?.waypoints?.[`waypoint${index}`]).toEqual(waypoint);
            expect(updatedRecentWaypoints?.[0]?.address).toBe('123 Main St');
        });

        it('should not save waypoint if missing lat/lng', async () => {
            const transactionID = 'txn2';
            const index = '1';
            const waypoint: RecentWaypoint = {
                address: 'No LatLng',
            };
            const recentWaypointsList: RecentWaypoint[] = [];
            saveWaypoint({transactionID, index, waypoint, isDraft: false, recentWaypointsList});
            await waitForBatchedUpdates();

            const updatedRecentWaypoints = await OnyxUtils.get(ONYXKEYS.NVP_RECENT_WAYPOINTS);
            expect(updatedRecentWaypoints?.length ?? 0).toBe(0);
        });

        it('should not save waypoint if address is YOUR_LOCATION_TEXT', async () => {
            const transactionID = 'txn3';
            const index = '2';
            const waypoint: RecentWaypoint = {
                address: CONST.YOUR_LOCATION_TEXT,
                lat: 1,
                lng: 2,
            };
            const recentWaypointsList: RecentWaypoint[] = [];
            saveWaypoint({transactionID, index, waypoint, isDraft: false, recentWaypointsList});
            await waitForBatchedUpdates();

            const updatedRecentWaypoints = await OnyxUtils.get(ONYXKEYS.NVP_RECENT_WAYPOINTS);
            expect(updatedRecentWaypoints?.length ?? 0).toBe(0);
        });

        it('should reset amount for draft transactions', async () => {
            const transactionID = 'txn4';
            const index = '0';
            const waypoint: RecentWaypoint = {
                address: 'Draft Waypoint',
                lat: 5,
                lng: 6,
            };
            const recentWaypointsList: RecentWaypoint[] = [];
            saveWaypoint({transactionID, index, waypoint, isDraft: true, recentWaypointsList});
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(transaction?.amount).toBe(CONST.IOU.DEFAULT_AMOUNT);
        });

        it('should clear errorFields and routes', async () => {
            const transactionID = 'txn5';
            const index = '0';
            const waypoint: RecentWaypoint = {
                address: 'Clear Error',
                lat: 7,
                lng: 8,
            };
            const recentWaypointsList: RecentWaypoint[] = [];
            // Ensure there is an existing transaction with errorFields and routes
            const existingTransaction = generateTransaction({transactionID, reportID: '1'});
            // Add errorFields and routes so saveWaypoint can clear them
            // Populate with realistic non-null values
            existingTransaction.errorFields = {route: {some: 'value'}};
            existingTransaction.routes = {
                route0: {
                    distance: 123,
                    geometry: {
                        coordinates: [
                            [0, 0],
                            [1, 1],
                        ],
                    },
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, existingTransaction);
            saveWaypoint({transactionID, index, waypoint, isDraft: false, recentWaypointsList});
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transaction?.errorFields?.route ?? null).toBeNull();
            expect(transaction?.routes?.route0?.distance ?? null).toBeNull();
            expect(transaction?.routes?.route0?.geometry?.coordinates ?? null).toBeNull();
        });
    });

    describe('dismissDuplicateTransactionViolation', () => {
        /**
         * Sets up test data with transactions, violations, and related reports
         */
        async function setupTestData(options: {
            transactionCount?: number;
            withExpenseReport?: boolean;
            withPolicy?: boolean;
            withOtherViolations?: boolean;
            duplicateViolationIDs?: string[];
        }) {
            const {transactionCount = 2, withExpenseReport = true, withPolicy = true, withOtherViolations = false, duplicateViolationIDs} = options;

            // Create test transactions
            const transactions: TransactionType[] = [];
            const transactionIDs: string[] = [];
            const transactionViolations: Record<string, TransactionViolation[]> = {};

            for (let i = 0; i < transactionCount; i++) {
                const transaction = createRandomTransaction(i);
                transaction.transactionID = `transaction${i}`;
                transaction.reportID = 'expenseReport1';
                transactions.push(transaction);
                transactionIDs.push(transaction.transactionID);

                // Create violations for each transaction
                const violations: TransactionViolation[] = [];
                violations.push({
                    name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                    type: 'violation',
                    data: {
                        duplicates: duplicateViolationIDs ?? transactionIDs,
                    },
                });

                if (withOtherViolations) {
                    violations.push({
                        name: CONST.VIOLATIONS.RTER,
                        type: 'violation',
                    });
                }

                transactionViolations[transaction.transactionID] = violations;
            }

            // Set up Onyx with transactions
            const onyxPromises: Array<Promise<void>> = [];
            transactions.forEach((transaction) => {
                onyxPromises.push(Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction));
                onyxPromises.push(Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`, transactionViolations[transaction.transactionID]));
            });

            // Create expense report if requested
            let expenseReport: Report | undefined;
            if (withExpenseReport) {
                expenseReport = createExpenseReport(1);
                expenseReport.reportID = 'expenseReport1';
                expenseReport.total = 100;
                expenseReport.statusNum = CONST.REPORT.STATUS_NUM.OPEN;
                onyxPromises.push(Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport));
            }

            // Create policy if requested
            let policy: Policy | undefined;
            if (withPolicy) {
                policy = createRandomPolicy(1);
                policy.id = 'policy1';
                onyxPromises.push(Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy));
            }

            // Create personal details
            const personalDetails: PersonalDetails = {
                accountID: 1,
                login: 'test@expensify.com',
                displayName: 'Test User',
                avatar: '',
            };
            // eslint-disable-next-line @typescript-eslint/naming-convention
            onyxPromises.push(Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {1: personalDetails}));

            await Promise.all(onyxPromises);
            await waitForBatchedUpdates();

            return {
                transactions,
                transactionIDs,
                transactionViolations,
                expenseReport,
                policy,
                personalDetails,
            };
        }

        it('should dismiss duplicate transaction violations for given transaction IDs', async () => {
            // Given a set of transactions with duplicate violations
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            const allTransactions: Record<string, TransactionType> = {};
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};

            // Get initial transaction data
            const transaction0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`);
            if (transaction0) {
                allTransactions[transactionIDs[0]] = transaction0;
            }
            const transaction1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(1)}`);
            if (transaction1) {
                allTransactions[transactionIDs[1]] = transaction1;
            }

            // Get initial violation data to verify they exist
            const initialViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            if (initialViolations0) {
                allTransactionViolation[transactionIDs[0]] = initialViolations0;
            }
            const initialViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);
            if (initialViolations1) {
                allTransactionViolation[transactionIDs[1]] = initialViolations1;
            }

            expect(initialViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();
            expect(initialViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();

            mockFetch.pause();

            // When dismissing duplicate transaction violations
            dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            // Then check optimistic data - violations should be removed immediately
            let updatedViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            let updatedViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);

            expect(updatedViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
            expect(updatedViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();

            // Check that transaction comments have dismissedViolations in optimistic data
            let updatedTransaction0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`);
            let updatedTransaction1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(1)}`);

            expect(updatedTransaction0?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();
            expect(updatedTransaction1?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();

            // Check that next step was created optimistically
            let nextStep = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport?.reportID}`);
            expect(nextStep).toBeDefined();

            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then check success data - violations should still be removed
            updatedViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            updatedViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);

            expect(updatedViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
            expect(updatedViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();

            // Check that transaction comments still have dismissedViolations after success
            updatedTransaction0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`);
            updatedTransaction1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(1)}`);

            expect(updatedTransaction0?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();
            expect(updatedTransaction1?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();

            // Check that next step is still present after success
            nextStep = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport?.reportID}`);
            expect(nextStep).toBeDefined();
        });

        it('should update transaction comment with dismissedViolations timestamp', async () => {
            // Given transactions with duplicate violations
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            const allTransactions: Record<string, TransactionType> = {};
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};

            // Get data for the function
            for (const transactionID of transactionIDs) {
                const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                if (transaction) {
                    allTransactions[transactionID] = transaction;
                }

                const violations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
                if (violations) {
                    allTransactionViolation[transactionID] = violations;
                }
            }

            const dismissTime = new Date();

            // When dismissing duplicate transaction violations
            dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            // Then each transaction should have dismissedViolations in its comment with the dismissing user's login
            for (const transactionID of transactionIDs) {
                const updatedTransaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

                expect(updatedTransaction?.comment?.dismissedViolations).toBeDefined();
                expect(updatedTransaction?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();
                expect(updatedTransaction?.comment?.dismissedViolations?.duplicatedTransaction?.[personalDetails.login ?? '']).toBeDefined();

                // Verify the timestamp is reasonable (within a few seconds of dismissTime)
                const timestamp = updatedTransaction?.comment?.dismissedViolations?.duplicatedTransaction?.[personalDetails.login ?? ''];
                const expectedTimestamp = getUnixTime(dismissTime);
                if (timestamp !== undefined && typeof timestamp === 'number') {
                    expect(Math.abs(timestamp - expectedTimestamp)).toBeLessThanOrEqual(5);
                }
            }
        });

        it('should preserve other violations when dismissing duplicate violations', async () => {
            // Given transactions with both duplicate violations and other violations
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
                withOtherViolations: true,
            });

            const allTransactions: Record<string, TransactionType> = {};
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};

            for (const transactionID of transactionIDs) {
                const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                if (transaction) {
                    allTransactions[transactionID] = transaction;
                }

                const violations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
                if (violations) {
                    allTransactionViolation[transactionID] = violations;
                }
            }

            // When dismissing duplicate transaction violations
            dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            // Then duplicate violations should be removed but other violations should remain
            for (const transactionID of transactionIDs) {
                const updatedViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);

                expect(updatedViolations).toBeDefined();
                expect(updatedViolations?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
                expect(updatedViolations?.find((v) => v.name === CONST.VIOLATIONS.RTER)).toBeDefined();
            }
        });

        it('should update next step when expense report is provided', async () => {
            // Given transactions with duplicate violations and an expense report
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            const allTransactions: Record<string, TransactionType> = {};
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};

            for (const transactionID of transactionIDs) {
                const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                if (transaction) {
                    allTransactions[transactionID] = transaction;
                }

                const violations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
                if (violations) {
                    allTransactionViolation[transactionID] = violations;
                }
            }

            // When dismissing duplicate transaction violations
            dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            // Then the next step for the expense report should be updated
            const nextStep = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport?.reportID}`);

            expect(nextStep).toBeDefined();
        });

        it('should handle API failure and restore original violations', async () => {
            // Given a set of transactions with duplicate violations
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            const allTransactions: Record<string, TransactionType> = {};

            // Get initial transaction data
            const transaction0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`);
            if (transaction0) {
                allTransactions[transactionIDs[0]] = transaction0;
            }

            const transaction1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(1)}`);
            if (transaction1) {
                allTransactions[transactionIDs[1]] = transaction1;
            }

            // Get initial violations to verify they exist
            const initialViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};
            if (initialViolations0) {
                allTransactionViolation[transactionIDs[0]] = initialViolations0;
            }
            const initialViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);
            if (initialViolations1) {
                allTransactionViolation[transactionIDs[1]] = initialViolations1;
            }

            expect(initialViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();
            expect(initialViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();

            mockFetch.pause();

            // When dismissing duplicate transaction violations and API fails
            mockFetch.fail();
            dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the violations should be restored to original state after failure
            const restoredViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            const restoredViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);

            expect(restoredViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();
            expect(restoredViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();
        });

        it('should work with data from useOnyx hook', async () => {
            // Given transactions with duplicate violations set up in Onyx
            const {transactionIDs, personalDetails, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            // When using useOnyx to get the data
            const {result: expenseReportResult} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.REPORT}expenseReport1`));
            const {result: allTransactionsResult} = renderHook(() => useOnyx(ONYXKEYS.COLLECTION.TRANSACTION));
            const {result: allTransactionViolationResult} = renderHook(() => useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS));

            await waitFor(() => {
                expect(expenseReportResult.current[0]).toBeDefined();
                expect(allTransactionsResult.current[0]).toBeDefined();
                expect(allTransactionViolationResult.current[0]).toBeDefined();
            });

            // When dismissing violations using data from useOnyx
            await act(async () => {
                dismissDuplicateTransactionViolation({
                    transactionIDs,
                    dismissedPersonalDetails: personalDetails,
                    expenseReport: expenseReportResult.current[0],
                    policy,
                    isASAPSubmitBetaEnabled: false,
                    allTransactionsCollection: allTransactionsResult.current[0] ?? {},
                    allTransactionViolationsCollection: allTransactionViolationResult.current[0] ?? {},
                });
                await waitForBatchedUpdates();
            });

            // Then the violations should be dismissed successfully
            const updatedViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            const updatedViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);

            expect(updatedViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
            expect(updatedViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
        });
    });
});
