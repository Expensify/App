import Onyx from 'react-native-onyx';
import {getIOUReportActionWithBadge} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'admin@test.com';
const POLICY_ID = 'policy1';
const CHAT_REPORT_ID = '100';
const EXPENSE_REPORT_ID = '200';
const REPORT_ACTION_ID = '300';

function createPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: CURRENT_USER_EMAIL,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        outputCurrency: CONST.CURRENCY.USD,
        isPolicyExpenseChatEnabled: true,
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        employeeList: {
            [CURRENT_USER_EMAIL]: {
                email: CURRENT_USER_EMAIL,
                role: CONST.POLICY.ROLE.ADMIN,
            },
        },
        ...overrides,
    } as Policy;
}

function createChatReport(): Report {
    return {
        reportID: CHAT_REPORT_ID,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        type: CONST.REPORT.TYPE.CHAT,
        policyID: POLICY_ID,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        isOwnPolicyExpenseChat: true,
        reportName: 'Test Chat',
    } as Report;
}

function createExpenseReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: EXPENSE_REPORT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        policyID: POLICY_ID,
        ownerAccountID: 2,
        managerID: CURRENT_USER_ACCOUNT_ID,
        currency: CONST.CURRENCY.USD,
        parentReportID: CHAT_REPORT_ID,
        isWaitingOnBankAccount: false,
        ...overrides,
    } as Report;
}

function createReportPreviewAction(): ReportAction {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        reportActionID: REPORT_ACTION_ID,
        childReportID: EXPENSE_REPORT_ID,
        created: '2024-01-01 00:00:00',
        message: [{text: 'Report preview', type: 'TEXT', html: 'Report preview'}],
    } as ReportAction;
}

async function setupOnyxData(expenseReportOverrides: Partial<Report> = {}, policyOverrides: Partial<Policy> = {}) {
    const reportActions: ReportActions = {
        [REPORT_ACTION_ID]: createReportPreviewAction(),
    };

    await Onyx.multiSet({
        [ONYXKEYS.SESSION]: {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID},
        [`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`]: createChatReport(),
        [`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`]: createExpenseReport(expenseReportOverrides),
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHAT_REPORT_ID}`]: reportActions,
        [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: createPolicy(policyOverrides),
    });

    return waitForBatchedUpdates();
}

describe('getIOUReportActionWithBadge', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should return PAY badge for approved expense report with positive reimbursable spend', async () => {
        // total is negative for expense reports (convention: negative = owed to employee)
        // getMoneyRequestSpendBreakdown flips sign for expense reports: reimbursableSpend = -total = 5000
        await setupOnyxData({
            total: -5000,
            nonReimbursableTotal: 0,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });

        const chatReport = createChatReport();
        const policy = createPolicy();
        const {actionBadge} = getIOUReportActionWithBadge(chatReport, policy, undefined, undefined);

        expect(actionBadge).toBe(CONST.REPORT.ACTION_BADGE.PAY);
    });

    it('should return PAY badge for negative expense (credit) via onlyShowPayElsewhere path', async () => {
        // For a negative/credit expense, total is positive on expense reports
        // getMoneyRequestSpendBreakdown flips sign: reimbursableSpend = -total = -5000 (negative)
        // The first canIOUBePaid call (onlyShowPayElsewhere=false) returns false because reimbursableSpend < 0
        // The second canIOUBePaid call (onlyShowPayElsewhere=true) returns true via canShowMarkedAsPaidForNegativeAmount
        await setupOnyxData({
            total: 5000,
            nonReimbursableTotal: 0,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });

        const chatReport = createChatReport();
        const policy = createPolicy();
        const {actionBadge} = getIOUReportActionWithBadge(chatReport, policy, undefined, undefined);

        expect(actionBadge).toBe(CONST.REPORT.ACTION_BADGE.PAY);
    });

    it('should not return PAY badge for settled expense report', async () => {
        await setupOnyxData({
            total: -5000,
            nonReimbursableTotal: 0,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        });

        const chatReport = createChatReport();
        const policy = createPolicy();
        const {actionBadge} = getIOUReportActionWithBadge(chatReport, policy, undefined, undefined);

        expect(actionBadge).toBeUndefined();
    });
});
