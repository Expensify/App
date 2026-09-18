import {canSubmitAndIsAwaitingForCurrentUser, shouldCurrentUserSubmitReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction, TransactionViolations} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {createExpenseReport, createPolicyExpenseChat} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 5;
const OTHER_USER_ACCOUNT_ID = 99;

const basePolicy: Policy = {
    id: 'policy1',
    name: 'Test Policy',
    role: 'user',
    outputCurrency: 'USD',
    type: 'team',
    owner: 'user@test.com',
    harvesting: {enabled: false},
};

describe('shouldCurrentUserSubmitReport', () => {
    describe('isWaitingForSubmissionFromCurrentUser path', () => {
        it('returns true when chatReport is own policy expense chat and harvesting is disabled', () => {
            const chatReport = createPolicyExpenseChat(1, true);
            const iouReport = createExpenseReport(2);
            const result = shouldCurrentUserSubmitReport(iouReport, chatReport, basePolicy);
            expect(result).toBe(true);
        });

        it('returns false when harvesting is enabled', () => {
            const chatReport = createPolicyExpenseChat(1, true);
            const iouReport = createExpenseReport(2);
            const policyWithHarvesting: Policy = {...basePolicy, harvesting: {enabled: true}};
            const result = shouldCurrentUserSubmitReport(iouReport, chatReport, policyWithHarvesting);
            expect(result).toBe(false);
        });

        it('returns false when chatReport is not own policy expense chat', () => {
            const chatReport = createPolicyExpenseChat(1, false);
            const iouReport = createExpenseReport(2);
            const result = shouldCurrentUserSubmitReport(iouReport, chatReport, basePolicy);
            expect(result).toBe(false);
        });
    });

    describe('isOwnReportAndRetracted path', () => {
        beforeAll(async () => {
            Onyx.init({keys: ONYXKEYS});
            await Onyx.set(ONYXKEYS.SESSION, {email: 'user@test.com', accountID: CURRENT_USER_ACCOUNT_ID});
            return waitForBatchedUpdates();
        });

        it('returns true when current user owns the report and report has been reopened', () => {
            const chatReport = createPolicyExpenseChat(1, false);
            const iouReport: Report = {...createExpenseReport(2), ownerAccountID: CURRENT_USER_ACCOUNT_ID, hasReportBeenReopened: true};
            const result = shouldCurrentUserSubmitReport(iouReport, chatReport, basePolicy);
            expect(result).toBe(true);
        });

        it('returns true when current user owns the report and report has been retracted', () => {
            const chatReport = createPolicyExpenseChat(1, false);
            const iouReport: Report = {...createExpenseReport(2), ownerAccountID: CURRENT_USER_ACCOUNT_ID, hasReportBeenRetracted: true};
            const result = shouldCurrentUserSubmitReport(iouReport, chatReport, basePolicy);
            expect(result).toBe(true);
        });

        it('returns false when current user does not own the report even if it was reopened', () => {
            const chatReport = createPolicyExpenseChat(1, false);
            const iouReport: Report = {...createExpenseReport(2), ownerAccountID: OTHER_USER_ACCOUNT_ID, hasReportBeenReopened: true};
            const result = shouldCurrentUserSubmitReport(iouReport, chatReport, basePolicy);
            expect(result).toBe(false);
        });

        it('returns false when report has not been reopened or retracted and not own policy expense chat', () => {
            const chatReport = createPolicyExpenseChat(1, false);
            const iouReport: Report = {...createExpenseReport(2), ownerAccountID: CURRENT_USER_ACCOUNT_ID};
            const result = shouldCurrentUserSubmitReport(iouReport, chatReport, basePolicy);
            expect(result).toBe(false);
        });
    });
});

describe('canSubmitAndIsAwaitingForCurrentUser', () => {
    const chatReport = createPolicyExpenseChat(1, true);
    const iouReport: Report = {
        ...createExpenseReport(2),
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        managerID: OTHER_USER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    };
    const transaction: Transaction = {
        transactionID: '1',
        reportID: iouReport.reportID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        created: '2024-01-01 12:00:00.000',
        merchant: 'Test merchant',
        status: CONST.TRANSACTION.STATUS.POSTED,
        reimbursable: true,
    };
    const transactions: Transaction[] = [transaction];

    it('returns false when all transactions have AUTO_REPORTED_REJECTED_EXPENSE violation for the manager', () => {
        const managerReport: Report = {...iouReport, managerID: CURRENT_USER_ACCOUNT_ID};
        const transactionViolations: Record<string, TransactionViolations> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [{name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE, type: 'violation'}],
        };
        const result = canSubmitAndIsAwaitingForCurrentUser(managerReport, chatReport, basePolicy, transactions, transactionViolations, 'user@test.com', CURRENT_USER_ACCOUNT_ID);
        expect(result).toBe(false);
    });

    it('returns false when the report is not submittable', () => {
        const submittedReport: Report = {...iouReport, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED};
        const result = canSubmitAndIsAwaitingForCurrentUser(submittedReport, chatReport, basePolicy, transactions, {}, 'user@test.com', CURRENT_USER_ACCOUNT_ID);
        expect(result).toBe(false);
    });

    it('returns false when report is not waiting for submission from current user', () => {
        const otherChatReport = createPolicyExpenseChat(1, false);
        const result = canSubmitAndIsAwaitingForCurrentUser(iouReport, otherChatReport, basePolicy, transactions, {}, 'user@test.com', CURRENT_USER_ACCOUNT_ID);
        expect(result).toBe(false);
    });

    it('returns true when all conditions are met', () => {
        const result = canSubmitAndIsAwaitingForCurrentUser(iouReport, chatReport, basePolicy, transactions, {}, 'user@test.com', CURRENT_USER_ACCOUNT_ID);
        expect(result).toBe(true);
    });
});
