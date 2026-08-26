import {act, renderHook, waitFor} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import {
    changeTransactionsReport as changeTransactionsReportAction,
    dismissDuplicateTransactionViolation,
    markAsCash,
    removeWaypoint,
    sanitizeWaypointsForAPI,
    saveWaypoint,
    setSelectedRoute,
} from '@libs/actions/Transaction';
import * as API from '@libs/API';
import type {ChangeTransactionsReportParams} from '@libs/API/parameters';
import DateUtils from '@libs/DateUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import * as NextStepUtils from '@libs/NextStepUtils';
import {rand64} from '@libs/NumberUtils';
import {isRecord} from '@libs/ObjectUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import type {ReportCollectionDataSet, ReportNextStep} from '@src/types/onyx/Report';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import type {UpdateMoneyRequestDataKeys} from '../../src/libs/actions/IOU/UpdateMoneyRequest';
import type {PersonalDetails, Policy, PolicyTagLists, RecentWaypoint, Report, ReportAction, ReportActions, Transaction} from '../../src/types/onyx';
import type {ReportMergeUpdate} from '../utils/typeGuards';

import * as TransactionUtils from '../../src/libs/TransactionUtils';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
import {createExpenseReport, createRandomReport} from '../utils/collections/reports';
import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import {hasDefinedProperty, parseJSONRecord, readProperty, isReportMergeUpdate, isReportStateMergeUpdate} from '../utils/typeGuards';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type LegacyChangeTransactionsReportProps = Omit<
    Parameters<typeof changeTransactionsReportAction>[0],
    'transactions' | 'allTransactionViolation' | 'personalPolicyOutputCurrency' | 'selfDMReportActions' | 'delegateAccountID' | 'getCurrencyDecimals'
> & {
    allTransactions: OnyxCollection<Transaction>;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    personalPolicyOutputCurrency?: string;
};
type CapturedOnyxData = {
    optimisticData?: Array<{key: string; value: unknown}>;
    successData?: Array<{key: string; value: unknown}>;
    failureData?: Array<{key: string; value: unknown}>;
};

function isCapturedOnyxData(value: unknown): value is CapturedOnyxData {
    return typeof value === 'object' && value !== null;
}

function isChangeTransactionsReportParams(value: unknown): value is ChangeTransactionsReportParams {
    return (
        isRecord(value) &&
        typeof value.reportID === 'string' &&
        typeof value.transactionList === 'string' &&
        typeof value.transactionIDToReportActionAndThreadData === 'string' &&
        (value.transactionIDToUpdatedCustomUnitRateID === undefined || typeof value.transactionIDToUpdatedCustomUnitRateID === 'string')
    );
}

// Wrapper mirroring the pre-refactor signature so existing test call sites compile unchanged.
function changeTransactionsReport({allTransactions, transactionIDs, transactionViolations = {}, personalPolicyOutputCurrency, ...rest}: LegacyChangeTransactionsReportProps) {
    const transactions = transactionIDs.map((id) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]).filter((transaction): transaction is Transaction => !!transaction);
    changeTransactionsReportAction({
        transactionIDs,
        transactions,
        allTransactionViolation: transactionViolations,
        personalPolicyOutputCurrency,
        selfDMReportActions: undefined,
        delegateAccountID: undefined,
        getCurrencyDecimals: TestHelper.getCurrencyDecimalsLocal,
        ...rest,
    });
}

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

function generateIOUAction(transaction: Transaction, reportID: string): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return {
        reportActionID: rand64(),
        reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: CURRENT_USER_ID,
        created: DateUtils.getDBTime(),
        originalMessage: {
            IOUTransactionID: transaction.transactionID,
            amount: transaction.amount,
            currency: transaction.currency,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        },
    };
}

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
        const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
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

    const mockFetch = TestHelper.setupGlobalFetchMock();
    const statefulFetchImplementation = mockFetch.getMockImplementation();
    if (!statefulFetchImplementation) {
        throw new Error('Expected the stateful fetch mock implementation');
    }
    beforeEach(() => {
        mockFetch.mockReset();
        mockFetch.mockImplementation(statefulFetchImplementation);
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    /* eslint-disable rulesdir/no-multiple-api-calls -- Each it callback independently spies on API.write once; the rule's ancestor token scan combines otherwise independent tests. */
    describe('changeTransactionsReport', () => {
        let reports: OnyxCollection<Report>;

        async function loadReports() {
            await TestHelper.getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                callback: (value) => {
                    reports = value;
                },
            });
        }

        beforeEach(loadReports);

        function createIOUAction(transaction: Transaction, reportID = transaction.reportID, type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE> = CONST.IOU.REPORT_ACTION_TYPE.CREATE) {
            return {
                reportActionID: rand64(),
                reportID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type,
                },
            } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
        }

        it('correctly moves the IOU report action when an unreported transaction is added to an expense report', async () => {
            const transaction = generateTransaction({
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            });
            const oldIOUAction = createIOUAction(transaction, '0', CONST.IOU.REPORT_ACTION_TYPE.TRACK);
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
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
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
            const oldIOUAction = createIOUAction(transaction);
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
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
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
            const mockAPIWrite = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUAction(transaction);

            const mockReportNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION,
                icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, {nextStep: mockReportNextStep});
            await loadReports();

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
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const failureData = apiWriteCall?.[2]?.failureData;

            const reportFailureData = failureData?.findLast((data) => data.key === `${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`);

            expect(reportFailureData).toBeDefined();
            expect(reportFailureData?.value).toEqual({nextStep: mockReportNextStep, pendingFields: {nextStep: null, total: null}});

            mockAPIWrite.mockRestore();
        });

        it('correctly handles reportNextStep parameter when moving transactions to unreported report', async () => {
            const mockAPIWrite = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUAction(transaction);

            const mockReportNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION,
                icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_SELF_DM_REPORT_ID}`, {nextStep: mockReportNextStep});
            await loadReports();

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
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const failureData = apiWriteCall?.[2]?.failureData;

            const reportFailureData = failureData?.findLast((data) => data.key === `${ONYXKEYS.COLLECTION.REPORT}${FAKE_SELF_DM_REPORT_ID}`);

            expect(reportFailureData).toBeDefined();
            expect(reportFailureData?.value).toEqual({nextStep: mockReportNextStep, pendingFields: {nextStep: null, total: null}});

            mockAPIWrite.mockRestore();
        });

        it('keeps sibling duplicate violations cleaned after moving a duplicate transaction to unreported', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const transaction = generateTransaction({
                transactionID: 'txn_a',
                reportID: FAKE_OLD_REPORT_ID,
            });
            const siblingTransaction = generateTransaction({
                transactionID: 'txn_b',
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUAction(transaction);

            const duplicateViolation: TransactionViolation = {
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                data: {duplicates: [siblingTransaction.transactionID]},
            };
            const siblingDuplicateViolation: TransactionViolation = {
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                data: {duplicates: [transaction.transactionID]},
            };
            const missingCategoryViolation: TransactionViolation = {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${siblingTransaction.transactionID}`, siblingTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                policy: undefined,
                allTransactions: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
                },
                policyTagList: undefined,
                transactionViolations: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [duplicateViolation],
                    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${siblingTransaction.transactionID}`]: [siblingDuplicateViolation, missingCategoryViolation],
                },
                reports: undefined,
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const capturedOnyxData = apiWriteCall?.[2];
            const onyxData = isCapturedOnyxData(capturedOnyxData) ? capturedOnyxData : undefined;
            const siblingViolationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${siblingTransaction.transactionID}`;

            expect(onyxData?.optimisticData?.find((data) => data.key === siblingViolationsKey)?.value).toEqual([missingCategoryViolation]);
            expect(onyxData?.successData?.find((data) => data.key === siblingViolationsKey)?.value).toEqual([missingCategoryViolation]);
            expect(onyxData?.failureData?.find((data) => data.key === siblingViolationsKey)?.value).toEqual([siblingDuplicateViolation, missingCategoryViolation]);

            mockAPIWrite.mockRestore();
        });

        it('removes every selected transaction from shared sibling duplicate violations when moving multiple transactions to unreported', async () => {
            const mockAPIWrite = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const firstTransaction = generateTransaction({
                transactionID: 'txn_a',
                reportID: FAKE_OLD_REPORT_ID,
            });
            const secondTransaction = generateTransaction({
                transactionID: 'txn_c',
                reportID: FAKE_OLD_REPORT_ID,
            });
            const siblingTransaction = generateTransaction({
                transactionID: 'txn_b',
                reportID: FAKE_OLD_REPORT_ID,
            });
            const firstIOUAction = createIOUAction(firstTransaction);
            const secondIOUAction = createIOUAction(secondTransaction);

            const firstDuplicateViolation: TransactionViolation = {
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                data: {duplicates: [siblingTransaction.transactionID]},
            };
            const secondDuplicateViolation: TransactionViolation = {
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                data: {duplicates: [siblingTransaction.transactionID]},
            };
            const siblingDuplicateViolation: TransactionViolation = {
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                data: {duplicates: [firstTransaction.transactionID, secondTransaction.transactionID]},
            };
            const missingCategoryViolation: TransactionViolation = {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${firstTransaction.transactionID}`, firstTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${secondTransaction.transactionID}`, secondTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${siblingTransaction.transactionID}`, siblingTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {
                [firstIOUAction.reportActionID]: firstIOUAction,
                [secondIOUAction.reportActionID]: secondIOUAction,
            });

            changeTransactionsReport({
                transactionIDs: [firstTransaction.transactionID, secondTransaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                policy: undefined,
                allTransactions: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${firstTransaction.transactionID}`]: firstTransaction,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${secondTransaction.transactionID}`]: secondTransaction,
                },
                policyTagList: undefined,
                transactionViolations: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${firstTransaction.transactionID}`]: [firstDuplicateViolation],
                    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${secondTransaction.transactionID}`]: [secondDuplicateViolation],
                    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${siblingTransaction.transactionID}`]: [siblingDuplicateViolation, missingCategoryViolation],
                },
                reports: undefined,
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const capturedOnyxData = apiWriteCall?.[2];
            const onyxData = isCapturedOnyxData(capturedOnyxData) ? capturedOnyxData : undefined;
            const siblingViolationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${siblingTransaction.transactionID}`;
            const finalOptimisticSiblingUpdate = onyxData?.optimisticData?.findLast((data) => data.key === siblingViolationsKey);
            const finalSuccessSiblingUpdate = onyxData?.successData?.findLast((data) => data.key === siblingViolationsKey);

            expect(finalOptimisticSiblingUpdate?.value).toEqual([missingCategoryViolation]);
            expect(finalSuccessSiblingUpdate?.value).toEqual([missingCategoryViolation]);
            expect(onyxData?.failureData?.find((data) => data.key === siblingViolationsKey)?.value).toEqual([siblingDuplicateViolation, missingCategoryViolation]);

            mockAPIWrite.mockRestore();
        });

        it('correctly handles undefined reportNextStep parameter', async () => {
            const mockAPIWrite = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUAction(transaction);

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
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const apiWriteCall = mockAPIWrite.mock.calls.at(0);
            const failureData = apiWriteCall?.[2]?.failureData;

            const reportFailureData = failureData?.findLast((data) => data.key === `${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`);

            expect(reportFailureData).toBeDefined();
            expect(reportFailureData?.value).toEqual({nextStep: null, pendingFields: {nextStep: null, total: null}});

            mockAPIWrite.mockRestore();
        });

        it('updates the source submitted report next step and reopens it when it becomes empty', async () => {
            const mockAPIWrite = jest.spyOn(API, 'write').mockResolvedValue(undefined);
            const buildOptimisticNextStepSpy = jest.spyOn(NextStepUtils, 'buildOptimisticNextStep');

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
                amount: -100,
                currency: CONST.CURRENCY.USD,
            });
            const oldIOUAction = createIOUAction(transaction);
            const submittedReport: Report = {
                ...createExpenseReport(6),
                reportID: FAKE_OLD_REPORT_ID,
                ownerAccountID: CURRENT_USER_ID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
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

            await loadReports();
            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: report,
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            try {
                const sourceNextStepCall = buildOptimisticNextStepSpy.mock.calls.find(([params]) => params.report?.reportID === FAKE_OLD_REPORT_ID);

                expect(sourceNextStepCall).toBeDefined();
                expect(sourceNextStepCall?.[0].predictedNextStatus).toBe(CONST.REPORT.STATUS_NUM.OPEN);

                const [, , onyxData] = TestHelper.getRequiredWriteCall(mockAPIWrite.mock.calls, 0);
                const reportKey: ReportMergeUpdate['key'] = `${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`;
                const reportUpdates = TestHelper.getRequiredOnyxUpdates(onyxData, 'optimisticData');
                const sourceReportUpdate = reportUpdates.findLast((update) => isReportMergeUpdate(update, reportKey));
                const sourceReportStateUpdate = reportUpdates.find((update) => isReportStateMergeUpdate(update, reportKey));
                if (!sourceReportUpdate || !sourceReportStateUpdate) {
                    throw new Error('Expected typed source report updates');
                }

                expect(sourceReportUpdate.value).toEqual({nextStep: {actorAccountID: 1, icon: 'hourglass', messageKey: 'waitingToAddTransactions'}, pendingFields: {nextStep: 'update'}});
                expect(sourceReportStateUpdate.value.stateNum).toBe(CONST.REPORT.STATE_NUM.OPEN);
                expect(sourceReportStateUpdate.value.statusNum).toBe(CONST.REPORT.STATUS_NUM.OPEN);
            } finally {
                buildOptimisticNextStepSpy.mockRestore();
                mockAPIWrite.mockRestore();
            }
        });

        it('correctly handles ASAP submit beta enabled when moving transactions', async () => {
            const mockAPIWrite = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUAction(transaction);

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
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const [, parameters] = TestHelper.getRequiredWriteCall(mockAPIWrite.mock.calls, 0);
            if (!isChangeTransactionsReportParams(parameters)) {
                throw new Error('Expected changeTransactionsReport API.write parameters');
            }
            expect(parameters.reportID).toBe(FAKE_NEW_REPORT_ID);
            expect(parameters.transactionList).toBe(transaction.transactionID);

            mockAPIWrite.mockRestore();
        });

        it('correctly handles different account IDs and emails when moving transactions', async () => {
            const mockAPIWrite = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUAction(transaction);

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
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const [, parameters] = TestHelper.getRequiredWriteCall(mockAPIWrite.mock.calls, 0);
            if (!isChangeTransactionsReportParams(parameters)) {
                throw new Error('Expected changeTransactionsReport API.write parameters');
            }
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
            const oldIOUAction = createIOUAction(transaction, '0', CONST.IOU.REPORT_ACTION_TYPE.TRACK);
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
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
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
            const oldIOUAction = createIOUAction(transaction, '0', CONST.IOU.REPORT_ACTION_TYPE.TRACK);
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
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
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
            const oldIOUAction = createIOUAction(transaction);
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
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
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
            const oldIOUAction = createIOUAction(transaction);
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

            await loadReports();
            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
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

        it('should reset the old report total to 0 and reopen it when moving the last same-currency expense', async () => {
            const oldExpenseReport = {
                ...createRandomReport(1, undefined),
                total: -200,
                nonReimbursableTotal: -200,
                currency: CONST.CURRENCY.USD,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const transaction = {
                ...generateTransaction({
                    reportID: oldExpenseReport.reportID,
                }),
                amount: -100,
                reimbursable: false,
            };
            const oldIOUAction = createIOUAction(transaction, FAKE_OLD_REPORT_ID);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${oldExpenseReport.reportID}`, oldExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldExpenseReport.reportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const fakeReport = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            await loadReports();
            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: fakeReport,
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
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

            expect(report?.total).toBe(0);
            expect(report?.nonReimbursableTotal).toBe(0);
            expect(report?.stateNum).toBe(CONST.REPORT.STATE_NUM.OPEN);
            expect(report?.statusNum).toBe(CONST.REPORT.STATUS_NUM.OPEN);
        });

        it('should reset the old report total to 0 when no expenses remain, even if the currency is different', async () => {
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
            const oldIOUAction = createIOUAction(transaction, FAKE_OLD_REPORT_ID);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${oldExpenseReport.reportID}`, oldExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldExpenseReport.reportID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const fakeReport = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            await loadReports();
            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: fakeReport,
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
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

            expect(report?.total).toBe(0);
            expect(report?.nonReimbursableTotal).toBe(0);
        });

        it('should reset the old report total to 0 after moving all same-currency expenses to a new report', async () => {
            const oldExpenseReport = {
                ...createRandomReport(1, undefined),
                total: -300,
                nonReimbursableTotal: -300,
                currency: CONST.CURRENCY.USD,
                transactionCount: 2,
            };
            const firstTransaction = {
                ...generateTransaction({
                    reportID: oldExpenseReport.reportID,
                }),
                amount: -100,
                reimbursable: false,
                currency: CONST.CURRENCY.USD,
            };
            const secondTransaction = {
                ...generateTransaction({
                    reportID: oldExpenseReport.reportID,
                }),
                amount: -200,
                reimbursable: false,
                currency: CONST.CURRENCY.USD,
            };
            const firstIOUAction = createIOUAction(firstTransaction, FAKE_OLD_REPORT_ID);
            const secondIOUAction = createIOUAction(secondTransaction, FAKE_OLD_REPORT_ID);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${firstTransaction.transactionID}`, firstTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${secondTransaction.transactionID}`, secondTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${oldExpenseReport.reportID}`, oldExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldExpenseReport.reportID}`, {
                [firstIOUAction.reportActionID]: firstIOUAction,
                [secondIOUAction.reportActionID]: secondIOUAction,
            });

            const fakeReport = await getReportFromUseOnyx(FAKE_NEW_REPORT_ID);
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${firstTransaction.transactionID}`]: firstTransaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${secondTransaction.transactionID}`]: secondTransaction,
            };
            await loadReports();
            changeTransactionsReport({
                transactionIDs: [firstTransaction.transactionID, secondTransaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: fakeReport,
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                isTrackIntentUser: false,
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

            expect(report?.total).toBe(0);
            expect(report?.nonReimbursableTotal).toBe(0);
        });

        it('should keep both reports stale and preserve the displayed totals for mixed-currency partial moves', async () => {
            const sourceExpenseReport = {
                ...createRandomReport(1, undefined),
                total: -6700,
                nonReimbursableTotal: 0,
                unheldNonReimbursableTotal: 0,
                currency: 'BGN',
                transactionCount: 3,
            };
            const destinationExpenseReport = {
                ...createRandomReport(2, undefined),
                total: 0,
                nonReimbursableTotal: 0,
                unheldNonReimbursableTotal: 0,
                currency: 'BGN',
                transactionCount: 0,
                pendingFields: {
                    createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            };
            const usdTransaction = {
                ...generateTransaction({
                    reportID: sourceExpenseReport.reportID,
                }),
                currency: 'USD',
                amount: -1000,
                convertedAmount: -3200,
                reimbursable: true,
            };
            const movedBgnTransaction = {
                ...generateTransaction({
                    reportID: sourceExpenseReport.reportID,
                }),
                currency: 'BGN',
                amount: -1500,
                reimbursable: true,
            };
            const remainingBgnTransaction = {
                ...generateTransaction({
                    reportID: sourceExpenseReport.reportID,
                }),
                currency: 'BGN',
                amount: -2000,
                reimbursable: true,
            };
            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${usdTransaction.transactionID}`]: usdTransaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${movedBgnTransaction.transactionID}`]: movedBgnTransaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${remainingBgnTransaction.transactionID}`]: remainingBgnTransaction,
            };
            const usdIOUAction = generateIOUAction(usdTransaction, sourceExpenseReport.reportID);
            const movedBgnIOUAction = generateIOUAction(movedBgnTransaction, sourceExpenseReport.reportID);
            const sourceIOUActions: ReportActions = {
                [usdIOUAction.reportActionID]: usdIOUAction,
                [movedBgnIOUAction.reportActionID]: movedBgnIOUAction,
            };

            mockFetch.pause();

            try {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${usdTransaction.transactionID}`, usdTransaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${movedBgnTransaction.transactionID}`, movedBgnTransaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${remainingBgnTransaction.transactionID}`, remainingBgnTransaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${sourceExpenseReport.reportID}`, sourceExpenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${destinationExpenseReport.reportID}`, destinationExpenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sourceExpenseReport.reportID}`, sourceIOUActions);

                await loadReports();
                changeTransactionsReport({
                    transactionIDs: [usdTransaction.transactionID, movedBgnTransaction.transactionID],
                    isASAPSubmitBetaEnabled: false,
                    accountID: CURRENT_USER_ID,
                    email: 'test@example.com',
                    newReport: destinationExpenseReport,
                    policy: undefined,
                    allTransactions,
                    policyTagList: undefined,
                    reports,
                    transactionViolations: {},
                    isTrackIntentUser: false,
                });

                await waitForBatchedUpdates();

                const sourceReportKey = `${ONYXKEYS.COLLECTION.REPORT}${sourceExpenseReport.reportID}` as const;
                const destinationReportKey = `${ONYXKEYS.COLLECTION.REPORT}${destinationExpenseReport.reportID}` as const;
                const updatedSourceReport = await getOnyxValue(sourceReportKey);
                const updatedDestinationReport = await getOnyxValue(destinationReportKey);

                expect(updatedSourceReport?.total).toBe(sourceExpenseReport.total);
                expect(updatedDestinationReport?.total).toBe(destinationExpenseReport.total);
                expect(updatedSourceReport?.pendingFields).toMatchObject({
                    total: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                });
                expect(updatedDestinationReport?.pendingFields).toMatchObject({
                    createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    total: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                });
                expect(updatedSourceReport?.pendingFields).not.toHaveProperty('preview');
                expect(updatedDestinationReport?.pendingFields).not.toHaveProperty('preview');
            } finally {
                await mockFetch.resume();
            }
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
                policyCategories,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });

            await waitForBatchedUpdates();

            const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${newOpenReport.reportID}`);
            expect(report?.nextStep?.messageKey).toEqual(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT);
        });

        it('should decrement source and increment destination transactionCount on cross-currency move', async () => {
            const sourceReportID = '901';
            const destinationReportID = '902';
            const transaction = generateTransaction({reportID: sourceReportID, currency: 'CAD'});

            const sourceReport: Report = {
                ...createExpenseReport(Number(sourceReportID)),
                reportID: sourceReportID,
                ownerAccountID: CURRENT_USER_ID,
                currency: 'USD',
                transactionCount: 1,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };
            const destinationReport: Report = {
                ...createExpenseReport(Number(destinationReportID)),
                reportID: destinationReportID,
                ownerAccountID: CURRENT_USER_ID,
                currency: 'EUR',
                transactionCount: 0,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${sourceReportID}`, sourceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${destinationReportID}`, destinationReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            await loadReports();
            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@gmail.com',
                newReport: destinationReport,
                policy: undefined,
                policyCategories: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });

            await waitForBatchedUpdates();

            const updatedSourceReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${sourceReportID}`);
            const updatedDestinationReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${destinationReportID}`);

            expect(updatedSourceReport?.transactionCount).toBe(0);
            expect(updatedDestinationReport?.transactionCount).toBe(1);
        });

        it('should correctly accumulate report totals when moving multiple transactions in a single batch', async () => {
            const expenseReport = {
                ...createRandomReport(1, undefined),
                total: 0,
                nonReimbursableTotal: 0,
                currency: CONST.CURRENCY.USD,
            };
            const transaction1 = {
                ...generateTransaction({reportID: FAKE_OLD_REPORT_ID}),
                amount: -100,
                currency: CONST.CURRENCY.USD,
                reimbursable: false,
            };
            const transaction2 = {
                ...generateTransaction({reportID: FAKE_OLD_REPORT_ID}),
                amount: -200,
                currency: CONST.CURRENCY.USD,
                reimbursable: false,
            };
            const oldIOUAction1 = createIOUAction(transaction1);
            const oldIOUAction2 = createIOUAction(transaction2);

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`, transaction2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {
                [oldIOUAction1.reportActionID]: oldIOUAction1,
                [oldIOUAction2.reportActionID]: oldIOUAction2,
            });

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
            };

            changeTransactionsReport({
                transactionIDs: [transaction1.transactionID, transaction2.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: expenseReport,
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
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

            expect(report?.total).toBe(expenseReport.total + transaction1.amount + transaction2.amount);
            expect(report?.nonReimbursableTotal).toBe(expenseReport.nonReimbursableTotal + transaction1.amount + transaction2.amount);
        });

        it('should not call API.write when the transaction is already on the target report', async () => {
            const mockAPIWrite = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            const transaction = generateTransaction({
                reportID: FAKE_NEW_REPORT_ID,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

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
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).not.toHaveBeenCalled();
            mockAPIWrite.mockRestore();
        });

        it('should clear transaction violations when moving to unreported report', async () => {
            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction = createIOUAction(transaction);
            const violations: TransactionViolation[] = [
                {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: 'violation'},
                {name: CONST.VIOLATIONS.RTER, type: 'warning'},
            ];

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`, violations);

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: undefined,
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`);
            expect(updatedViolations).toBeFalsy();
        });

        it('should clear convertedAmount on transaction when moving between workspaces with different currencies', async () => {
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
            const oldIOUAction = createIOUAction(transaction);
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
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(updatedTransaction?.convertedAmount).toBeFalsy();
        });

        it('should add missingTag violation when moving to a paid policy with a single-level required tag and the transaction has no tag', async () => {
            const policyID = '77';
            const transaction = generateTransaction({reportID: FAKE_OLD_REPORT_ID});
            const oldIOUAction = createIOUAction(transaction);
            const newExpenseReport = {
                ...createExpenseReport(Number(FAKE_NEW_REPORT_ID)),
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ID,
            };
            const policy = {
                ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
                requiresTag: true,
            };
            const policyTagList: PolicyTagLists = {
                Department: {
                    name: 'Department',
                    required: true,
                    orderWeight: 0,
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                        Sales: {name: 'Sales', enabled: true},
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                policy,
                allTransactions,
                policyTagList,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`);
            expect(updatedViolations?.some((violation) => violation.name === CONST.VIOLATIONS.MISSING_TAG)).toBe(true);

            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`);
            expect(updatedReport?.nextStep?.messageKey).not.toBe(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES);
        });

        it('should not show fix issues next step when moving a transaction with a receiptNotSmartScanned notice', async () => {
            const policyID = '78';
            const transaction = generateTransaction({reportID: FAKE_OLD_REPORT_ID});
            const oldIOUAction = createIOUAction(transaction);
            const receiptNoticeViolation: TransactionViolation = {
                name: CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
                type: CONST.VIOLATION_TYPES.NOTICE,
            };
            const newExpenseReport = {
                ...createExpenseReport(Number(FAKE_NEW_REPORT_ID)),
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ID,
            };
            const policy = createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM);

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`, [receiptNoticeViolation]);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await waitForBatchedUpdates();

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                policy,
                allTransactions,
                policyTagList: undefined,
                transactionViolations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [receiptNoticeViolation]},
                reports,
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`);
            expect(updatedViolations).toContainEqual(receiptNoticeViolation);

            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`);
            expect(updatedReport?.nextStep?.messageKey).not.toBe(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES);
        });

        it('should add a missingTag violation per tag list when moving to a paid policy with dependent multi-level tags and the transaction has no tag', async () => {
            const policyID = '88';
            const transaction = generateTransaction({reportID: FAKE_OLD_REPORT_ID});
            const oldIOUAction = createIOUAction(transaction);
            const newExpenseReport = {
                ...createExpenseReport(Number(FAKE_NEW_REPORT_ID)),
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ID,
            };
            const policy = {
                ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
                requiresTag: true,
                hasMultipleTagLists: true,
            };
            const policyTagList: PolicyTagLists = {
                Region: {
                    name: 'Region',
                    required: true,
                    orderWeight: 0,
                    tags: {
                        California: {name: 'California', enabled: true},
                    },
                },
                City: {
                    name: 'City',
                    required: true,
                    orderWeight: 1,
                    tags: {
                        SanFrancisco: {name: 'San Francisco', enabled: true, rules: {parentTagsFilter: '^California$'}},
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                policy,
                allTransactions,
                policyTagList,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`);
            const missingTagViolations = updatedViolations?.filter((violation) => violation.name === CONST.VIOLATIONS.MISSING_TAG) ?? [];
            expect(missingTagViolations).toHaveLength(2);
            expect(missingTagViolations.some((violation) => violation.data?.tagName === 'Region')).toBe(true);
            expect(missingTagViolations.some((violation) => violation.data?.tagName === 'City')).toBe(true);
        });

        it('removes AUTO_REPORTED_REJECTED_EXPENSE from transaction violations when moving to a paid group policy', async () => {
            const policyID = '1001';
            const transaction = generateTransaction({reportID: FAKE_OLD_REPORT_ID});
            const oldIOUAction = createIOUAction(transaction);
            const newExpenseReport = {
                ...createExpenseReport(Number(FAKE_NEW_REPORT_ID)),
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ID,
            };
            const policy: Policy = {
                ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
                requiresTag: false,
                requiresCategory: false,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`, [
                {name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true},
            ]);
            await waitForBatchedUpdates();

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                policy,
                allTransactions,
                policyTagList: {},
                reports,
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`);
            expect(updatedViolations?.some((violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)).toBe(false);
        });

        it('should auto-select a valid distance rate when moving a distance expense with an invalid P2P rate to a workspace', async () => {
            const policyID = '100';
            const validRateID = 'valid_rate_1';
            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
                amount: -500,
                currency: 'USD',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
            });
            const oldIOUAction = createIOUAction(transaction);

            const newExpenseReport = {
                ...createExpenseReport(Number(FAKE_NEW_REPORT_ID)),
                reportID: FAKE_NEW_REPORT_ID,
                policyID,
                ownerAccountID: CURRENT_USER_ID,
                currency: 'USD',
            };
            const policy = {
                ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
                id: policyID,
                outputCurrency: 'USD',
                customUnits: {
                    distanceUnit: {
                        attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                        customUnitID: 'distanceUnit',
                        defaultCategory: '',
                        enabled: true,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        rates: {
                            [validRateID]: {
                                currency: 'USD',
                                customUnitRateID: validRateID,
                                enabled: true,
                                name: 'Default Rate',
                                rate: 6550,
                            },
                        },
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, newExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                policy,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`);
            expect(updatedTransaction?.comment?.customUnit?.customUnitRateID).toBe(validRateID);
            expect(updatedTransaction?.comment?.customUnit?.defaultP2PRate).toBeUndefined();
        });

        it('should auto-select a valid distance rate when the current rate is disabled on the destination workspace', async () => {
            const policyID = '101';
            const disabledRateID = 'disabled_rate';
            const enabledRateID = 'enabled_rate';
            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
                amount: -500,
                currency: 'USD',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        customUnitRateID: disabledRateID,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
            });
            const oldIOUAction = createIOUAction(transaction);

            const newExpenseReport = {
                ...createExpenseReport(Number(FAKE_NEW_REPORT_ID)),
                reportID: FAKE_NEW_REPORT_ID,
                policyID,
                ownerAccountID: CURRENT_USER_ID,
                currency: 'USD',
            };
            const policy = {
                ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
                id: policyID,
                outputCurrency: 'USD',
                customUnits: {
                    distanceUnit: {
                        attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                        customUnitID: 'distanceUnit',
                        defaultCategory: '',
                        enabled: true,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        rates: {
                            [disabledRateID]: {
                                currency: 'USD',
                                customUnitRateID: disabledRateID,
                                enabled: false,
                                name: 'Old Rate',
                                rate: 5000,
                            },
                            [enabledRateID]: {
                                currency: 'USD',
                                customUnitRateID: enabledRateID,
                                enabled: true,
                                name: 'Default Rate',
                                rate: 6550,
                            },
                        },
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, newExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                policy,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`);
            expect(updatedTransaction?.comment?.customUnit?.customUnitRateID).toBe(enabledRateID);
        });

        it('should not generate CUSTOM_UNIT_OUT_OF_POLICY violation when auto-selecting a valid rate during move', async () => {
            const policyID = '102';
            const validRateID = 'workspace_rate';
            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
                amount: -500,
                currency: 'USD',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
            });
            const oldIOUAction = createIOUAction(transaction);

            const newExpenseReport = {
                ...createExpenseReport(Number(FAKE_NEW_REPORT_ID)),
                reportID: FAKE_NEW_REPORT_ID,
                policyID,
                ownerAccountID: CURRENT_USER_ID,
                currency: 'USD',
            };
            const policy = {
                ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
                id: policyID,
                outputCurrency: 'USD',
                customUnits: {
                    distanceUnit: {
                        attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                        customUnitID: 'distanceUnit',
                        defaultCategory: '',
                        enabled: true,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        rates: {
                            [validRateID]: {
                                currency: 'USD',
                                customUnitRateID: validRateID,
                                enabled: true,
                                name: 'Default Rate',
                                rate: 6550,
                            },
                        },
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, newExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                policy,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`);
            const customUnitViolations = updatedViolations?.filter((v) => v.name === CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY) ?? [];
            expect(customUnitViolations).toHaveLength(0);
        });

        it('should not change the rate when moving a distance expense with a valid rate to a workspace', async () => {
            const policyID = '103';
            const validRateID = 'already_valid_rate';
            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
                amount: -500,
                currency: 'USD',
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        customUnitRateID: validRateID,
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
            });
            const oldIOUAction = createIOUAction(transaction);

            const newExpenseReport = {
                ...createExpenseReport(Number(FAKE_NEW_REPORT_ID)),
                reportID: FAKE_NEW_REPORT_ID,
                policyID,
                ownerAccountID: CURRENT_USER_ID,
                currency: 'USD',
            };
            const policy = {
                ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
                id: policyID,
                outputCurrency: 'USD',
                customUnits: {
                    distanceUnit: {
                        attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                        customUnitID: 'distanceUnit',
                        defaultCategory: '',
                        enabled: true,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        rates: {
                            [validRateID]: {
                                currency: 'USD',
                                customUnitRateID: validRateID,
                                enabled: true,
                                name: 'Default Rate',
                                rate: 6550,
                            },
                        },
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, newExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            const allTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };

            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled: false,
                accountID: CURRENT_USER_ID,
                email: 'test@example.com',
                newReport: newExpenseReport,
                policy,
                allTransactions,
                policyTagList: undefined,
                reports,
                transactionViolations: {},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`);
            // Rate should remain unchanged since it was already valid
            expect(updatedTransaction?.comment?.customUnit?.customUnitRateID).toBe(validRateID);
        });

        it('should not create MOVED_TRANSACTION action when moving expenses from a Draft report', async () => {
            const mockAPIWrite = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            const draftReport = {
                ...createRandomReport(10, undefined),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                currency: CONST.CURRENCY.USD,
            };
            const transaction = generateTransaction({reportID: draftReport.reportID});
            const oldIOUAction = createIOUAction(transaction);

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
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                transactionViolations: {},
                reports: {[`${ONYXKEYS.COLLECTION.REPORT}${draftReport.reportID}`]: draftReport},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const parameters = mockAPIWrite.mock.calls.at(0)?.[1];
            const transactionData = parseJSONRecord(readProperty(parameters, 'transactionIDToReportActionAndThreadData'));

            expect(hasDefinedProperty(transactionData[transaction.transactionID], 'movedReportActionID')).toBe(false);

            mockAPIWrite.mockRestore();
        });

        it('should create MOVED_TRANSACTION action when moving expenses from a non-Draft report', async () => {
            const mockAPIWrite = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            const submittedReport = {
                ...createRandomReport(11, undefined),
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                currency: CONST.CURRENCY.USD,
            };
            const transaction = generateTransaction({reportID: submittedReport.reportID});
            const oldIOUAction = createIOUAction(transaction);

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
                policy: undefined,
                allTransactions,
                policyTagList: undefined,
                transactionViolations: {},
                reports: {[`${ONYXKEYS.COLLECTION.REPORT}${submittedReport.reportID}`]: submittedReport},
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            expect(mockAPIWrite).toHaveBeenCalled();

            const parameters = mockAPIWrite.mock.calls.at(0)?.[1];
            const transactionData = parseJSONRecord(readProperty(parameters, 'transactionIDToReportActionAndThreadData'));

            expect(hasDefinedProperty(transactionData[transaction.transactionID], 'movedReportActionID')).toBe(true);

            mockAPIWrite.mockRestore();
        });
    });
    /* eslint-enable rulesdir/no-multiple-api-calls */

    describe('getAllNonDeletedTransactions', () => {
        it('returns the transaction when it has a pending delete action and is offline', () => {
            const transaction = generateTransaction({
                reportID: '1',
            });
            const IOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                reportID: FAKE_OLD_REPORT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
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

        it('should clear the selected route key so it does not point at a route that no longer exists', async () => {
            const transactionID = 'txn6';
            const index = '0';
            const waypoint: RecentWaypoint = {
                address: 'Clear Selected Route',
                lat: 9,
                lng: 10,
            };
            const existingTransaction = generateTransaction({transactionID, reportID: '1'});
            existingTransaction.comment = {
                ...existingTransaction.comment,
                selectedRouteKey: 'route1',
                customUnit: {...existingTransaction.comment?.customUnit, routeDistanceMeters: 200},
            };
            existingTransaction.routes = {
                route0: {distance: 100, geometry: {coordinates: [[0, 0]]}},
                route1: {distance: 200, geometry: {coordinates: [[1, 1]]}},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, existingTransaction);

            saveWaypoint({transactionID, index, waypoint, isDraft: false, recentWaypointsList: []});
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transaction?.comment?.selectedRouteKey ?? null).toBeNull();

            // The route distance belongs to the old waypoints, so it must not survive to be distance-matched
            // against the refetched routes — otherwise the selection would jump to a route the user never picked.
            expect(transaction?.comment?.customUnit?.routeDistanceMeters ?? null).toBeNull();
            expect(
                TransactionUtils.getSelectedRouteKey({
                    ...existingTransaction,
                    comment: transaction?.comment,
                    routes: {route0: {distance: 500, geometry: {coordinates: [[0, 0]]}}, route1: {distance: 200, geometry: {coordinates: [[1, 1]]}}},
                }),
            ).toBe(CONST.TRANSACTION.DEFAULT_ROUTE_KEY);
        });
    });

    describe('removeWaypoint', () => {
        it('should clear the selected route key when the removed waypoint invalidates the route', async () => {
            const transactionID = 'txn7';
            const existingTransaction = generateTransaction({transactionID, reportID: '1'});
            existingTransaction.comment = {
                ...existingTransaction.comment,
                selectedRouteKey: 'route1',
                customUnit: {...existingTransaction.comment?.customUnit, routeDistanceMeters: 200},
                waypoints: {
                    waypoint0: {address: 'A', lat: 1, lng: 1},
                    waypoint1: {address: 'B', lat: 2, lng: 2},
                    waypoint2: {address: 'C', lat: 3, lng: 3},
                },
            };
            existingTransaction.routes = {
                route0: {distance: 100, geometry: {coordinates: [[0, 0]]}},
                route1: {distance: 200, geometry: {coordinates: [[1, 1]]}},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, existingTransaction);

            await removeWaypoint(existingTransaction, '1');
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transaction?.comment?.selectedRouteKey ?? null).toBeNull();
            expect(transaction?.comment?.customUnit?.routeDistanceMeters ?? null).toBeNull();
        });
    });

    describe('setSelectedRoute', () => {
        const ROUTE0_DISTANCE_METERS = 16093.44; // 10 mi
        const ROUTE1_DISTANCE_METERS = 32186.88; // 20 mi

        function buildRoutedTransaction(transactionID: string, distanceUnit?: Unit) {
            const transaction = generateTransaction({transactionID, reportID: '1'});
            transaction.comment = {
                ...transaction.comment,
                selectedRouteKey: CONST.TRANSACTION.DEFAULT_ROUTE_KEY,
                customUnit: {
                    ...transaction.comment?.customUnit,
                    quantity: 10,
                    routeDistanceMeters: ROUTE0_DISTANCE_METERS,
                    ...(distanceUnit ? {distanceUnit} : {}),
                },
            };
            transaction.routes = {
                route0: {distance: ROUTE0_DISTANCE_METERS, geometry: {coordinates: [[0, 0]]}},
                route1: {distance: ROUTE1_DISTANCE_METERS, geometry: {coordinates: [[1, 1]]}},
            };
            return transaction;
        }

        it.each([
            [CONST.TRANSACTION.STATE.CURRENT, ONYXKEYS.COLLECTION.TRANSACTION],
            [CONST.TRANSACTION.STATE.DRAFT, ONYXKEYS.COLLECTION.TRANSACTION_DRAFT],
            [CONST.TRANSACTION.STATE.SPLIT_DRAFT, ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT],
        ] as const)('writes the quantity of the newly selected route to the %s transaction', async (transactionState, keyPrefix) => {
            const transactionID = `selectedRoute_${transactionState}`;
            const existingTransaction = buildRoutedTransaction(transactionID);
            await Onyx.merge(`${keyPrefix}${transactionID}`, existingTransaction);

            await setSelectedRoute(transactionID, CONST.TRANSACTION.ALTERNATE_ROUTE_KEY, ROUTE1_DISTANCE_METERS, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, transactionState);
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${keyPrefix}${transactionID}`);
            expect(transaction?.comment?.selectedRouteKey).toBe(CONST.TRANSACTION.ALTERNATE_ROUTE_KEY);
            expect(transaction?.comment?.customUnit?.quantity).toBe(20);
            expect(transaction?.comment?.customUnit?.routeDistanceMeters).toBe(ROUTE1_DISTANCE_METERS);
        });

        it('makes the displayed distance follow the newly selected route instead of the stale quantity', async () => {
            const transactionID = 'selectedRoute_distance';
            const existingTransaction = buildRoutedTransaction(transactionID);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, existingTransaction);

            await setSelectedRoute(transactionID, CONST.TRANSACTION.ALTERNATE_ROUTE_KEY, ROUTE1_DISTANCE_METERS, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(TransactionUtils.getDistanceInMeters(transaction, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBeCloseTo(ROUTE1_DISTANCE_METERS, 1);

            expect(TransactionUtils.hasManualDistanceOverride(transaction)).toBe(false);
        });

        it('overwrites a manually typed distance override', async () => {
            const transactionID = 'selectedRoute_override';
            const existingTransaction = buildRoutedTransaction(transactionID);
            existingTransaction.comment = {...existingTransaction.comment, customUnit: {...existingTransaction.comment?.customUnit, quantity: 999}};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, existingTransaction);

            await setSelectedRoute(transactionID, CONST.TRANSACTION.ALTERNATE_ROUTE_KEY, ROUTE1_DISTANCE_METERS, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transaction?.comment?.customUnit?.quantity).toBe(20);
        });

        it("converts using the transaction's own distance unit", async () => {
            const transactionID = 'selectedRoute_km';
            const existingTransaction = buildRoutedTransaction(transactionID, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, existingTransaction);

            await setSelectedRoute(transactionID, CONST.TRANSACTION.ALTERNATE_ROUTE_KEY, ROUTE1_DISTANCE_METERS, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transaction?.comment?.customUnit?.quantity).toBe(32.19);
        });

        it('only writes the selected route key when the route has no distance', async () => {
            const transactionID = 'selectedRoute_noDistance';
            const existingTransaction = buildRoutedTransaction(transactionID);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, existingTransaction);

            await setSelectedRoute(transactionID, CONST.TRANSACTION.ALTERNATE_ROUTE_KEY, undefined, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transaction?.comment?.selectedRouteKey).toBe(CONST.TRANSACTION.ALTERNATE_ROUTE_KEY);
            expect(transaction?.comment?.customUnit?.quantity).toBe(10);
            expect(transaction?.comment?.customUnit?.routeDistanceMeters).toBe(ROUTE0_DISTANCE_METERS);
        });

        it('only writes the selected route key when the distance unit is unknown', async () => {
            const transactionID = 'selectedRoute_noUnit';
            const existingTransaction = buildRoutedTransaction(transactionID);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, existingTransaction);

            await setSelectedRoute(transactionID, CONST.TRANSACTION.ALTERNATE_ROUTE_KEY, ROUTE1_DISTANCE_METERS, undefined);
            await waitForBatchedUpdates();

            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transaction?.comment?.selectedRouteKey).toBe(CONST.TRANSACTION.ALTERNATE_ROUTE_KEY);
            expect(transaction?.comment?.customUnit?.quantity).toBe(10);
        });
    });

    describe('sanitizeWaypointsForAPI', () => {
        it('should only include allowed fields (name, address, lat, lng)', () => {
            // Given waypoints with extra fields that should be stripped out
            const waypointsWithExtraFields = {
                waypoint0: {
                    name: 'Start Location',
                    address: '123 Main St',
                    lat: 40.7128,
                    lng: -74.006,
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'US',
                    street: '123 Main St',
                    street2: 'Apt 4B',
                    keyForList: 'unique-key-1',
                    pendingAction: 'add',
                    extraField: 'should be removed',
                },
                waypoint1: {
                    address: '456 Oak Ave',
                    lat: 40.7589,
                    lng: -73.9851,
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10002',
                    keyForList: 'unique-key-2',
                    anotherExtraField: 'should also be removed',
                },
            };

            // When sanitizing the waypoints
            // Test intentionally passes extra fields not in WaypointCollection to verify they are stripped
            const sanitizedWaypoints = sanitizeWaypointsForAPI(waypointsWithExtraFields);

            // Then only allowed fields should remain
            expect(sanitizedWaypoints.waypoint0).toEqual({
                name: 'Start Location',
                address: '123 Main St',
                lat: 40.7128,
                lng: -74.006,
            });

            // waypoint1 has no name field, so it should not be included
            expect(sanitizedWaypoints.waypoint1).toEqual({
                address: '456 Oak Ave',
                lat: 40.7589,
                lng: -73.9851,
            });
        });

        it('should handle waypoints with only some allowed fields', () => {
            // Given waypoints with only address
            const waypointsWithPartialFields = {
                waypoint0: {
                    address: 'Partial Address Only',
                },
            };

            // When sanitizing the waypoints
            // Test uses a partial waypoint object to verify sanitization handles missing fields
            const sanitizedWaypoints = sanitizeWaypointsForAPI(waypointsWithPartialFields);

            // Then only the address should be present
            expect(sanitizedWaypoints.waypoint0).toEqual({
                address: 'Partial Address Only',
            });
        });

        it('should handle empty waypoints', () => {
            // Given empty waypoints
            const emptyWaypoints = {};

            // When sanitizing the waypoints
            const sanitizedWaypoints = sanitizeWaypointsForAPI(emptyWaypoints);

            // Then the result should also be empty
            expect(sanitizedWaypoints).toEqual({});
        });

        it('should skip null waypoint entries without crashing', () => {
            // Given waypoints where some entries are null (can happen during rollback of failed distance edits)
            const waypointsWithNulls = {
                waypoint0: {
                    address: '123 Main St',
                    lat: 40.7128,
                    lng: -74.006,
                },
                waypoint1: null,
                waypoint2: {
                    address: '789 Pine Rd',
                    lat: 40.73,
                    lng: -73.99,
                },
            };

            // When sanitizing the waypoints
            // Null entries can occur at runtime even though WaypointCollection type doesn't include null
            // @ts-expect-error -- rollback data can contain null waypoint entries even though the production collection type excludes null.
            const sanitizedWaypoints = sanitizeWaypointsForAPI(waypointsWithNulls);

            // Then null entries should be dropped and valid entries sanitized
            expect(sanitizedWaypoints).toEqual({
                waypoint0: {
                    address: '123 Main St',
                    lat: 40.7128,
                    lng: -74.006,
                },
                waypoint2: {
                    address: '789 Pine Rd',
                    lat: 40.73,
                    lng: -73.99,
                },
            });
            expect(sanitizedWaypoints.waypoint1).toBeUndefined();
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
                reportID: FAKE_OLD_REPORT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: threadReportID,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
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
                currentTransactionViolations: [{transactionID, violations: mockViolations}],
                isTrackIntentUser: false,
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
                reportID: FAKE_OLD_REPORT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: threadReportID,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
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
                currentTransactionViolations: [{transactionID, violations: mockViolations}],
                isTrackIntentUser: false,
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

        it('should preserve an existing hold when optimistic dismissal is built from a stale transaction snapshot', async () => {
            const transactionID = 'dismissTxnHold';
            const threadReportID = 'threadDismissHold';
            const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
            const testerEmail = 'tester@example.com';
            const mockViolations: TransactionViolation[] = [{name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: 'warning'}];

            mockFetch.pause();

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, mockViolations);

            const transactionInOnyx = generateTransaction({
                transactionID,
                reportID: FAKE_OLD_REPORT_ID,
                comment: {
                    hold: 'holdReportActionID',
                    dismissedViolations: {
                        [CONST.VIOLATIONS.SMARTSCAN_FAILED]: {
                            owner: 123,
                        },
                    },
                },
            });
            await Onyx.merge(transactionKey, transactionInOnyx);

            const staleTransaction = {
                ...transactionInOnyx,
                comment: {
                    dismissedViolations: {
                        [CONST.VIOLATIONS.SMARTSCAN_FAILED]: {
                            owner: 123,
                        },
                    },
                    hold: undefined,
                },
            } as Transaction;

            const iouAction = {
                reportActionID: rand64(),
                reportID: FAKE_OLD_REPORT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: threadReportID,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUTransactionID: transactionID,
                    amount: transactionInOnyx.amount,
                    currency: transactionInOnyx.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[iouAction.reportActionID]: iouAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, {});

            mockFetch.fail();

            dismissDuplicateTransactionViolation({
                transactionIDs: [transactionID],
                dismissedPersonalDetails: {login: testerEmail, accountID: CURRENT_USER_ID},
                expenseReport: newReport,
                policy: undefined,
                isASAPSubmitBetaEnabled: false,
                allTransactions: {[transactionKey]: staleTransaction},
                currentTransactionViolations: [{transactionID, violations: mockViolations}],
                isTrackIntentUser: false,
            });
            await waitForBatchedUpdates();

            const optimisticTransaction = await getOnyxValue(transactionKey);
            const duplicateDismissals = optimisticTransaction?.comment?.dismissedViolations?.[CONST.VIOLATIONS.DUPLICATED_TRANSACTION];
            expect(optimisticTransaction?.comment?.hold).toBe('holdReportActionID');
            expect(optimisticTransaction?.comment?.dismissedViolations?.[CONST.VIOLATIONS.SMARTSCAN_FAILED]).toEqual({owner: 123});
            expect(duplicateDismissals?.[testerEmail]).toEqual(expect.any(Number));

            await mockFetch.resume();
            await waitForBatchedUpdates();

            const revertedTransaction = await getOnyxValue(transactionKey);
            expect(revertedTransaction?.comment?.hold).toBe('holdReportActionID');
            expect(revertedTransaction?.comment?.dismissedViolations?.[CONST.VIOLATIONS.SMARTSCAN_FAILED]).toEqual({owner: 123});
            expect(revertedTransaction?.comment?.dismissedViolations?.[CONST.VIOLATIONS.DUPLICATED_TRANSACTION]).toBeUndefined();
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
                isTrackIntentUser: false,
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
                    reportID: FAKE_OLD_REPORT_ID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    childReportID: threadReportID,
                    actorAccountID: CURRENT_USER_ID,
                    created: DateUtils.getDBTime(),
                    originalMessage: {
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
                        currentTransactionViolations: [{transactionID, violations: mockViolations}],
                        isTrackIntentUser: false,
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

describe('removeTransactionFromDuplicateTransactionViolation', () => {
    const TXN_A = 'txn_a';
    const TXN_B = 'txn_b';

    function makeDuplicateViolation(duplicates: string[]): TransactionViolation {
        return {
            name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            data: {duplicates},
        };
    }

    function makeCategoryViolation(): TransactionViolation {
        return {
            name: CONST.VIOLATIONS.MISSING_CATEGORY,
            type: CONST.VIOLATION_TYPES.VIOLATION,
        };
    }

    function makeTransactionCollection(...ids: string[]) {
        const collection: Record<string, Transaction> = {};
        for (const id of ids) {
            collection[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`] = createMock<Transaction>({transactionID: id});
        }
        return collection;
    }

    it('should push successData that re-applies cleaned partner violations', () => {
        const onyxData: OnyxData<UpdateMoneyRequestDataKeys> = {optimisticData: [], successData: [], failureData: []};

        const TXN_C = 'txn_c';
        const transactionViolations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_A}`]: [makeDuplicateViolation([TXN_B])],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_B}`]: [makeDuplicateViolation([TXN_A, TXN_C])],
        };

        TransactionUtils.removeTransactionFromDuplicateTransactionViolation(onyxData, TXN_A, makeTransactionCollection(TXN_A, TXN_B, TXN_C), transactionViolations);

        expect(onyxData.successData?.length).toBe(1);
        const successEntry = onyxData.successData?.at(0);
        expect(successEntry?.key).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_B}`);
        expect(successEntry?.value).toEqual([
            {
                ...makeDuplicateViolation([TXN_A, TXN_C]),
                data: {duplicates: [TXN_C]},
            },
        ]);
    });

    it('should have matching optimistic and success data values', () => {
        const onyxData: OnyxData<UpdateMoneyRequestDataKeys> = {optimisticData: [], successData: [], failureData: []};

        const transactionViolations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_A}`]: [makeDuplicateViolation([TXN_B])],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_B}`]: [makeDuplicateViolation([TXN_A])],
        };

        TransactionUtils.removeTransactionFromDuplicateTransactionViolation(onyxData, TXN_A, makeTransactionCollection(TXN_A, TXN_B), transactionViolations);

        expect(onyxData.optimisticData?.length).toBe(1);
        expect(onyxData.successData?.length).toBe(1);

        const optimisticEntry = onyxData.optimisticData?.at(0);
        const successEntry = onyxData.successData?.at(0);
        expect(optimisticEntry?.key).toBe(successEntry?.key);
        expect(optimisticEntry?.value).toEqual(successEntry?.value);
    });

    it('should set successData value to null when removing the last duplicate reference', () => {
        const onyxData: OnyxData<UpdateMoneyRequestDataKeys> = {optimisticData: [], successData: [], failureData: []};

        const transactionViolations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_A}`]: [makeDuplicateViolation([TXN_B])],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_B}`]: [makeDuplicateViolation([TXN_A])],
        };

        TransactionUtils.removeTransactionFromDuplicateTransactionViolation(onyxData, TXN_A, makeTransactionCollection(TXN_A, TXN_B), transactionViolations);

        const successEntry = onyxData.successData?.at(0);
        expect(successEntry?.value).toBeNull();
    });

    it('should preserve failureData for rollback with original violations', () => {
        const onyxData: OnyxData<UpdateMoneyRequestDataKeys> = {optimisticData: [], successData: [], failureData: []};

        const originalBViolations = [makeDuplicateViolation([TXN_A]), makeCategoryViolation()];
        const transactionViolations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_A}`]: [makeDuplicateViolation([TXN_B])],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_B}`]: originalBViolations,
        };

        TransactionUtils.removeTransactionFromDuplicateTransactionViolation(onyxData, TXN_A, makeTransactionCollection(TXN_A, TXN_B), transactionViolations);

        expect(onyxData.failureData?.length).toBe(1);
        const failureEntry = onyxData.failureData?.at(0);
        expect(failureEntry?.key).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_B}`);
        expect(failureEntry?.value).toEqual(originalBViolations);
    });

    it('should preserve non-duplicate violations on partner when cleaning duplicate reference', () => {
        const onyxData: OnyxData<UpdateMoneyRequestDataKeys> = {optimisticData: [], successData: [], failureData: []};

        const transactionViolations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_A}`]: [makeDuplicateViolation([TXN_B])],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_B}`]: [makeDuplicateViolation([TXN_A]), makeCategoryViolation()],
        };

        TransactionUtils.removeTransactionFromDuplicateTransactionViolation(onyxData, TXN_A, makeTransactionCollection(TXN_A, TXN_B), transactionViolations);

        const successEntry = onyxData.successData?.at(0);
        expect(successEntry?.value).toEqual([makeCategoryViolation()]);

        const optimisticEntry = onyxData.optimisticData?.at(0);
        expect(optimisticEntry?.value).toEqual([makeCategoryViolation()]);
    });

    it('should not push any data when successData array is undefined', () => {
        const onyxData: OnyxData<UpdateMoneyRequestDataKeys> = {
            optimisticData: [],
            failureData: [],
        };

        const transactionViolations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_A}`]: [makeDuplicateViolation([TXN_B])],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TXN_B}`]: [makeDuplicateViolation([TXN_A])],
        };

        TransactionUtils.removeTransactionFromDuplicateTransactionViolation(onyxData, TXN_A, makeTransactionCollection(TXN_A, TXN_B), transactionViolations);

        expect(onyxData.optimisticData?.length).toBe(1);
        expect(onyxData.successData).toBeUndefined();
    });
});
