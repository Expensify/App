import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import useTransactionViolationOfWorkspace from '../../src/hooks/useTransactionViolationOfWorkspace';
import ONYXKEYS from '../../src/ONYXKEYS';
import type {Report, TransactionViolations} from '../../src/types/onyx';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = 'policy1';
const IOU_REPORT_ID = '100';
const CHAT_REPORT_ID = '200';

function createPolicyExpenseChat(reportID: string, policyID: string, iouReportID: string): Report {
    return {
        reportID,
        policyID,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        type: CONST.REPORT.TYPE.CHAT,
        iouReportID,
        isOwnPolicyExpenseChat: true,
    } as Report;
}

describe('useTransactionViolationOfWorkspace', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('returns transaction violations for transactions belonging to workspace reports', async () => {
        const chatReport = createPolicyExpenseChat(CHAT_REPORT_ID, POLICY_ID, IOU_REPORT_ID);
        const transaction = {
            ...createRandomTransaction(1),
            reportID: IOU_REPORT_ID,
            transactionID: 'txn1',
        };
        const violations: TransactionViolations = [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}];

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`, violations);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTransactionViolationOfWorkspace(POLICY_ID));

        expect(result.current.reportsToArchive.length).toBe(1);
        expect(result.current.reportsToArchive.at(0)?.reportID).toBe(CHAT_REPORT_ID);
        expect(result.current.transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]).toEqual(violations);
    });

    it('excludes transactions not belonging to workspace reports', async () => {
        const chatReport = createPolicyExpenseChat(CHAT_REPORT_ID, POLICY_ID, IOU_REPORT_ID);
        const matchingTransaction = {
            ...createRandomTransaction(1),
            reportID: IOU_REPORT_ID,
            transactionID: 'txn1',
        };
        const unrelatedTransaction = {
            ...createRandomTransaction(2),
            reportID: '999',
            transactionID: 'txn2',
        };
        const matchingViolations: TransactionViolations = [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}];
        const unrelatedViolations: TransactionViolations = [{name: CONST.VIOLATIONS.MISSING_TAG, type: CONST.VIOLATION_TYPES.VIOLATION}];

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${matchingTransaction.transactionID}`, matchingTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${unrelatedTransaction.transactionID}`, unrelatedTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${matchingTransaction.transactionID}`, matchingViolations);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${unrelatedTransaction.transactionID}`, unrelatedViolations);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTransactionViolationOfWorkspace(POLICY_ID));

        expect(result.current.transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${matchingTransaction.transactionID}`]).toEqual(matchingViolations);
        expect(result.current.transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${unrelatedTransaction.transactionID}`]).toBeUndefined();
    });

    it('returns empty results when no reports match the policy', async () => {
        const chatReport = createPolicyExpenseChat(CHAT_REPORT_ID, 'otherPolicy', IOU_REPORT_ID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTransactionViolationOfWorkspace(POLICY_ID));

        expect(result.current.reportsToArchive.length).toBe(0);
        expect(result.current.transactionViolations).toEqual({});
    });

    it('handles reports without iouReportID', async () => {
        const chatReportNoIou = {
            reportID: CHAT_REPORT_ID,
            policyID: POLICY_ID,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            type: CONST.REPORT.TYPE.CHAT,
            isOwnPolicyExpenseChat: true,
        } as Report;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReportNoIou);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTransactionViolationOfWorkspace(POLICY_ID));

        // Report is still in reportsToArchive, but no transactions match
        expect(result.current.reportsToArchive.length).toBe(1);
        expect(result.current.transactionViolations).toEqual({});
    });
});
