import {getMoneyRequestInformation} from '@libs/actions/IOU/MoneyRequestBuilder';
import {canAddTransaction, isExpenseReportRejected} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {formatPhoneNumber, getCurrencyDecimalsLocal} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
        getCurrentRoute: jest.fn(),
        isReady: jest.fn(() => true),
    },
}));

const POLICY_ID = 'policy-666-1';
const CHAT_REPORT_ID = 'chat-666-1';
const REFUSED_REPORT_ID = 'iou-666-refused';
const PAYEE_ACCOUNT_ID = 100;
const PAYER_ACCOUNT_ID = 200;

/** The report as it looks locally after the server refused an expense on it: still open, because the update that would
 *  have moved it past SUBMITTED never reached us. That stale status is the whole reason the client keeps aiming expenses at it. */
const refusedReport: Report = {
    reportID: REFUSED_REPORT_ID,
    chatReportID: CHAT_REPORT_ID,
    policyID: POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    chatType: undefined,
    ownerAccountID: PAYEE_ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    currency: 'USD',
    total: 0,
    transactionCount: 1,
};

const parentChatReport: Report = {
    reportID: CHAT_REPORT_ID,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: POLICY_ID,
    isOwnPolicyExpenseChat: true,
    type: CONST.REPORT.TYPE.CHAT,
    iouReportID: REFUSED_REPORT_ID,
};

const baseParams = {
    isVendorMatchingBetaEnabled: false,
    parentChatReport,
    participantParams: {
        payeeAccountID: PAYEE_ACCOUNT_ID,
        payeeEmail: 'payee@example.com',
        participant: {
            accountID: PAYER_ACCOUNT_ID,
            login: 'payer@example.com',
            isPolicyExpenseChat: true,
            reportID: CHAT_REPORT_ID,
        },
    },
    transactionParams: {
        amount: 1000,
        currency: 'USD',
        created: '2026-01-01',
        merchant: 'Test Merchant',
    },
    isASAPSubmitBetaEnabled: false,
    currentUserAccountIDParam: PAYEE_ACCOUNT_ID,
    currentUserEmailParam: 'payee@example.com',
    transactionViolations: {},
    quickAction: undefined,
    policyRecentlyUsedCurrencies: [] as string[],
    personalDetails: {},
    delegateAccountID: undefined,
    isTrackIntentUser: false,
    formatPhoneNumber,
    rules: undefined,
} as const;

/**
 * Reads the value the builder would write under `key`. The builder's Onyx data is typed for every key it can write, so
 * the value arrives as a union and is narrowed here rather than asserted.
 */
function readUpdateValue(optimisticData: ReturnType<typeof getMoneyRequestInformation>['onyxData']['optimisticData'], key: string) {
    const value = optimisticData?.find((entry) => entry.key === key)?.value;
    return typeof value === 'object' && value !== null && 'reportID' in value ? value : undefined;
}

async function seedReports() {
    await Onyx.set(ONYXKEYS.SESSION, {accountID: PAYEE_ACCOUNT_ID, email: 'payee@example.com'});
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
        id: POLICY_ID,
        type: CONST.POLICY.TYPE.CORPORATE,
        name: 'Test Policy',
        role: CONST.POLICY.ROLE.USER,
        outputCurrency: 'USD',
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REFUSED_REPORT_ID}`, refusedReport);
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentChatReport);
    await waitForBatchedUpdates();
}

describe('a report the server refused an expense on', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('still looks writable by status alone, which is what makes the client retry into it', async () => {
        // Given the refused report, whose local status is still open
        await seedReports();

        // When it is checked for expenses without the refusal being known
        // Then status says it takes expenses, confirming the guard that failed was correct about the data it had
        expect(canAddTransaction(refusedReport, undefined)).toBe(true);
    });

    it('is no longer an expense destination once the refusal is noted', async () => {
        // Given the refused report and a note that the server turned down an expense on it
        await seedReports();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REJECTED_EXPENSE_REPORT}${REFUSED_REPORT_ID}`, true);
        await waitForBatchedUpdates();

        // When it is checked for expenses
        // Then it is refused, overriding the stale open status
        expect(isExpenseReportRejected(REFUSED_REPORT_ID)).toBe(true);
        expect(canAddTransaction(refusedReport, undefined)).toBe(false);
    });

    it('sends the next expense to a new report instead of the refused one', async () => {
        // Given the refused report, pinned as the chat's expense report, and a note of the refusal
        await seedReports();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REJECTED_EXPENSE_REPORT}${REFUSED_REPORT_ID}`, true);
        await waitForBatchedUpdates();

        // When the next expense builds the report it will write to
        const result = getMoneyRequestInformation({
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            ...baseParams,
        });

        // Then it is a freshly built report, not the refused one, and the chat is repointed at it so the expense after
        // that one does not aim at the refused report either
        expect(result.iouReport.reportID).not.toBe(REFUSED_REPORT_ID);
        expect(readUpdateValue(result.onyxData.optimisticData, `${ONYXKEYS.COLLECTION.REPORT}${result.iouReport.reportID}`)?.reportID).toBe(result.iouReport.reportID);
        expect(readUpdateValue(result.onyxData.optimisticData, `${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`)?.iouReportID).toBe(result.iouReport.reportID);
    });

    it('still aims the next expense at the report when the refusal is unknown', async () => {
        // Given the same reports with no note of a refusal
        await seedReports();

        // When the next expense builds the report it will write to
        const result = getMoneyRequestInformation({
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            ...baseParams,
        });

        // Then it goes onto the existing report, so the recovery changes nothing about the ordinary path
        expect(result.iouReport.reportID).toBe(REFUSED_REPORT_ID);
    });

    it('stops being refused once the report is reopened', async () => {
        // Given a noted refusal that the server then let slide, by reopening the report
        await seedReports();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REJECTED_EXPENSE_REPORT}${REFUSED_REPORT_ID}`, true);
        await waitForBatchedUpdates();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REJECTED_EXPENSE_REPORT}${REFUSED_REPORT_ID}`, null);
        await waitForBatchedUpdates();

        // When it is checked for expenses
        // Then it takes them again, so a report the server reopened is not blocked for the rest of the session
        expect(isExpenseReportRejected(REFUSED_REPORT_ID)).toBe(false);
        expect(canAddTransaction(refusedReport, undefined)).toBe(true);
    });
});
