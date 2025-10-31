import {act, renderHook, waitFor} from '@testing-library/react-native';
import {getUnixTime} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import useOnyx from '@hooks/useOnyx';
import {changeTransactionsReport, dismissDuplicateTransactionViolation} from '@libs/actions/Transaction';
import DateUtils from '@libs/DateUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {rand64} from '@libs/NumberUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, Transaction as TransactionType, TransactionViolation} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {ReportAction, ReportActions, Transaction} from '../../src/types/onyx';
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

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report);
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

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report);
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

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, mockReportNextStep);
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

            const report = await getReportFromUseOnyx(CONST.REPORT.UNREPORTED_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, mockReportNextStep);
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
            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, CURRENT_USER_ID, 'test@example.com', report, undefined, undefined);
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
            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], true, CURRENT_USER_ID, 'test@example.com', report);
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
            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);

            changeTransactionsReport([transaction.transactionID], false, customAccountID, customEmail, report);
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
