import {getMoneyRequestInformation} from '@libs/actions/IOU/MoneyRequestBuilder';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, Report, ReportAction, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../../utils/getOnyxValue';
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
const OPTIMISTIC_REPORT_PREVIEW_ACTION_ID = 'preview-action-id';

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
    parentChatReportActions: undefined,
    participantChatReportActions: undefined,
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
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${differentPolicyID}`, {
                id: differentPolicyID,
                type: CONST.POLICY.TYPE.CORPORATE,
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.USER,
            });
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

    describe('report preview action ID', () => {
        const buildScanExpense = (transactionID: string): Transaction => ({
            transactionID,
            reportID: CHAT_REPORT_ID,
            amount: 0,
            currency: CONST.CURRENCY.USD,
            created: '2024-01-01',
            merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
        });

        const buildRequest = (transactionID: string, isASAPSubmitBetaEnabled: boolean, existingIOUReport?: Report, optimisticIOUReportID?: string) =>
            getMoneyRequestInformation({
                ...baseParams,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                action: CONST.IOU.ACTION.CREATE,
                existingTransaction: buildScanExpense(transactionID),
                existingIOUReport,
                optimisticIOUReportID,
                optimisticReportPreviewActionID: OPTIMISTIC_REPORT_PREVIEW_ACTION_ID,
                isASAPSubmitBetaEnabled,
            });

        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: PAYEE_ACCOUNT_ID, email: 'payee@example.com'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                id: POLICY_ID,
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.USER,
            });
            await waitForBatchedUpdates();
        });

        it('generates a different preview action ID when ASAP Submit creates another report', () => {
            // Given an ASAP scan that already created an optimistic expense report with the batch preview ID
            const firstRequest = buildRequest('scan-1', true);

            // When another scan is submitted and the builder creates a different expense report
            const secondRequest = buildRequest('scan-2', true, firstRequest.iouReport);

            // Then each expense report has its own preview action ID
            expect(secondRequest.iouReport.reportID).not.toBe(firstRequest.iouReport.reportID);
            expect(firstRequest.reportPreviewAction.reportActionID).toBe(OPTIMISTIC_REPORT_PREVIEW_ACTION_ID);
            expect(secondRequest.reportPreviewAction.reportActionID).not.toBe(firstRequest.reportPreviewAction.reportActionID);
            expect(secondRequest.iouReport.parentReportActionID).toBe(secondRequest.reportPreviewAction.reportActionID);
        });

        it('reuses the existing report preview action ID when another expense joins the report', () => {
            // Given a scan that created an optimistic expense report with the batch preview ID
            const firstRequest = buildRequest('scan-1', false);

            // When another expense is added to that same report
            const secondRequest = buildRequest('scan-2', false, firstRequest.iouReport);

            // Then it keeps one preview action for the report, even when the preview is not in the Onyx cache yet
            expect(secondRequest.iouReport.reportID).toBe(firstRequest.iouReport.reportID);
            expect(secondRequest.reportPreviewAction.reportActionID).toBe(firstRequest.reportPreviewAction.reportActionID);
        });

        it('reuses the new report preview action ID when an expense joins after a split', () => {
            // Given a batch where the second scan was split from report A into report B
            const firstRequest = buildRequest('scan-1', false);
            const secondRequest = buildRequest('scan-2', true, firstRequest.iouReport);

            // When a third expense joins report B
            const thirdRequest = buildRequest('scan-3', false, secondRequest.iouReport);

            // Then it reuses report B's preview instead of falling back to report A's batch preview ID
            expect(secondRequest.iouReport.reportID).not.toBe(firstRequest.iouReport.reportID);
            expect(thirdRequest.iouReport.reportID).toBe(secondRequest.iouReport.reportID);
            expect(thirdRequest.reportPreviewAction.reportActionID).toBe(secondRequest.reportPreviewAction.reportActionID);
            expect(thirdRequest.reportPreviewAction.reportActionID).not.toBe(firstRequest.reportPreviewAction.reportActionID);
        });

        it('keeps the reserved preview action ID when the caller pins the same report ID', () => {
            // Given an existing report whose ID and preview action ID are pinned by the caller
            const firstRequest = buildRequest('scan-1', false);

            // When the builder rebuilds the report under that same ID even though the new-report condition is true
            const secondRequest = buildRequest('scan-2', true, firstRequest.iouReport, firstRequest.iouReport.reportID);

            // Then it keeps the caller's reserved preview instead of creating another preview for the same report
            expect(secondRequest.iouReport.reportID).toBe(firstRequest.iouReport.reportID);
            expect(secondRequest.reportPreviewAction.reportActionID).toBe(firstRequest.reportPreviewAction.reportActionID);
        });
    });

    describe('deferred scans into a new P2P chat', () => {
        const newChatID = '7000';
        const sharedCreatedActionID = '7001';
        const buildP2PScan = (transactionID: string, existingIOUReport?: Report, chatID = newChatID) =>
            getMoneyRequestInformation({
                ...baseParams,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                parentChatReport: undefined,
                participantParams: {
                    ...baseParams.participantParams,
                    participant: {accountID: PAYER_ACCOUNT_ID, login: 'payer@example.com', isPolicyExpenseChat: false},
                },
                action: CONST.IOU.ACTION.CREATE,
                existingTransaction: {
                    transactionID,
                    reportID: chatID,
                    amount: 0,
                    currency: CONST.CURRENCY.USD,
                    created: '2026-10-14',
                    merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                },
                optimisticTransactionID: transactionID,
                optimisticChatReportID: chatID,
                optimisticCreatedReportActionID: sharedCreatedActionID,
                optimisticReportPreviewActionID: OPTIMISTIC_REPORT_PREVIEW_ACTION_ID,
                existingIOUReport,
                isASAPSubmitBetaEnabled: true,
            });

        it.each([2, 3])('preserves all %i receipt previews when each iteration sees a new chat', async (receiptCount) => {
            // Given the batch builds all requests before any optimistic writes reach the Onyx cache
            const first = buildP2PScan('8000');
            const requests = [first];
            let previousReport = first.iouReport;
            for (let index = 1; index < receiptCount; index++) {
                const next = buildP2PScan(String(8000 + index), previousReport);
                requests.push(next);
                previousReport = next.iouReport;
            }
            const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newChatID}` as const;
            expect(first.onyxData.optimisticData?.find((update) => update.key === actionsKey)?.onyxMethod).toBe(Onyx.METHOD.SET);
            for (const request of requests.slice(1)) {
                expect(request.chatReport.reportID).toBe(newChatID);
                expect(request.createdChatReportActionID).toBe(sharedCreatedActionID);
                expect(request.onyxData.optimisticData?.find((update) => update.key === actionsKey)?.onyxMethod).toBe(Onyx.METHOD.MERGE);
            }

            // When the offline-first optimistic writes are applied in submission order
            for (const request of requests) {
                await Onyx.update(request.onyxData.optimisticData ?? []);
            }
            await waitForBatchedUpdates();

            // Then every independent report has its own complete preview and the chat has one CREATED action
            const actions = await getOnyxValue(actionsKey);
            const previews = Object.values(actions ?? {}).filter((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW);
            expect(previews).toHaveLength(receiptCount);
            expect(previews.map((action) => action?.reportActionID).sort()).toEqual(requests.map((request) => request.reportPreviewAction.reportActionID).sort());
            expect(Object.values(actions ?? {}).filter((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED)).toHaveLength(1);

            // When reconciliation only partially updates the first preview and removes later previews
            await Onyx.merge(actionsKey, {
                [first.reportPreviewAction.reportActionID]: {pendingAction: null},
                ...Object.fromEntries(requests.slice(1).map((request) => [request.reportPreviewAction.reportActionID, null])),
            });
            await waitForBatchedUpdates();

            // Then the surviving preview still has the fields needed to render, without refreshing the chat
            const reconciledActions = await getOnyxValue(actionsKey);
            expect(reconciledActions?.[first.reportPreviewAction.reportActionID]?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW);
            expect(reconciledActions?.[first.reportPreviewAction.reportActionID]?.created).toBe(first.reportPreviewAction.created);
        });

        it('still initializes a different destination chat with SET', () => {
            // Given a prior batch item created an expense report under another chat
            const first = buildP2PScan('8000');
            // When a later call resolves to a different, uncached destination chat
            const second = buildP2PScan('8001', first.iouReport, '9000');
            // Then data from the old destination does not suppress initialization of the new chat
            expect(second.onyxData.optimisticData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}9000`)?.onyxMethod).toBe(Onyx.METHOD.SET);
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

    describe('report preview action from the threaded chat report actions', () => {
        const EXPENSE_REPORT_ID = 'expense-report-with-preview';
        const PREVIEW_ACTION_ID = 'report-preview-action-1';
        const DM_REPORT_ID = 'report-dm-1';
        const IOU_REPORT_ID = 'iou-report-with-preview';

        // The preview actions below are only ever supplied through the params and deliberately never written to Onyx,
        // so the deprecated getAllReportActionsFromIOU fallback inside getReportPreviewReportAction cannot be their source.
        const buildReportPreviewAction = (linkedReportID: string) =>
            ({
                reportActionID: PREVIEW_ACTION_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-01-02 00:00:00',
                message: [{type: 'COMMENT', html: '', text: ''}],
                originalMessage: {linkedReportID},
            }) as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>;

        beforeEach(async () => {
            // `canAddTransaction` requires the submitter to own the report and the policy to be a group policy.
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: PAYEE_ACCOUNT_ID, email: 'payee@example.com'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentChatReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, {
                reportID: EXPENSE_REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: POLICY_ID,
                chatReportID: CHAT_REPORT_ID,
                ownerAccountID: PAYEE_ACCOUNT_ID,
                managerID: PAYEE_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                currency: 'USD',
                total: 0,
                created: '2024-01-02',
            });
            await waitForBatchedUpdates();
        });

        it('reuses the existing report preview action supplied via parentChatReportActions when the parent chat report is used', () => {
            // Given an existing expense report on the parent chat and a REPORT_PREVIEW action linked to it that is
            // supplied only through the parentChatReportActions param.
            const parentChatReportActions = {[PREVIEW_ACTION_ID]: buildReportPreviewAction(EXPENSE_REPORT_ID)};

            // When a new expense is added to that existing report.
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal, moneyRequestReportID: EXPENSE_REPORT_ID, parentChatReportActions});

            // Then the supplied preview action is found and updated in place instead of a new optimistic
            // REPORT_PREVIEW action being built, proving the threaded data is used over the deprecated fallback.
            expect(result.chatReport.reportID).toBe(CHAT_REPORT_ID);
            expect(result.iouReport.reportID).toBe(EXPENSE_REPORT_ID);
            expect(result.reportPreviewAction.reportActionID).toBe(PREVIEW_ACTION_ID);
        });

        it('ignores participantChatReportActions when the parent chat report is used', () => {
            // Given the parent chat report is kept as the chat report, its own actions are empty, and a matching
            // REPORT_PREVIEW action exists only in participantChatReportActions, which belong to a different chat.
            const participantChatReportActions = {[PREVIEW_ACTION_ID]: buildReportPreviewAction(EXPENSE_REPORT_ID)};

            // When a new expense is added to the existing report.
            const result = getMoneyRequestInformation({
                ...baseParams,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                moneyRequestReportID: EXPENSE_REPORT_ID,
                parentChatReportActions: {},
                participantChatReportActions,
            });

            // Then a new optimistic preview action is built, because only the actions of the chat report that was
            // actually resolved may be searched. Mixing in another chat's actions would attach the expense to the wrong preview.
            expect(result.chatReport.reportID).toBe(CHAT_REPORT_ID);
            expect(result.reportPreviewAction.reportActionID).not.toBe(PREVIEW_ACTION_ID);
        });

        it('reuses the report preview action supplied via participantChatReportActions when the policy expense chat comes from the participant', () => {
            // Given no parent chat report (the flow starts from the global create menu), so the policy expense chat is
            // looked up by participant.reportID, and a REPORT_PREVIEW action supplied only through participantChatReportActions.
            const participantChatReportActions = {[PREVIEW_ACTION_ID]: buildReportPreviewAction(EXPENSE_REPORT_ID)};

            // When a new expense is added to the existing report.
            const result = getMoneyRequestInformation({
                ...baseParams,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                parentChatReport: undefined,
                moneyRequestReportID: EXPENSE_REPORT_ID,
                participantChatReportActions,
            });

            // Then the participant's chat is used and its preview action is reused, since without a parent chat
            // report the participant's chat actions are the only place the existing preview can come from.
            expect(result.chatReport.reportID).toBe(CHAT_REPORT_ID);
            expect(result.reportPreviewAction.reportActionID).toBe(PREVIEW_ACTION_ID);
        });

        it('reuses the report preview action supplied via participantChatReportActions when the chat is found by participants', async () => {
            // Given an existing 1:1 chat between the payee and the payer with an open IOU report, no parent chat report,
            // and a REPORT_PREVIEW action for that IOU report supplied only through participantChatReportActions.
            const participants = {
                [PAYEE_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [PAYER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${DM_REPORT_ID}`, {reportID: DM_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, participants});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`, {
                reportID: IOU_REPORT_ID,
                type: CONST.REPORT.TYPE.IOU,
                chatReportID: DM_REPORT_ID,
                ownerAccountID: PAYEE_ACCOUNT_ID,
                managerID: PAYER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                currency: 'USD',
                total: 0,
                participants,
            });
            await waitForBatchedUpdates();
            const participantChatReportActions = {[PREVIEW_ACTION_ID]: buildReportPreviewAction(IOU_REPORT_ID)};

            // When a new expense is submitted to the payer on that IOU report.
            const result = getMoneyRequestInformation({
                ...baseParams,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
                parentChatReport: undefined,
                participantParams: {
                    payeeAccountID: PAYEE_ACCOUNT_ID,
                    payeeEmail: 'payee@example.com',
                    participant: {accountID: PAYER_ACCOUNT_ID, login: 'payer@example.com'},
                },
                moneyRequestReportID: IOU_REPORT_ID,
                participantChatReportActions,
            });

            // Then the 1:1 chat found by getChatByParticipants is used and its preview action is reused, so callers
            // only need to pass that single chat's actions instead of the whole report actions collection.
            expect(result.chatReport.reportID).toBe(DM_REPORT_ID);
            expect(result.iouReport.reportID).toBe(IOU_REPORT_ID);
            expect(result.reportPreviewAction.reportActionID).toBe(PREVIEW_ACTION_ID);
        });

        it('builds a new optimistic report preview action when no chat report actions are passed', () => {
            // Given the same existing expense report but undefined parentChatReportActions and participantChatReportActions,
            // and no report actions in Onyx, so neither the params nor the deprecated fallback can find an existing preview action.
            // When a new expense is added to that existing report.
            const result = getMoneyRequestInformation({...baseParams, getCurrencyDecimals: getCurrencyDecimalsLocal, moneyRequestReportID: EXPENSE_REPORT_ID});

            // Then a brand-new optimistic preview action is generated, confirming the reuse in the tests above
            // really came from the threaded chat report actions rather than some other source.
            expect(result.iouReport.reportID).toBe(EXPENSE_REPORT_ID);
            expect(result.reportPreviewAction.reportActionID).not.toBe(PREVIEW_ACTION_ID);
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
