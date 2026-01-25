import {act, renderHook, waitFor} from '@testing-library/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import useOnyx from '@hooks/useOnyx';
import {changeTransactionsReport, dismissDuplicateTransactionViolation, markAsCash, saveWaypoint} from '@libs/actions/Transaction';
import DateUtils from '@libs/DateUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import type {buildOptimisticNextStep} from '@libs/NextStepUtils';
import {rand64} from '@libs/NumberUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {PersonalDetails, RecentWaypoint, Report, ReportAction, ReportActions, Transaction} from '../../src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
import {createExpenseReport, createRandomReport} from '../utils/collections/reports';
import getOnyxValue from '../utils/getOnyxValue';
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
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                allTransactions,
            });
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
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                allTransactions,
            });
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
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                policy: undefined,
                reportNextStep: mockReportNextStep,
                allTransactions,
            });
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
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                policy: undefined,
                reportNextStep: mockReportNextStep,
                allTransactions,
            });
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
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                policy: undefined,
                reportNextStep: undefined,
                allTransactions,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const failureData = (apiWriteCall?.[2] as {failureData?: Array<{key: string; value: unknown}>})?.failureData;

            const nextStepFailureData = failureData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${FAKE_NEW_REPORT_ID}`);

            expect(nextStepFailureData).toBeDefined();
            expect(nextStepFailureData?.value).toBeUndefined();

            mockAPIWrite.mockRestore();
        });

        it('updates the source submitted report next step without reopening when it becomes empty', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const buildOptimisticNextStepSpy = jest.spyOn(require('@libs/NextStepUtils'), 'buildOptimisticNextStep');

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
                amount: -100,
                currency: CONST.CURRENCY.USD,
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
            const submittedReport: Report = {
                ...createExpenseReport(6),
                reportID: FAKE_OLD_REPORT_ID,
                ownerAccountID: CURRENT_USER_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                currency: CONST.CURRENCY.USD,
                total: -100,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`, submittedReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                allTransactions,
            });
            await waitForBatchedUpdates();

            try {
                const buildOptimisticNextStepCalls = buildOptimisticNextStepSpy.mock.calls as Array<[Parameters<typeof buildOptimisticNextStep>[0]]>;
                const sourceNextStepCall = buildOptimisticNextStepCalls.find(([params]) => params.report?.reportID === FAKE_OLD_REPORT_ID);

                expect(sourceNextStepCall).toBeDefined();
                expect(sourceNextStepCall?.[0].predictedNextStatus).toBe(CONST.REPORT.STATUS_NUM.SUBMITTED);

                const apiWriteCall = mockAPIWrite.mock.calls.at(0);
                const optimisticData = (apiWriteCall?.[2] as {optimisticData?: Array<{key: string}>})?.optimisticData;
                const sourceNextStepUpdate = optimisticData?.find((data) => data.key === `${ONYXKEYS.COLLECTION.NEXT_STEP}${FAKE_OLD_REPORT_ID}`);

                expect(sourceNextStepUpdate).toBeDefined();
            } finally {
                buildOptimisticNextStepSpy.mockRestore();
                mockAPIWrite.mockRestore();
            }
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
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: true,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                allTransactions,
            });
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
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: customAccountID,
                email: customEmail,
                newReport: report,
                allTransactions,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const parameters = apiWriteCall?.[1] as {reportID: string; transactionList: string; transactionIDToReportActionAndThreadData: string};

            expect(parameters).toBeDefined();
            expect(parameters.reportID).toBe(FAKE_NEW_REPORT_ID);
            expect(parameters.transactionList).toBe(transaction.transactionID);

            mockAPIWrite.mockRestore();
        });

        it('should update the target report total when the currency is the same', async () => {
            const transaction = {
                ...generateTransaction({
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                }),
                amount: -100,
                currency: CONST.CURRENCY.USD,
                reimbursable: false,
            };
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
            const expenseReport = {
                ...createRandomReport(1, undefined),
                total: -200,
                nonReimbursableTotal: 0,
                currency: CONST.CURRENCY.USD,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_SELF_DM_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: expenseReport,
                allTransactions,
            });
            await waitForBatchedUpdates();
            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(report?.total).toBe(expenseReport.total + transaction.amount);
            expect(report?.nonReimbursableTotal).toBe(expenseReport.nonReimbursableTotal + transaction.amount);
        });

        it('should not update the target report total when the currency is different', async () => {
            const transaction = {
                ...generateTransaction({
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                }),
                currency: 'IDR',
                reimbursable: false,
            };
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
            const expenseReport = {
                ...createRandomReport(1, undefined),
                total: -200,
                nonReimbursableTotal: 0,
                currency: CONST.CURRENCY.USD,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_SELF_DM_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: expenseReport,
                allTransactions,
            });
            await waitForBatchedUpdates();
            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(report?.total).toBe(expenseReport.total);
            expect(report?.nonReimbursableTotal).toBe(expenseReport.nonReimbursableTotal);
        });

        it('should update target report total using convertedAmount when moving within same workspace currency', async () => {
            const oldExpenseReport = {
                ...createRandomReport(1, undefined),
                total: -3673,
                nonReimbursableTotal: 0,
                currency: 'AED',
            };
            const transaction = {
                ...generateTransaction({reportID: oldExpenseReport.reportID}),
                currency: 'USD',
                amount: -1000,
                convertedAmount: -3673,
                reimbursable: true,
            };
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: oldExpenseReport.reportID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            const newExpenseReport = {
                ...createRandomReport(2, undefined),
                total: 0,
                nonReimbursableTotal: 0,
                currency: 'AED',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${oldExpenseReport.reportID}`, oldExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${newExpenseReport.reportID}`, newExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldExpenseReport.reportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                allTransactions,
            });
            await waitForBatchedUpdates();
            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${newExpenseReport.reportID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(report?.total).toBe(transaction.convertedAmount);
        });

        it('should not update target report total when switching to workspace with different currency', async () => {
            const oldExpenseReport = {
                ...createRandomReport(1, undefined),
                total: -1503,
                nonReimbursableTotal: 0,
                currency: 'AUD',
            };
            const transaction = {
                ...generateTransaction({reportID: oldExpenseReport.reportID}),
                currency: 'USD',
                amount: -1000,
                convertedAmount: -1503,
                reimbursable: true,
            };
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: oldExpenseReport.reportID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            const newExpenseReport = {
                ...createRandomReport(2, undefined),
                total: 0,
                nonReimbursableTotal: 0,
                currency: 'AED',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${oldExpenseReport.reportID}`, oldExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${newExpenseReport.reportID}`, newExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldExpenseReport.reportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                allTransactions,
            });
            await waitForBatchedUpdates();
            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${newExpenseReport.reportID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(report?.total).toBe(0);
        });

        it('should update the old report total when the currency is the same', async () => {
            const oldExpenseReport = {
                ...createRandomReport(1, undefined),
                total: -200,
                nonReimbursableTotal: -200,
                currency: CONST.CURRENCY.USD,
            };
            const transaction = {
                ...generateTransaction({
                    reportID: oldExpenseReport.reportID,
                }),
                amount: -100,
                reimbursable: false,
            };
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
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${oldExpenseReport.reportID}`, oldExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldExpenseReport.reportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const fakeReport = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: fakeReport,
                allTransactions,
            });
            await waitForBatchedUpdates();

            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${oldExpenseReport.reportID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(report?.total).toBe(oldExpenseReport.total - transaction.amount);
            expect(report?.nonReimbursableTotal).toBe(oldExpenseReport.nonReimbursableTotal - transaction.amount);
        });

        it('should not update the old report total when the currency is different', async () => {
            const oldExpenseReport = {
                ...createRandomReport(1, undefined),
                total: -200,
                nonReimbursableTotal: -200,
                currency: CONST.CURRENCY.USD,
            };
            const transaction = {
                ...generateTransaction({
                    reportID: oldExpenseReport.reportID,
                }),
                reimbursable: false,
                currency: 'IDR',
            };
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
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${oldExpenseReport.reportID}`, oldExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldExpenseReport.reportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const fakeReport = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: fakeReport,
                allTransactions,
            });
            await waitForBatchedUpdates();

            const report = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${oldExpenseReport.reportID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(report?.total).toBe(oldExpenseReport.total);
            expect(report?.nonReimbursableTotal).toBe(oldExpenseReport.nonReimbursableTotal);
        });

        it('should show "waiting for you to submit expense" next step message when moving expense to a new report ', async () => {
            const policyID = '12346';
            const oldExpenseReportID = '5';

            const transaction = generateTransaction({reportID: oldExpenseReportID});

            const newOpenReport = {...createExpenseReport(6334), policyID, stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, ownerAccountID: CURRENT_USER_ID};

            const policy = {...createRandomPolicy(Number(policyID)), harvesting: {enabled: false}, autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE};

            const policyCategories = createRandomPolicyCategories(5);

            const userPersonalDetails: Record<number, PersonalDetails> = {
                [CURRENT_USER_ID]: {
                    login: 'test@gmail.com',
                    accountID: CURRENT_USER_ID,
                    displayName: 'You',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, userPersonalDetails);

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@gmail.com',
                newReport: newOpenReport,
                policy,
                reportNextStep: undefined,
                policyCategories,
                allTransactions,
            });

            await waitForBatchedUpdates();

            const nextStep = await getOnyxValue(`${ONYXKEYS.COLLECTION.NEXT_STEP}${newOpenReport.reportID}`);

            const nextStepMessage = nextStep?.message?.map((part) => part.text).join('');

            expect(nextStepMessage).toEqual('Waiting for You to submit %expenses.');
        });

        it('should not create MOVED_TRANSACTION action when moving expenses from a Draft report', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            // Create a draft (open) report as the source
            const draftReport = {
                ...createRandomReport(10, undefined),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                currency: CONST.CURRENCY.USD,
            };

            const transaction = generateTransaction({
                reportID: draftReport.reportID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: draftReport.reportID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${draftReport.reportID}`, draftReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${draftReport.reportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                allTransactions,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            // Verify that movedReportActionID is undefined in the API call parameters
            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const parameters = apiWriteCall?.[1] as {transactionIDToReportActionAndThreadData: string};
            const transactionData = JSON.parse(parameters.transactionIDToReportActionAndThreadData);

            // The movedReportActionID should be undefined when moving from a draft report
            expect(transactionData[transaction.transactionID].movedReportActionID).toBeUndefined();

            mockAPIWrite.mockRestore();
        });

        it('should create MOVED_TRANSACTION action when moving expenses from a non-Draft report', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            // Create a submitted (non-draft) report as the source
            const submittedReport = {
                ...createRandomReport(11, undefined),
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                currency: CONST.CURRENCY.USD,
            };

            const transaction = generateTransaction({
                reportID: submittedReport.reportID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: submittedReport.reportID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${submittedReport.reportID}`, submittedReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${submittedReport.reportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const report = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                allTransactions,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            // Verify that movedReportActionID is defined in the API call parameters
            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const parameters = apiWriteCall?.[1] as {transactionIDToReportActionAndThreadData: string};
            const transactionData = JSON.parse(parameters.transactionIDToReportActionAndThreadData);

            // The movedReportActionID should be defined when moving from a non-draft report
            expect(transactionData[transaction.transactionID].movedReportActionID).toBeDefined();

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

    describe('dismissDuplicateTransactionViolation', () => {
        it('should optimistically remove DUPLICATED_TRANSACTION violation and add dismissed violation report action', async () => {
            const transactionID = 'dismissTxn1';
            const threadReportID = 'threadDismiss1';
            const mockViolations: TransactionViolation[] = [
                {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: 'warning'},
                {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'},
            ];

            mockFetch.pause();

            // Put violations into Onyx so module-level Onyx.connect in Transaction.ts picks them up
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, mockViolations);

            // Prepare a transaction and its IOU action so getIOUActionForReportID finds a childReportID
            const transaction = generateTransaction({transactionID, reportID: FAKE_OLD_REPORT_ID});
            const iouAction = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: threadReportID,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[iouAction.reportActionID]: iouAction});
            // Ensure transaction exists in the passed allTransactions mapping
            const allTransactions = {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction};

            // Ensure the child report actions collection exists
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, {});

            // Call the function
            dismissDuplicateTransactionViolation({
                transactionIDs: [transactionID],
                dismissedPersonalDetails: {login: 'tester@example.com', accountID: CURRENT_USER_ID},
                expenseReport: newReport,
                policy: undefined,
                isASAPSubmitBetaEnabled: false,
                allTransactions,
            });
            await waitForBatchedUpdates();

            const optimisticViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(optimisticViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'}]);

            const reportActions = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`);
            const reportActionValues = Object.values(reportActions ?? {});
            expect(reportActionValues.length).toBe(1);
            expect(reportActionValues.at(0)?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION);

            // Let the mocked API resolve and ensure optimistic state behaves as implementation expects:
            // The implementation clears the optimistic dismissed-violation report action on success to avoid duplicates,
            // so after the API resolves the report action should be removed while the filtered violations persist.
            await mockFetch.resume();
            await waitForBatchedUpdates();

            const finalViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(finalViolations).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'}]);

            const finalReportActions = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`);
            const finalReportActionValues = Object.values(finalReportActions ?? {});
            // The optimistic dismissed violation report action is removed on successful API response to avoid duplicates
            expect(finalReportActionValues.length).toBe(0);
        });

        it('should restore DUPLICATED_TRANSACTION violation and remove report action when API fails', async () => {
            const transactionID = 'dismissTxn2';
            const threadReportID = 'threadDismiss2';
            const mockViolations: TransactionViolation[] = [{name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: 'warning'}];

            mockFetch.pause();

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, mockViolations);

            const transaction = generateTransaction({transactionID, reportID: FAKE_OLD_REPORT_ID});
            const iouAction = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: threadReportID,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[iouAction.reportActionID]: iouAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, {});
            const allTransactions = {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction};

            // Make the API fail
            mockFetch.fail();

            dismissDuplicateTransactionViolation({
                transactionIDs: [transactionID],
                dismissedPersonalDetails: {login: 'tester@example.com', accountID: CURRENT_USER_ID},
                expenseReport: newReport,
                policy: undefined,
                isASAPSubmitBetaEnabled: false,
                allTransactions,
            });
            await waitForBatchedUpdates();

            // Resume (the mock is set to fail) and wait for failure handling
            await mockFetch.resume();
            await waitForBatchedUpdates();

            const failureViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(failureViolations).toEqual(mockViolations);

            const reportActions = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`);
            expect(Object.keys(reportActions ?? {}).length).toBe(0);
        });

        it('should not modify Onyx data when tag list does not exist at given index (empty violations array)', async () => {
            const transactionID = 'dismissTxn3';
            const threadReportID = 'threadDismiss3';
            const mockViolations: TransactionViolation[] = [];

            mockFetch.pause();

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, mockViolations);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, {});

            const transaction = generateTransaction({transactionID, reportID: FAKE_OLD_REPORT_ID});
            const allTransactions = {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction};

            dismissDuplicateTransactionViolation({
                transactionIDs: [transactionID],
                dismissedPersonalDetails: {login: 'tester@example.com', accountID: CURRENT_USER_ID},
                expenseReport: newReport,
                policy: undefined,
                isASAPSubmitBetaEnabled: false,
                allTransactions,
            });
            await waitForBatchedUpdates();

            const optimisticViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(optimisticViolations).toEqual([]);

            await mockFetch.resume();
        });

        describe('integration with useOnyx', () => {
            it('works when violations are read via useOnyx hook', async () => {
                const transactionID = 'dismissTxn4';
                const threadReportID = 'threadDismiss4';
                const mockViolations: TransactionViolation[] = [
                    {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: 'warning'},
                    {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'},
                ];

                mockFetch.pause();

                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, mockViolations);

                const transaction = generateTransaction({transactionID, reportID: FAKE_OLD_REPORT_ID});
                const iouAction = {
                    reportActionID: rand64(),
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    childReportID: threadReportID,
                    actorAccountID: CURRENT_USER_ID,
                    created: DateUtils.getDBTime(),
                    originalMessage: {
                        IOUReportID: FAKE_OLD_REPORT_ID,
                        IOUTransactionID: transactionID,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[iouAction.reportActionID]: iouAction});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, {});
                const allTransactions = {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction};

                const {result} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`));
                await waitFor(() => {
                    expect(result.current[0]).toBeDefined();
                });

                await act(async () => {
                    dismissDuplicateTransactionViolation({
                        transactionIDs: [transactionID],
                        dismissedPersonalDetails: {login: 'tester@example.com', accountID: CURRENT_USER_ID},
                        expenseReport: newReport,
                        policy: undefined,
                        isASAPSubmitBetaEnabled: false,
                        allTransactions,
                    });
                    await waitForBatchedUpdates();
                });

                // The useOnyx hook should reflect the optimistic change
                await waitFor(() => {
                    expect(result.current[0]).toEqual([{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'}]);
                });

                const reportActions = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`);
                const reportActionValues = Object.values(reportActions ?? {});
                expect(reportActionValues.length).toBe(1);
                expect(reportActionValues.at(0)?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION);

                await mockFetch.resume();
            });
        });
    });
});
