import {getMoneyRequestInformation} from '@libs/actions/IOU/MoneyRequestBuilder';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, PolicyTagLists, Report, Transaction} from '@src/types/onyx';

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

const POLICY_ID = 'policy-test-1';
const CHAT_REPORT_ID = 'report-chat-1';
const PAYEE_ACCOUNT_ID = 100;
const PAYER_ACCOUNT_ID = 200;
const TAG_LIST = 'Department';
const EMPTY_TAG_LIST = '';
const TAG_NAME = 'Engineering';

const parentChatReport: Report = {
    reportID: CHAT_REPORT_ID,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: POLICY_ID,
    isOwnPolicyExpenseChat: true,
    type: CONST.REPORT.TYPE.CHAT,
};

const policyTagListA: PolicyTagLists = {
    [TAG_LIST]: {
        name: TAG_LIST,
        orderWeight: 0,
        required: false,
        tags: {
            [TAG_NAME]: {
                name: TAG_NAME,
                enabled: true,
            },
        },
    },
};

const baseParams = {
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
        created: '2024-01-01',
        merchant: 'Test Merchant',
    },
    betas: [] as Beta[],
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

describe('getMoneyRequestInformation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('optimistic recently used tags', () => {
        it('should store recently used tags at the correct policy key when policyTagList and tag are provided', () => {
            const result = getMoneyRequestInformation({
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                ...baseParams,
                policyParams: {
                    policyTagList: policyTagListA,
                },
                transactionParams: {
                    ...baseParams.transactionParams,
                    tag: TAG_NAME,
                },
            });

            const expectedKey = `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`;
            const tagEntry = result.onyxData.optimisticData?.find((entry) => entry.key === expectedKey);

            expect(tagEntry).toBeDefined();
            expect(tagEntry?.value).toEqual({[TAG_LIST]: [TAG_NAME]});
        });

        it('should not store recently used tags when tag is not provided', () => {
            const result = getMoneyRequestInformation({
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                ...baseParams,
                policyParams: {
                    policyTagList: policyTagListA,
                },
            });

            const expectedKey = `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`;
            const tagEntry = result.onyxData.optimisticData?.find((entry) => entry.key === expectedKey);

            expect(tagEntry).toBeUndefined();
        });

        it('should store tags under empty-string list key when policyTagList has no named tag lists', () => {
            const result = getMoneyRequestInformation({
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                ...baseParams,
                policyParams: {
                    policyTagList: {},
                },
                transactionParams: {
                    ...baseParams.transactionParams,
                    tag: TAG_NAME,
                },
            });

            const expectedKey = `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`;
            const tagEntry = result.onyxData.optimisticData?.find((entry) => entry.key === expectedKey);

            expect(tagEntry).toBeDefined();
            expect(tagEntry?.value).toEqual({[EMPTY_TAG_LIST]: [TAG_NAME]});
        });

        it('should use parentChatReport.policyID for the recently used tags key', () => {
            const otherPolicyID = 'policy-other';
            const result = getMoneyRequestInformation({
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                ...baseParams,
                parentChatReport: {
                    ...parentChatReport,
                    policyID: otherPolicyID,
                },
                policyParams: {
                    policyTagList: policyTagListA,
                },
                transactionParams: {
                    ...baseParams.transactionParams,
                    tag: TAG_NAME,
                },
            });

            const expectedKey = `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${otherPolicyID}`;
            const wrongKey = `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`;

            expect(result.onyxData.optimisticData?.find((entry) => entry.key === expectedKey)).toBeDefined();
            expect(result.onyxData.optimisticData?.find((entry) => entry.key === wrongKey)).toBeUndefined();
        });

        it('should use policyID from allReports when moneyRequestReportID is provided', async () => {
            const moneyRequestReportID = 'iou-report-lookup-1';
            const differentPolicyID = 'policy-different';
            await Onyx.set(ONYXKEYS.SESSION, {accountID: PAYEE_ACCOUNT_ID, email: 'payee@example.com'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${differentPolicyID}`, {id: differentPolicyID, type: CONST.POLICY.TYPE.CORPORATE, name: 'Test Policy'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`, {
                reportID: moneyRequestReportID,
                policyID: differentPolicyID,
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: PAYEE_ACCOUNT_ID,
                currency: 'USD',
                total: 0,
            });
            await waitForBatchedUpdates();

            const result = getMoneyRequestInformation({
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                ...baseParams,
                moneyRequestReportID,
                policyParams: {
                    policyTagList: policyTagListA,
                },
                transactionParams: {
                    ...baseParams.transactionParams,
                    tag: TAG_NAME,
                },
            });

            const expectedKey = `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${differentPolicyID}`;
            const wrongKey = `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`;

            expect(result.onyxData.optimisticData?.find((entry) => entry.key === expectedKey)).toBeDefined();
            expect(result.onyxData.optimisticData?.find((entry) => entry.key === wrongKey)).toBeUndefined();
        });

        it('should fall back to parentChatReport.policyID when moneyRequestReportID is empty string', () => {
            const result = getMoneyRequestInformation({
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                ...baseParams,
                moneyRequestReportID: '',
                policyParams: {
                    policyTagList: policyTagListA,
                },
                transactionParams: {
                    ...baseParams.transactionParams,
                    tag: TAG_NAME,
                },
            });

            const expectedKey = `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`;
            const tagEntry = result.onyxData.optimisticData?.find((entry) => entry.key === expectedKey);

            expect(tagEntry).toBeDefined();
            expect(tagEntry?.value).toEqual({[TAG_LIST]: [TAG_NAME]});
        });
    });

    describe('pendingNewTransactionIDs metadata rail', () => {
        // Only the 0→1 negative is testable here (the resolved report has no existing txs); the >= 1 positive path lives in the useNewTransactions consumer tests.
        it('does NOT flag the first transaction of a report (no stale flag to re-highlight the original on a later add)', () => {
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal});
            const expectedKey = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${result.iouReport.reportID}`;
            const newTxID = result.transaction.transactionID;

            expect(result.onyxData.optimisticData ?? []).not.toEqual(
                expect.arrayContaining([expect.objectContaining({key: expectedKey, value: expect.objectContaining({pendingNewTransactionIDs: expect.objectContaining({[newTxID]: true})})})]),
            );
        });
    });

    describe('destination report when the chat has no iouReportID', () => {
        const OLDER_REPORT_ID = 'outstanding-expense-report-older';
        const NEWER_REPORT_ID = 'outstanding-expense-report-newer';
        const OTHER_OWNER_REPORT_ID = 'outstanding-expense-report-other-owner';
        const PENDING_REPORT_ID = 'expense-report-not-in-onyx-yet';

        function buildOutstandingExpenseReport(reportID: string, created: string, ownerAccountID = PAYEE_ACCOUNT_ID): Report {
            return {
                reportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: POLICY_ID,
                chatReportID: CHAT_REPORT_ID,
                ownerAccountID,
                managerID: ownerAccountID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                currency: 'USD',
                total: 0,
                created,
            };
        }

        beforeEach(async () => {
            // `canAddTransaction` requires the submitter to own the report and the policy to be a group policy.
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: PAYEE_ACCOUNT_ID, email: 'payee@example.com'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER});
            // The chat deliberately has no `iouReportID`, which is the state left behind when the report it pointed at is deleted.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentChatReport);
            await waitForBatchedUpdates();
        });

        it('adds the expense to the submitter outstanding report instead of creating a new one', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OLDER_REPORT_ID}`, buildOutstandingExpenseReport(OLDER_REPORT_ID, '2024-01-02'));
            await waitForBatchedUpdates();

            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal});

            expect(result.iouReport.reportID).toBe(OLDER_REPORT_ID);
        });

        it('picks the newest outstanding report when the submitter has more than one', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OLDER_REPORT_ID}`, buildOutstandingExpenseReport(OLDER_REPORT_ID, '2024-01-02'));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${NEWER_REPORT_ID}`, buildOutstandingExpenseReport(NEWER_REPORT_ID, '2024-03-04'));
            await waitForBatchedUpdates();

            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal});

            expect(result.iouReport.reportID).toBe(NEWER_REPORT_ID);
        });

        it('creates a new report when the only outstanding report belongs to someone else', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OTHER_OWNER_REPORT_ID}`, buildOutstandingExpenseReport(OTHER_OWNER_REPORT_ID, '2024-01-02', PAYER_ACCOUNT_ID));
            await waitForBatchedUpdates();

            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal});

            expect(result.iouReport.reportID).not.toBe(OTHER_OWNER_REPORT_ID);
        });

        it('creates a new report when the submitter has no outstanding report', () => {
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal});

            expect(result.iouReport.reportID).toBeTruthy();
            expect(result.iouReport.reportID).not.toBe(OLDER_REPORT_ID);
        });

        it('still honours an explicitly chosen report over the outstanding fallback', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OLDER_REPORT_ID}`, buildOutstandingExpenseReport(OLDER_REPORT_ID, '2024-01-02'));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${NEWER_REPORT_ID}`, buildOutstandingExpenseReport(NEWER_REPORT_ID, '2024-03-04'));
            await waitForBatchedUpdates();

            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal, moneyRequestReportID: OLDER_REPORT_ID});

            expect(result.iouReport.reportID).toBe(OLDER_REPORT_ID);
        });

        it('does not divert to an outstanding report when the chat points at a report that has not loaded yet', async () => {
            // The chat still points at PENDING_REPORT_ID, but that report has not reached this client yet — an
            // offline race, not a cleared pointer. Reusing OLDER_REPORT_ID here would put the expense on the wrong report.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OLDER_REPORT_ID}`, buildOutstandingExpenseReport(OLDER_REPORT_ID, '2024-01-02'));
            await waitForBatchedUpdates();

            const result = getMoneyRequestInformation({
                ...baseParams,
                parentChatReport: {...parentChatReport, iouReportID: PENDING_REPORT_ID},
                getCurrencyDecimals: getCurrencyDecimalsLocal,
            });

            expect(result.iouReport.reportID).not.toBe(OLDER_REPORT_ID);
        });
    });

    it('does not copy commuter exclusion data to an optimistic split', () => {
        const customUnit = {
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            customUnitID: 'distance-unit',
            customUnitRateID: 'rate-123',
            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            quantity: 2.24,
        } as const;
        const existingTransaction: Transaction = {
            transactionID: 'original-transaction',
            reportID: 'expense-report',
            amount: -280,
            currency: CONST.CURRENCY.USD,
            created: '2024-01-01',
            merchant: '4.48 mi @ $0.625 / mi',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
            comment: {
                customUnit: {
                    ...customUnit,
                    quantity: 6.48,
                    commuterExclusion: 2,
                    reimbursableDistance: 4.48,
                    commuterExclusionMethod: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                },
            },
        };

        const result = getMoneyRequestInformation({
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            ...baseParams,
            existingTransaction,
            isSplitExpense: true,
            transactionParams: {
                ...baseParams.transactionParams,
                amount: 140,
                modifiedAmount: 140,
                originalTransactionID: existingTransaction.transactionID,
                customUnit,
            },
        });

        expect(result.transaction.comment?.customUnit).toEqual(customUnit);
    });
});
