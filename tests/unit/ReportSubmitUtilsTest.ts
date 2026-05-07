import Onyx from 'react-native-onyx';
import {canSubmitReport} from '@libs/actions/IOU/ReportWorkflow';
import {canSubmitAndIsAwaitingForCurrentUser, shouldCurrentUserSubmitReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction, TransactionViolations} from '@src/types/onyx';
import {createExpenseReport, createPolicyExpenseChat} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/IOU/ReportWorkflow', () => ({
    canSubmitReport: jest.fn(),
}));

const mockedCanSubmitReport = canSubmitReport as jest.Mock;

const CURRENT_USER_ACCOUNT_ID = 5;
const OTHER_USER_ACCOUNT_ID = 99;

const basePolicy: Policy = {
    id: 'policy1',
    name: 'Test Policy',
    role: 'user',
    outputCurrency: 'USD',
    type: 'team',
    owner: 'user@test.com',
    isPolicyExpenseChatEnabled: true,
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
    const iouReport: Report = {...createExpenseReport(2), ownerAccountID: CURRENT_USER_ACCOUNT_ID, managerID: OTHER_USER_ACCOUNT_ID};
    const transaction = createRandomTransaction(1);
    const transactions: Transaction[] = [transaction];

    beforeEach(() => {
        mockedCanSubmitReport.mockReset();
    });

    it('returns false when all transactions have AUTO_REPORTED_REJECTED_EXPENSE violation for the manager', () => {
        mockedCanSubmitReport.mockReturnValue(true);
        const managerReport: Report = {...iouReport, managerID: CURRENT_USER_ACCOUNT_ID};
        const transactionViolations: Record<string, TransactionViolations> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [{name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE, type: 'violation'}],
        };
        const result = canSubmitAndIsAwaitingForCurrentUser(managerReport, chatReport, basePolicy, transactions, transactionViolations, 'user@test.com', CURRENT_USER_ACCOUNT_ID);
        expect(result).toBe(false);
    });

    it('returns false when canSubmitReport returns false', () => {
        mockedCanSubmitReport.mockReturnValue(false);
        const result = canSubmitAndIsAwaitingForCurrentUser(iouReport, chatReport, basePolicy, transactions, {}, 'user@test.com', CURRENT_USER_ACCOUNT_ID);
        expect(result).toBe(false);
    });

    it('returns false when report is not waiting for submission from current user', () => {
        mockedCanSubmitReport.mockReturnValue(true);
        const otherUserChatReport = createPolicyExpenseChat(1, false);
        const iouReportOtherOwner: Report = {...createExpenseReport(2), ownerAccountID: OTHER_USER_ACCOUNT_ID};
        const result = canSubmitAndIsAwaitingForCurrentUser(iouReportOtherOwner, otherUserChatReport, basePolicy, transactions, {}, 'user@test.com', CURRENT_USER_ACCOUNT_ID);
        expect(result).toBe(false);
    });

    it('returns true when all conditions are met', () => {
        mockedCanSubmitReport.mockReturnValue(true);
        const result = canSubmitAndIsAwaitingForCurrentUser(iouReport, chatReport, basePolicy, transactions, {}, 'user@test.com', CURRENT_USER_ACCOUNT_ID);
        expect(result).toBe(true);
    });
});
