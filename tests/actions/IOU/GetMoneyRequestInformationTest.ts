import {getMoneyRequestInformation} from '@libs/actions/IOU/MoneyRequestBuilder';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, Report, Transaction} from '@src/types/onyx';

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
        created: '2024-01-01',
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
        const FLAGGED_AT = 1700000000000;
        let dateNowSpy: jest.SpyInstance;
        beforeEach(async () => {
            dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(FLAGGED_AT);
            await Onyx.set(ONYXKEYS.SESSION, {accountID: PAYEE_ACCOUNT_ID, email: 'payee@example.com'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, type: CONST.POLICY.TYPE.CORPORATE, name: 'Test Policy'});
            await waitForBatchedUpdates();
        });
        afterEach(() => {
            dateNowSpy.mockRestore();
        });

        const buildExistingIOUReport = (reportID: string, transactionCount?: number): Report => ({
            reportID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: PAYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            currency: 'USD',
            total: 0,
            ...(transactionCount !== undefined && {transactionCount}),
        });

        const setReportTransaction = (transactionID: string, reportID: string, pendingAction?: Transaction['pendingAction']) =>
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
                reportID,
                amount: 500,
                created: '2024-01-01',
                currency: 'USD',
                merchant: 'Existing Merchant',
                ...(pendingAction && {pendingAction}),
            });

        /** Every flag the updates write to this report's rail, whatever its key, so a "not flagged" check can't miss a key it didn't spell out. */
        const getRailFlagKeys = (updates: ReadonlyArray<{key: string; value?: unknown}> | undefined, moneyRequestReportID: string) =>
            (updates ?? []).flatMap((update) => {
                const value: unknown = update.value;
                if (update.key !== `${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReportID}` || !isRecord(value) || !isRecord(value.pendingNewTransactionIDs)) {
                    return [];
                }
                return Object.entries(value.pendingNewTransactionIDs)
                    .filter(([, isFlagged]) => !!isFlagged)
                    .map(([flagKey]) => flagKey);
            });

        it('does NOT flag the first transaction of a report (no stale flag to re-highlight the original on a later add)', () => {
            // Given no report to add to, so the request creates one
            // When its first expense is added
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal});

            // Then the new report's rail stays empty, since a flag on its first row would re-highlight that row on a later add
            expect(getRailFlagKeys(result.onyxData.optimisticData, result.iouReport.reportID)).toEqual([]);
        });

        it('flags the transaction when the target report already holds a transaction', () => {
            // Given a report whose count says it already holds one expense, though none is cached
            const moneyRequestReportID = 'iou-report-rail-1';
            const existingIOUReport = buildExistingIOUReport(moneyRequestReportID, 1);

            // When an expense is added to it
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal, existingIOUReport, moneyRequestReportID});
            const expectedKey = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReportID}`;
            const newTxID = result.transaction.transactionID;

            // Then the new expense is flagged, and a failed request clears that same flag
            expect(result.onyxData.optimisticData ?? []).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({key: expectedKey, value: expect.objectContaining({pendingNewTransactionIDs: expect.objectContaining({[`${newTxID}:${FLAGGED_AT}`]: true})})}),
                ]),
            );
            expect(result.onyxData.failureData ?? []).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({key: expectedKey, value: expect.objectContaining({pendingNewTransactionIDs: expect.objectContaining({[`${newTxID}:${FLAGGED_AT}`]: null})})}),
                ]),
            );
        });

        /**
         * A multi-add action builds its adds in one synchronous run, passing each call the report the previous one returned.
         * A single call can't express "this action's second add": from the report alone it looks like an add to a filled report.
         */
        const addToReport = (moneyRequestReportID: string, existingIOUReport: Report) =>
            getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal, existingIOUReport, moneyRequestReportID});
        const flagFor = (moneyRequestReportID: string, transactionID: string) =>
            expect.objectContaining({
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReportID}`,
                value: expect.objectContaining({pendingNewTransactionIDs: expect.objectContaining({[`${transactionID}:${FLAGGED_AT}`]: true})}),
            });

        it('does not flag either expense of a report this same action fills, such as a duplicated report', () => {
            // Given a report this action created, so it was showing nothing when the action began
            const moneyRequestReportID = 'iou-report-rail-new-report';

            // When the action adds two expenses to it in one run
            const first = addToReport(moneyRequestReportID, buildExistingIOUReport(moneyRequestReportID, 0));
            const second = addToReport(moneyRequestReportID, buildExistingIOUReport(moneyRequestReportID, 1));

            // Then neither is flagged: both are the report's initial contents
            expect(getRailFlagKeys(first.onyxData.optimisticData, moneyRequestReportID)).toEqual([]);
            expect(getRailFlagKeys(second.onyxData.optimisticData, moneyRequestReportID)).toEqual([]);
        });

        it('flags an expense added in a later run, since by then the rows already there are ones the user could have seen', async () => {
            // Given a report filled by an earlier action, whose row has since reached the transaction cache
            const moneyRequestReportID = 'iou-report-rail-later-run';
            const first = addToReport(moneyRequestReportID, buildExistingIOUReport(moneyRequestReportID, 0));
            expect(getRailFlagKeys(first.onyxData.optimisticData, moneyRequestReportID)).toEqual([]);
            await setReportTransaction(first.transaction.transactionID, moneyRequestReportID);
            await waitForBatchedUpdates();

            // When a separate action adds to the same report
            const later = addToReport(moneyRequestReportID, buildExistingIOUReport(moneyRequestReportID, 1));

            // Then it is flagged: rows an earlier action left are the report's existing rows
            expect(later.onyxData.optimisticData ?? []).toEqual(expect.arrayContaining([flagFor(moneyRequestReportID, later.transaction.transactionID)]));
        });

        it('flags every copy landing on a report that already held expenses before this action', async () => {
            // Given a report showing one expense before the action began
            const moneyRequestReportID = 'iou-report-rail-existing-report';
            await setReportTransaction('before-the-action', moneyRequestReportID);
            await waitForBatchedUpdates();

            // When the action adds two copies to it in one run
            const first = addToReport(moneyRequestReportID, buildExistingIOUReport(moneyRequestReportID, 1));
            const second = addToReport(moneyRequestReportID, buildExistingIOUReport(moneyRequestReportID, 2));

            // Then both are flagged, since each is an insertion
            expect(first.onyxData.optimisticData ?? []).toEqual(expect.arrayContaining([flagFor(moneyRequestReportID, first.transaction.transactionID)]));
            expect(second.onyxData.optimisticData ?? []).toEqual(expect.arrayContaining([flagFor(moneyRequestReportID, second.transaction.transactionID)]));
        });

        it('does not flag a transaction that is already on the target report', async () => {
            // Given a report that already holds an expense
            const moneyRequestReportID = 'iou-report-rail-3';
            const existingTransactionID = 'edit-tx-1';
            await setReportTransaction(existingTransactionID, moneyRequestReportID);
            await waitForBatchedUpdates();
            const existingIOUReport = buildExistingIOUReport(moneyRequestReportID, 2);

            // When a request is built that reuses that expense rather than creating one
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal, existingIOUReport, moneyRequestReportID, existingTransactionID});

            // Then it is not flagged, since it adds no row to the report
            expect(result.transaction.transactionID).toBe(existingTransactionID);
            expect(getRailFlagKeys(result.onyxData.optimisticData, moneyRequestReportID)).toEqual([]);
        });

        it('still flags the rows a run inserts when its first entry is one the report already holds, as a split in place is', async () => {
            // Given a report showing one expense, which a split reuses as its first entry
            const moneyRequestReportID = 'iou-report-rail-reused-first';
            const reusedTransactionID = 'reused-tx';
            await setReportTransaction(reusedTransactionID, moneyRequestReportID);
            await waitForBatchedUpdates();

            // When the run builds that entry first and then a genuinely new one
            // With no `transactionCount`, as for a split in place, the reused entry reads the cache, which minus itself looks empty.
            const reused = getMoneyRequestInformation({
                ...baseParams,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                existingIOUReport: buildExistingIOUReport(moneyRequestReportID),
                moneyRequestReportID,
                existingTransactionID: reusedTransactionID,
            });
            const inserted = addToReport(moneyRequestReportID, buildExistingIOUReport(moneyRequestReportID));

            // Then only the inserted row is flagged: a call that inserts nothing must not decide for the action
            expect(getRailFlagKeys(reused.onyxData.optimisticData, moneyRequestReportID)).toEqual([]);
            expect(inserted.onyxData.optimisticData ?? []).toEqual(expect.arrayContaining([flagFor(moneyRequestReportID, inserted.transaction.transactionID)]));
        });

        it('flags the transaction even when the target report has no transaction count', async () => {
            // Given a report with no count, whose one expense is in the cache
            const moneyRequestReportID = 'iou-report-rail-2';
            await setReportTransaction('existing-tx-1', moneyRequestReportID);
            await waitForBatchedUpdates();
            const existingIOUReport = buildExistingIOUReport(moneyRequestReportID);

            // When an expense is added to it
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal, existingIOUReport, moneyRequestReportID});
            const expectedKey = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReportID}`;
            const newTxID = result.transaction.transactionID;

            // Then it is flagged, since the cached expense shows the report already had a row
            expect(result.onyxData.optimisticData ?? []).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({key: expectedKey, value: expect.objectContaining({pendingNewTransactionIDs: expect.objectContaining({[`${newTxID}:${FLAGGED_AT}`]: true})})}),
                ]),
            );
        });

        it('flags the transaction when the cache holds only part of a report whose one cached transaction is pending deletion', async () => {
            // Given a report counting ten expenses, of which only one is cached and it is pending deletion
            const moneyRequestReportID = 'iou-report-rail-5';
            await setReportTransaction('partially-cached-tx-1', moneyRequestReportID, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            await waitForBatchedUpdates();
            const existingIOUReport = buildExistingIOUReport(moneyRequestReportID, 10);

            // When an expense is added to it
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal, existingIOUReport, moneyRequestReportID});
            const expectedKey = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReportID}`;
            const newTxID = result.transaction.transactionID;

            // Then it is flagged, since a partial cache cannot show that the uncached rows are gone
            expect(result.onyxData.optimisticData ?? []).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({key: expectedKey, value: expect.objectContaining({pendingNewTransactionIDs: expect.objectContaining({[`${newTxID}:${FLAGGED_AT}`]: true})})}),
                ]),
            );
        });

        it('does not flag when the only existing transaction is pending deletion, even though the transaction count still includes it', async () => {
            // Given a report whose only expense is pending deletion, though its count still includes it
            const moneyRequestReportID = 'iou-report-rail-4';
            await setReportTransaction('deleted-tx-1', moneyRequestReportID, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            await waitForBatchedUpdates();
            const existingIOUReport = buildExistingIOUReport(moneyRequestReportID, 1);

            // When an expense is added to it
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal, existingIOUReport, moneyRequestReportID});

            // Then it is not flagged: with its only row being deleted, the new expense is the report's first
            expect(getRailFlagKeys(result.onyxData.optimisticData, moneyRequestReportID)).toEqual([]);
        });
    });

    describe('destination report when the chat has no iouReportID', () => {
        const OLDER_REPORT_ID = 'outstanding-expense-report-older';
        const NEWER_REPORT_ID = 'outstanding-expense-report-newer';
        const OTHER_OWNER_REPORT_ID = 'outstanding-expense-report-other-owner';
        const PENDING_REPORT_ID = 'expense-report-not-in-onyx-yet';
        const SUBMITTED_REPORT_ID = 'expense-report-awaiting-approval';
        const APPROVER_ACCOUNT_ID = 300;
        const APPROVER_EMAIL = 'approver@example.com';

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

        it('reuses an outstanding report when the chat points at a report that cannot be resolved', async () => {
            // The chat still points at PENDING_REPORT_ID, but that key is missing from Onyx. That happens both when the
            // report was deleted or moved away and when it simply has not hydrated yet, and the two are indistinguishable
            // here. Reusing the submitter's own open report beats creating a duplicate, which is the bug being fixed.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OLDER_REPORT_ID}`, buildOutstandingExpenseReport(OLDER_REPORT_ID, '2024-01-02'));
            await waitForBatchedUpdates();

            const result = getMoneyRequestInformation({
                ...baseParams,
                parentChatReport: {...parentChatReport, iouReportID: PENDING_REPORT_ID},
                getCurrencyDecimals: getCurrencyDecimalsLocal,
            });

            expect(result.iouReport.reportID).toBe(OLDER_REPORT_ID);
        });

        it('creates a new report when the submitter only has a report that is awaiting approval', async () => {
            // Submitting a report clears the chat's `iouReportID`, so this fallback runs right after a submit too.
            // The submitted report must never be reused — the next expense belongs on a fresh report.
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [PAYEE_ACCOUNT_ID]: {accountID: PAYEE_ACCOUNT_ID, login: 'payee@example.com'},
                [APPROVER_ACCOUNT_ID]: {accountID: APPROVER_ACCOUNT_ID, login: APPROVER_EMAIL},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {approver: APPROVER_EMAIL, owner: APPROVER_EMAIL, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SUBMITTED_REPORT_ID}`, {
                ...buildOutstandingExpenseReport(SUBMITTED_REPORT_ID, '2024-01-02'),
                // Awaiting first-level approval, which is what makes `canAddTransaction` true for this report.
                managerID: APPROVER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            });
            await waitForBatchedUpdates();

            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal});

            expect(result.iouReport.reportID).not.toBe(SUBMITTED_REPORT_ID);
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
