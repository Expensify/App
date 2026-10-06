import {getViolatingReportIDForRBRInLHN, isReportEligibleForViolationFix} from '@libs/ReportUtils';

import {getFlaggedExpenses} from '@pages/home/ForYouSection/useReviewFlaggedExpenses';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Session, Transaction, TransactionViolation} from '@src/types/onyx';

import type {OnyxCollection, OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {createExpenseReport, createPolicyExpenseChat} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const currentUserAccountID = 5;
const currentUserEmail = 'submitter@parity.test';
const otherUserAccountID = 42;

type Cell = {
    name: string;
    reportState: 'open' | 'processing' | 'approved';
    instantSubmit: boolean;
    ownedByCurrentUser: boolean;
    violations: TransactionViolation[];
};

const stateToNums = {
    open: {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN},
    processing: {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED},
    approved: {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED},
} as const;

const RESOLVABLE: TransactionViolation = {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true};

describe('Violation Fix parity between Inbox and Home', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    async function buildCell(cell: Cell) {
        await Onyx.clear();
        const key = cell.name.replaceAll(/\s+/g, '-');
        const policyID = `policy-${key}`;
        const chatReportID = `chat-${key}`;
        const expenseReportID = `expense-${key}`;
        const transactionID = `transaction-${key}`;

        const policy: Policy = {
            id: policyID,
            name: 'Parity Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.USER,
            outputCurrency: CONST.CURRENCY.USD,
            owner: currentUserEmail,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            ...(cell.instantSubmit ? {autoReporting: true, autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT} : {}),
        } as Policy;

        const ownerAccountID = cell.ownedByCurrentUser ? currentUserAccountID : otherUserAccountID;

        const chatReport: Report = {
            ...createPolicyExpenseChat(830),
            reportID: chatReportID,
            ownerAccountID,
            policyID,
            iouReportID: expenseReportID,
        };

        const expenseReport: Report = {
            ...createExpenseReport(831),
            reportID: expenseReportID,
            chatReportID,
            ownerAccountID,
            managerID: otherUserAccountID,
            policyID,
            type: CONST.REPORT.TYPE.EXPENSE,
            currency: CONST.CURRENCY.USD,
            total: 2500,
            ...stateToNums[cell.reportState],
        };

        const transaction: Transaction = {
            ...createRandomTransaction(830),
            transactionID,
            reportID: expenseReportID,
            amount: 2500,
            currency: CONST.CURRENCY.USD,
            status: CONST.TRANSACTION.STATUS.POSTED,
            reimbursable: true,
        };

        const violationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}` as OnyxKey;
        const violationsCollection: OnyxCollection<TransactionViolation[]> = {[violationsKey]: cell.violations};

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
        await Promise.all([
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction),
            Onyx.merge(violationsKey, cell.violations),
        ]);
        await waitForBatchedUpdates();

        const allReports: OnyxCollection<Report> = {
            [`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]: chatReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`]: expenseReport,
        };
        const allTransactions: OnyxCollection<Transaction> = {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction};
        const allPolicies: OnyxCollection<Policy> = {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy};
        const session: Session = {accountID: currentUserAccountID, email: currentUserEmail};

        const inboxShows = getViolatingReportIDForRBRInLHN(chatReport, violationsCollection, currentUserEmail) === expenseReportID;
        const homeShows = getFlaggedExpenses(allReports, allTransactions, violationsCollection, allPolicies, session).some((flagged) => flagged.reportID === expenseReportID);

        return {inboxShows, homeShows, expenseReport, policy};
    }

    const violationVariants: Array<{label: string; violations: TransactionViolation[]}> = [
        {label: 'resolvable', violations: [RESOLVABLE]},
        {label: 'companyCardRequired-only', violations: [{name: CONST.VIOLATIONS.COMPANY_CARD_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}]},
        {label: 'companyCardRequired-plus-resolvable', violations: [{name: CONST.VIOLATIONS.COMPANY_CARD_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}, RESOLVABLE]},
        {label: 'modifiedAmount-notice', violations: [{name: CONST.VIOLATIONS.MODIFIED_AMOUNT, type: CONST.VIOLATION_TYPES.NOTICE, showInReview: true}]},
        {label: 'notice-hidden-from-review', violations: [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.NOTICE, showInReview: false}]},
    ];

    const cells: Cell[] = [];
    for (const reportState of ['open', 'processing', 'approved'] as const) {
        for (const instantSubmit of [false, true]) {
            for (const ownedByCurrentUser of [true, false]) {
                for (const variant of violationVariants) {
                    cells.push({
                        name: `${reportState}-${instantSubmit ? 'instant' : 'standard'}-${ownedByCurrentUser ? 'owner' : 'other'}-${variant.label}`,
                        reportState,
                        instantSubmit,
                        ownedByCurrentUser,
                        violations: variant.violations,
                    });
                }
            }
        }
    }

    it.each(cells)('Inbox and Home agree for $name', async (cell) => {
        const {inboxShows, homeShows, expenseReport, policy} = await buildCell(cell);

        // Both surfaces must give the same answer for the same report
        expect(inboxShows).toBe(homeShows);

        // A plain resolvable violation on an owned, eligible report must light both up
        if (cell.violations.length === 1 && cell.violations.at(0)?.name === CONST.VIOLATIONS.MISSING_CATEGORY && cell.violations.at(0)?.type === CONST.VIOLATION_TYPES.VIOLATION) {
            const expected = cell.ownedByCurrentUser && isReportEligibleForViolationFix(expenseReport, policy);
            expect(inboxShows).toBe(expected);
        }
    });

    afterAll(async () => {
        await Onyx.clear();
    });
});
