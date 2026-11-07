import {canSubmitAndIsAwaitingForCurrentUser, canSubmitReport, shouldCurrentUserSubmitReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, Policy, Report, Transaction, TransactionViolations} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {createExpenseReport, createPolicyExpenseChat} from '../utils/collections/reports';
import createMock from '../utils/createMock';
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
        const result = canSubmitAndIsAwaitingForCurrentUser(managerReport, chatReport, basePolicy, transactions, transactionViolations, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);
        expect(result).toBe(false);
    });

    it('returns false when the report is not submittable', () => {
        const submittedReport: Report = {...iouReport, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED};
        const result = canSubmitAndIsAwaitingForCurrentUser(submittedReport, chatReport, basePolicy, transactions, {}, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);
        expect(result).toBe(false);
    });

    it('returns false when report is not waiting for submission from current user', () => {
        const otherChatReport = createPolicyExpenseChat(1, false);
        const result = canSubmitAndIsAwaitingForCurrentUser(iouReport, otherChatReport, basePolicy, transactions, {}, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);
        expect(result).toBe(false);
    });

    it('returns true when all conditions are met', () => {
        const result = canSubmitAndIsAwaitingForCurrentUser(iouReport, chatReport, basePolicy, transactions, {}, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);
        expect(result).toBe(true);
    });
});

describe('canSubmitReport reportOwnerLogin', () => {
    const OWNER_LOGIN = 'threaded.owner@test.com';
    const adminPolicy: Policy = {...basePolicy, role: CONST.POLICY.ROLE.ADMIN};

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.SESSION, {email: 'user@test.com', accountID: CURRENT_USER_ACCOUNT_ID});
        return waitForBatchedUpdates();
    });

    it('honors a violation dismissal attributed to the owner login only when the login is passed', () => {
        // Given an open expense report owned by another user and viewed by a workspace admin. Its only expense has a
        // NO_ROUTE violation, which blocks submission, and the owner dismissed it. For a viewer who isn't the submitter,
        // a dismissal only counts when it matches the owner login.
        const report: Report = {
            ...createExpenseReport(3),
            ownerAccountID: OTHER_USER_ACCOUNT_ID,
            managerID: OTHER_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        const transaction: Transaction = {
            transactionID: '2',
            reportID: report.reportID,
            amount: 1000,
            currency: CONST.CURRENCY.USD,
            created: '2024-01-01 12:00:00.000',
            merchant: 'Test merchant',
            status: CONST.TRANSACTION.STATUS.POSTED,
            reimbursable: true,
            comment: {dismissedViolations: {[CONST.VIOLATIONS.NO_ROUTE]: {[OWNER_LOGIN]: '2024-01-02 12:00:00.000'}}},
        };
        const violations: Record<string, TransactionViolations> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [{name: CONST.VIOLATIONS.NO_ROUTE, type: 'violation'}],
        };

        // When we call canSubmitReport with and without the owner login
        const withOwnerLogin = canSubmitReport(report, OWNER_LOGIN, adminPolicy, [transaction], violations, false, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);
        const withoutOwnerLogin = canSubmitReport(report, undefined, adminPolicy, [transaction], violations, false, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);

        // Then only the call with the login sees the dismissal, so only that call allows submitting
        expect(withOwnerLogin).toBe(true);
        expect(withoutOwnerLogin).toBe(false);
    });
});

describe('canSubmitReport approve-only role', () => {
    const openExpenseReport: Report = {
        ...createExpenseReport(4),
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    };
    const transaction: Transaction = {
        transactionID: '3',
        reportID: openExpenseReport.reportID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        created: '2024-01-01 12:00:00.000',
        merchant: 'Test merchant',
        status: CONST.TRANSACTION.STATUS.POSTED,
        reimbursable: true,
    };
    const approveOnlyPolicy: Policy = {...basePolicy, type: CONST.POLICY.TYPE.CORPORATE, role: CONST.POLICY.ROLE.APPROVE_ONLY};

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.SESSION, {email: 'user@test.com', accountID: CURRENT_USER_ACCOUNT_ID});
        return waitForBatchedUpdates();
    });

    it('returns false when the report owner has the approve-only role', () => {
        // Given an open expense report owned by the current user on a policy where they have the approve-only role
        // When the owner submits it
        const canSubmit = canSubmitReport(openExpenseReport, 'user@test.com', approveOnlyPolicy, [transaction], {}, false, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);

        // Then the submit is not allowed
        expect(canSubmit).toBe(false);
    });

    it('returns true when a member with the user role submits their own report', () => {
        // Given the same report on a policy where the current user has the user role
        // When the owner submits it
        const canSubmit = canSubmitReport(openExpenseReport, 'user@test.com', basePolicy, [transaction], {}, false, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);

        // Then the submit is allowed
        expect(canSubmit).toBe(true);
    });

    it('returns true for a report on the personal policy', () => {
        // Given the same report on the personal policy, where roles do not restrict submits
        const personalPolicy: Policy = {...basePolicy, type: CONST.POLICY.TYPE.PERSONAL, role: CONST.POLICY.ROLE.ADMIN};

        // When the owner submits it
        const canSubmit = canSubmitReport(openExpenseReport, 'user@test.com', personalPolicy, [transaction], {}, false, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);

        // Then the submit is allowed
        expect(canSubmit).toBe(true);
    });

    it('returns true when an admin submits the report of an approve-only member', () => {
        // Given an open expense report owned by an approve-only member, managed by the current admin
        const reportOwnedByMember: Report = {...openExpenseReport, ownerAccountID: OTHER_USER_ACCOUNT_ID, managerID: CURRENT_USER_ACCOUNT_ID};
        const adminPolicy: Policy = {...approveOnlyPolicy, role: CONST.POLICY.ROLE.ADMIN};

        // When the admin submits it on the member's behalf
        const canSubmit = canSubmitReport(reportOwnedByMember, 'other.user@test.com', adminPolicy, [transaction], {}, false, 'user@test.com', CURRENT_USER_ACCOUNT_ID, undefined);

        // Then the submit is allowed
        expect(canSubmit).toBe(true);
    });
});

describe('canSubmitReport on a broken card feed', () => {
    const CARD_ID = 55501;
    const openExpenseReport: Report = {
        ...createExpenseReport(9),
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    };
    const transaction: Transaction = {
        transactionID: '9',
        reportID: openExpenseReport.reportID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        created: '2024-01-01 12:00:00.000',
        merchant: 'Test merchant',
        status: CONST.TRANSACTION.STATUS.POSTED,
        reimbursable: true,
    };
    const violations: Record<string, TransactionViolations> = {
        [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [
            {name: CONST.VIOLATIONS.RTER, type: CONST.VIOLATION_TYPES.VIOLATION, data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_REAUTH, cardID: CARD_ID}},
        ],
    };

    function cardListBrokenFor(days: number): CardList {
        return {
            [CARD_ID]: createMock<Card>({
                cardID: CARD_ID,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                fundID: '88801',
                lastScrapeResult: 438,
                lastScrape: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
            }),
        };
    }

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.SESSION, {email: 'user@test.com', accountID: CURRENT_USER_ACCOUNT_ID});
        return waitForBatchedUpdates();
    });

    // Given an expense held by a feed that broke recently, when the owner tries to submit, then it is still held:
    // the connection can realistically be fixed and the expense matched.
    it('does not allow submitting while the feed is inside the grace period', () => {
        expect(canSubmitReport(openExpenseReport, 'user@test.com', basePolicy, [transaction], violations, false, 'user@test.com', CURRENT_USER_ACCOUNT_ID, cardListBrokenFor(10))).toBe(
            false,
        );
    });

    // Given the same expense on a feed broken past the grace period, when the owner tries to submit, then it is
    // allowed: the warning is no longer shown anywhere, so it must not silently block submitting either.
    it('allows submitting once the feed is past the grace period', () => {
        expect(canSubmitReport(openExpenseReport, 'user@test.com', basePolicy, [transaction], violations, false, 'user@test.com', CURRENT_USER_ACCOUNT_ID, cardListBrokenFor(120))).toBe(
            true,
        );
    });
});
