import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {ReportAction, ReportActions, Transaction} from '../../src/types/onyx';
import type ReportNextStep from '../../src/types/onyx/ReportNextStep';
import {createExpenseReportForTest, createIOUReportActionForTest, createSelfDMReportForTest} from '../utils/ReportTestUtils';
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

    beforeEach(() => {
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

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com', undefined, undefined, undefined, emptyNextStepsCollection);
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

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com', undefined, undefined, undefined, emptyNextStepsCollection);
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

            changeTransactionsReport(
                [transaction.transactionID],
                FAKE_NEW_REPORT_ID,
                false,
                CURRENT_USER_ID,
                'test@example.com',
                undefined,
                mockReportNextStep,
                undefined,
                emptyNextStepsCollection,
            );
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

            changeTransactionsReport(
                [transaction.transactionID],
                CONST.REPORT.UNREPORTED_REPORT_ID,
                false,
                CURRENT_USER_ID,
                'test@example.com',
                undefined,
                mockReportNextStep,
                undefined,
                emptyNextStepsCollection,
            );
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
            await waitForBatchedUpdates();

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com', undefined, undefined, undefined, emptyNextStepsCollection);
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
            await waitForBatchedUpdates();

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, true, CURRENT_USER_ID, 'test@example.com', undefined, undefined, undefined, emptyNextStepsCollection);
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

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, customAccountID, customEmail, undefined, undefined, undefined, emptyNextStepsCollection);
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

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com', undefined, undefined, undefined, emptyNextStepsCollection);
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

            // Move only one transaction, leaving the other in the old report
            changeTransactionsReport([transaction1.transactionID], FAKE_NEW_REPORT_ID, false, CURRENT_USER_ID, 'test@example.com', undefined, undefined, undefined, emptyNextStepsCollection);
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

            changeTransactionsReport([transaction.transactionID], destinationReportID, false, CURRENT_USER_ID, 'test@example.com', undefined, undefined, undefined, emptyNextStepsCollection);
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

            changeTransactionsReport(
                [transaction.transactionID],
                destinationReportID,
                false,
                CURRENT_USER_ID,
                'test@example.com',
                undefined,
                destinationNextStep,
                undefined,
                nextStepsCollection,
            );
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
});
