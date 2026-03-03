import Onyx from 'react-native-onyx';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {getReportAction} from '@libs/ReportActionsUtils';
import {getIcons, isChatThread, isExpenseRequest, isTaskReport, isTripRoom, isWorkspaceTaskReport, shouldReportShowSubscript} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {
    createExpenseReport,
    createGroupChat,
    createInvoiceReport,
    createInvoiceRoom,
    createIOUReport,
    createPolicyExpenseChat,
    createPolicyExpenseChatTask,
    createPolicyExpenseChatThread,
    createRegularChat,
    createTripRoom,
    createWorkspaceTaskReport,
    createWorkspaceThread,
} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// ─── Test Constants ──────────────────────────────────────────────────────────

const CURRENT_USER_ACCOUNT_ID = 1;
const POLICY_ID = 'testPolicy';

const PERSONAL_DETAILS: PersonalDetailsList = Object.fromEntries([
    [1, {accountID: 1, displayName: 'Current User', avatar: 'https://avatar/1', login: 'user1@test.com'}],
    [2, {accountID: 2, displayName: 'User Two', avatar: 'https://avatar/2', login: 'user2@test.com'}],
    [3, {accountID: 3, displayName: 'User Three', avatar: 'https://avatar/3', login: 'user3@test.com'}],
    [4, {accountID: 4, displayName: 'User Four', avatar: 'https://avatar/4', login: 'user4@test.com'}],
    [5, {accountID: 5, displayName: 'Delegate User', avatar: 'https://avatar/5', login: 'user5@test.com'}],
]);

const TEST_POLICY: Policy = {
    id: POLICY_ID,
    name: 'Test Workspace',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    owner: 'user1@test.com',
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    isPolicyExpenseChatEnabled: true,
    outputCurrency: 'USD',
} as Policy;

const RECEIVER_POLICY_ID = 'receiverPolicy';

// Parent reports for thread resolution
const PARENT_PEC_REPORT_ID = 'parentPEC';
const PARENT_DM_REPORT_ID = 'parentDM';
const PARENT_EXPENSE_REPORT_ID = 'parentExpense';
const INTERMEDIATE_TASK_REPORT_ID = 'intermediateTask';
const B2B_INVOICE_ROOM_ID = 'b2bInvoiceRoom';
const ACTION_PEC_ID = 'actionPEC';
const ACTION_EXPENSE_REQ_ID = 'actionExpReq';

// ─── Pipeline Helper ─────────────────────────────────────────────────────────

type ComputeParams = {
    report: Report;
    policy?: Policy | null;
    isReportArchived?: boolean;
    iouSenderID?: number;
    delegateAccountID?: number;
};

type AvatarResult = {
    icons: Icon[];
    shouldShowSubscript: boolean;
    avatarType: 'single' | 'subscript' | 'diagonal';
};

/**
 * Simulates the full 4-stage LHN avatar pipeline using real production functions.
 *
 * Stage 1 (SidebarUtils.getOptionData): shouldShowSubscript + icon trimming
 * Stage 2 (OptionRowLHNData): IOU sender trimming
 * Stage 3 (OptionRowLHN): Delegate icon replacement
 * Stage 4 (LHNAvatar): Avatar type decision
 */
function computeAvatarResult({report, policy = TEST_POLICY, isReportArchived = false, iouSenderID, delegateAccountID}: ComputeParams): AvatarResult {
    // Stage 1: SidebarUtils subscript + icon logic
    const rawShouldShowSubscript = shouldReportShowSubscript(report, isReportArchived);
    const threadSuppression = isChatThread(report) && !isTripRoom(report) && !(isExpenseRequest(report) && !!policy);
    const parentReportAction = getReportAction(report.parentReportID, report.parentReportActionID);
    const taskParentAction = isTaskReport(report) && !report.chatReportID ? undefined : parentReportAction;
    const isReportPreviewOrNoAction = !taskParentAction || taskParentAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    const taskSuppression = isTaskReport(report) && !(isWorkspaceTaskReport(report) && isReportPreviewOrNoAction);
    const shouldShowSubscript = rawShouldShowSubscript && !threadSuppression && !taskSuppression;

    const formatPhoneNumber = (s: string) => s;
    let icons = getIcons(report, formatPhoneNumber, PERSONAL_DETAILS, null, '', -1, policy, undefined, isReportArchived);

    if (!shouldShowSubscript && report.type !== CONST.REPORT.TYPE.IOU && report.type !== CONST.REPORT.TYPE.INVOICE && icons.length > 1) {
        const firstIcon = icons.at(0);
        icons = firstIcon ? [firstIcon] : [];
    }

    // Stage 2: OptionRowLHNData — IOU sender trimming
    if (report.type === CONST.REPORT.TYPE.IOU && iouSenderID !== undefined && icons.length > 1) {
        const senderIcon = icons.find((icon) => Number(icon.id) === iouSenderID);
        icons = [senderIcon ?? icons.at(0)].filter((icon): icon is Icon => !!icon);
    }

    // Stage 3: OptionRowLHN — Delegate icon replacement
    const skipDelegateForTask = isTaskReport(report) && !report.chatReportID;
    if (delegateAccountID && PERSONAL_DETAILS[delegateAccountID] && icons.length > 0 && !skipDelegateForTask) {
        const delegateDetails = PERSONAL_DETAILS[delegateAccountID];
        const firstIcon = icons.at(0);
        if (firstIcon && delegateDetails) {
            icons = [{...firstIcon, source: delegateDetails.avatar ?? '', name: delegateDetails.displayName ?? '', id: delegateAccountID}, ...icons.slice(1)];
        }
    }

    // Stage 4: LHNAvatar — Avatar type decision
    let avatarType: 'single' | 'subscript' | 'diagonal';
    if (icons.length <= 1) {
        avatarType = 'single';
    } else if (shouldShowSubscript) {
        avatarType = 'subscript';
    } else {
        avatarType = 'diagonal';
    }

    return {icons, shouldShowSubscript, avatarType};
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LHN Avatar Pipeline', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        initOnyxDerivedValues();

        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'user1@test.com'});
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, TEST_POLICY);

        // Parent DM chat (for personal task cases)
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_DM_REPORT_ID}`, {
            reportID: PARENT_DM_REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: undefined,
        } as Report);

        // Parent policy expense chat (for thread cases)
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_PEC_REPORT_ID}`, {
            reportID: PARENT_PEC_REPORT_ID,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            type: CONST.REPORT.TYPE.CHAT,
            policyID: POLICY_ID,
            ownerAccountID: 2,
            isOwnPolicyExpenseChat: false,
        } as Report);

        // Intermediate task report (for nested task cases: task → task → PEC)
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${INTERMEDIATE_TASK_REPORT_ID}`, {
            reportID: INTERMEDIATE_TASK_REPORT_ID,
            type: CONST.REPORT.TYPE.TASK,
            policyID: POLICY_ID,
            ownerAccountID: 2,
            parentReportID: PARENT_PEC_REPORT_ID,
        } as Report);

        // Parent expense report (for expense request cases)
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_EXPENSE_REPORT_ID}`, {
            reportID: PARENT_EXPENSE_REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: POLICY_ID,
            ownerAccountID: 2,
        } as Report);

        // Invoice room (for individual invoice report cases)
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}invoiceRoom`, {
            reportID: 'invoiceRoom',
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            type: CONST.REPORT.TYPE.CHAT,
            policyID: POLICY_ID,
            invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 3},
        } as Report);

        // Receiver policy (for B2B invoice cases)
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${RECEIVER_POLICY_ID}`, {
            id: RECEIVER_POLICY_ID,
            name: 'Receiver Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: 'user2@test.com',
            ownerAccountID: 2,
            outputCurrency: 'USD',
        } as Policy);

        // B2B invoice room (for B2B invoice report cases)
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${B2B_INVOICE_ROOM_ID}`, {
            reportID: B2B_INVOICE_ROOM_ID,
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            type: CONST.REPORT.TYPE.CHAT,
            policyID: POLICY_ID,
            invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: RECEIVER_POLICY_ID},
        } as Report);

        // Report actions for parent PEC (actor = account 2)
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_PEC_REPORT_ID}`, {
            [ACTION_PEC_ID]: {
                reportActionID: ACTION_PEC_ID,
                actorAccountID: 2,
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: '2024-01-01',
            },
        });

        // Report actions for parent expense report (transaction thread action)
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_EXPENSE_REPORT_ID}`, {
            [ACTION_EXPENSE_REQ_ID]: {
                reportActionID: ACTION_EXPENSE_REQ_ID,
                actorAccountID: 2,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    IOUTransactionID: 'tx-1',
                    amount: 100,
                    currency: 'USD',
                },
                created: '2024-01-01',
            },
        });

        await waitForBatchedUpdates();
    });

    afterAll(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    // ── Case 1: 1:1 DM ─────────────────────────────────────────────────
    it('1:1 DM → single avatar', () => {
        const report = createRegularChat(100, [CURRENT_USER_ACCOUNT_ID, 2]);
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
    });

    // ── Case 2: Group Chat ──────────────────────────────────────────────
    it('Group Chat → single avatar (group icon)', () => {
        const report = createGroupChat(101, [CURRENT_USER_ACCOUNT_ID, 2, 3]);
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
    });

    // ── Case 3: Policy Expense Chat (not own) ───────────────────────────
    it('Policy Expense Chat (not own) → subscript', () => {
        const report = {
            ...createPolicyExpenseChat(102, false),
            policyID: POLICY_ID,
            ownerAccountID: 2,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 4: Policy Expense Chat (own, thread) → thread suppression ──
    it('Policy Expense Chat (own, thread) → single (thread suppression)', () => {
        const report = {
            ...createPolicyExpenseChatThread(103),
            policyID: POLICY_ID,
            parentReportID: PARENT_PEC_REPORT_ID,
            parentReportActionID: ACTION_PEC_ID,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
    });

    // ── Case 5: Expense Request ─────────────────────────────────────────
    it('Expense Request → subscript', () => {
        const report: Report = {
            ...createRegularChat(104, [CURRENT_USER_ACCOUNT_ID, 2]),
            type: CONST.REPORT.TYPE.IOU,
            policyID: POLICY_ID,
            parentReportID: PARENT_EXPENSE_REPORT_ID,
            parentReportActionID: ACTION_EXPENSE_REQ_ID,
            isOwnPolicyExpenseChat: false,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 6: Expense Report ──────────────────────────────────────────
    it('Expense Report → subscript', () => {
        const report = {
            ...createExpenseReport(105),
            policyID: POLICY_ID,
            ownerAccountID: 2,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 7: IOU (multi-sender) ─────────────────────────────────────
    it('IOU (multi-sender) → diagonal', () => {
        const report = createIOUReport(106, 2, 3);
        const result = computeAvatarResult({report, iouSenderID: undefined});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('diagonal');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 8: IOU (single sender, request) ───────────────────────────
    it('IOU (single sender, request) → single (trimmed to owner)', () => {
        const report = createIOUReport(107, 2, 3);
        const result = computeAvatarResult({report, iouSenderID: 2});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
        expect(Number(result.icons.at(0)?.id)).toBe(2);
    });

    // ── Case 9: IOU (single sender, send money) ────────────────────────
    it('IOU (single sender, send money) → single (trimmed to manager)', () => {
        const report = createIOUReport(108, 2, 3);
        const result = computeAvatarResult({report, iouSenderID: 3});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
        expect(Number(result.icons.at(0)?.id)).toBe(3);
    });

    // ── Case 10: Workspace Thread ───────────────────────────────────────
    it('Workspace Thread → single (thread suppression)', () => {
        const report = {
            ...createWorkspaceThread(109),
            policyID: POLICY_ID,
            parentReportID: PARENT_PEC_REPORT_ID,
            parentReportActionID: ACTION_PEC_ID,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
    });

    // ── Case 11: Expense Request Thread (with policy) ───────────────────
    it('Expense Request Thread (with policy) → subscript (not suppressed)', () => {
        // A CHAT-type thread whose parent is an expense report with a transaction thread action.
        // isExpenseRequest returns true, which cancels thread suppression.
        const report: Report = {
            reportID: '110',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: undefined,
            policyID: POLICY_ID,
            ownerAccountID: 2,
            parentReportID: PARENT_EXPENSE_REPORT_ID,
            parentReportActionID: ACTION_EXPENSE_REQ_ID,
            isOwnPolicyExpenseChat: false,
        } as Report;
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 12: Task Report (workspace, online with chatReportID) → single
    // Once the server responds, chatReportID is set. The header resolves the
    // parent action as ADDCOMMENT (not REPORT_PREVIEW) → shows single.
    it('Task Report (workspace, online with chatReportID) → single', () => {
        const report = {
            ...createWorkspaceTaskReport(111, [CURRENT_USER_ACCOUNT_ID, 2], PARENT_PEC_REPORT_ID),
            policyID: POLICY_ID,
            ownerAccountID: 2,
            parentReportActionID: ACTION_PEC_ID,
            chatReportID: PARENT_PEC_REPORT_ID,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
    });

    // ── Case 12b: Nested workspace task (task → task → PEC) ─────────────
    it('Nested workspace task (task → task → PEC) → subscript', () => {
        const report = {
            ...createWorkspaceTaskReport(122, [CURRENT_USER_ACCOUNT_ID, 2], INTERMEDIATE_TASK_REPORT_ID),
            policyID: POLICY_ID,
            ownerAccountID: 2,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 13: Trip Room ──────────────────────────────────────────────
    it('Trip Room → subscript', () => {
        const report = {
            ...createTripRoom(112),
            policyID: POLICY_ID,
            parentReportID: PARENT_PEC_REPORT_ID,
            parentReportActionID: ACTION_PEC_ID,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 14: Invoice Room ───────────────────────────────────────────
    it('Invoice Room → subscript', () => {
        const report = {
            ...createInvoiceRoom(113),
            policyID: POLICY_ID,
            invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 3},
        } as Report;
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 15: Invoice Report (non-B2B) ───────────────────────────────
    it('Invoice Report (non-B2B) → subscript', () => {
        const report = {
            ...createInvoiceReport(114),
            policyID: POLICY_ID,
            chatReportID: 'invoiceRoom',
            parentReportID: 'invoiceRoom',
        } as Report;
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 15b: Invoice Report (B2B) → diagonal (two workspace icons) ──
    it('Invoice Report (B2B) → diagonal (two workspace avatars)', () => {
        const report = {
            ...createInvoiceReport(119),
            policyID: POLICY_ID,
            chatReportID: B2B_INVOICE_ROOM_ID,
            parentReportID: B2B_INVOICE_ROOM_ID,
        } as Report;
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('diagonal');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 16: Archived Expense Report ────────────────────────────────
    it('Archived Expense Report → subscript (archival does not suppress expense reports)', () => {
        const report = {
            ...createExpenseReport(115),
            policyID: POLICY_ID,
            ownerAccountID: 2,
        };
        const result = computeAvatarResult({report, isReportArchived: true});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 17: Archived Non-Expense Chat ──────────────────────────────
    it('Archived Non-Expense Chat → single (archival suppresses subscript for non-expense chats)', () => {
        const report = createRegularChat(116, [CURRENT_USER_ACCOUNT_ID, 2]);
        const result = computeAvatarResult({report, isReportArchived: true});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
    });

    // ── Case 18: With delegate ──────────────────────────────────────────
    it('With delegate → first icon replaced with delegate details', () => {
        const report = {
            ...createPolicyExpenseChat(117, false),
            policyID: POLICY_ID,
            ownerAccountID: 2,
        };
        const resultWithoutDelegate = computeAvatarResult({report});
        const resultWithDelegate = computeAvatarResult({report, delegateAccountID: 5});

        // Same structure (subscript, 2 icons)
        expect(resultWithDelegate.shouldShowSubscript).toBe(resultWithoutDelegate.shouldShowSubscript);
        expect(resultWithDelegate.avatarType).toBe(resultWithoutDelegate.avatarType);
        expect(resultWithDelegate.icons).toHaveLength(resultWithoutDelegate.icons.length);

        // First icon replaced with delegate details
        expect(resultWithDelegate.icons.at(0)?.id).toBe(5);
        expect(resultWithDelegate.icons.at(0)?.name).toBe('Delegate User');
        expect(resultWithDelegate.icons.at(0)?.source).toBe('https://avatar/5');
    });

    // ── Case 19: Policy Expense Chat + Task (no parent PEC in Onyx) ─────
    // shouldReportShowSubscript excludes tasks from PEC path (lines 9987/9991),
    // and isWorkspaceTaskReport needs a parent PEC in Onyx (which this report lacks).
    // Header also shows SINGLE for this edge case — both pipelines agree.
    it('Policy Expense Chat Task (no parent PEC) → single (matches header)', () => {
        const report = {
            ...createPolicyExpenseChatTask(118),
            policyID: POLICY_ID,
            ownerAccountID: 2,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
    });

    // ── Case 20: Invoice report shows correct workspace icon when invoice room is not loaded ──
    it('Invoice Report (invoice room not in Onyx) → workspace icon uses policy name, not "Unavailable workspace"', () => {
        const report = {
            ...createInvoiceReport(120),
            policyID: POLICY_ID,
            chatReportID: 'nonExistentRoom',
            parentReportID: 'nonExistentRoom',
        } as Report;
        const result = computeAvatarResult({report});

        expect(result.icons.at(0)?.name).toBe('Test Workspace');
        expect(result.icons.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
    });

    // ── Case 12c: Personal task (parent is DM) → SINGLE ──────────────
    it('Task Report (personal, parent is DM) → single', () => {
        const report = {
            ...createWorkspaceTaskReport(123, [CURRENT_USER_ACCOUNT_ID, 2], PARENT_DM_REPORT_ID),
            policyID: undefined,
            ownerAccountID: 2,
        } as unknown as Report;
        const result = computeAvatarResult({report, policy: null});

        expect(result.shouldShowSubscript).toBe(false);
        expect(result.avatarType).toBe('single');
        expect(result.icons).toHaveLength(1);
    });

    // ── Case 12d: Direct workspace task offline (no chatReportID) → SUBSCRIPT
    it('Task Report (workspace, offline without chatReportID) → subscript', () => {
        const report = {
            ...createWorkspaceTaskReport(124, [CURRENT_USER_ACCOUNT_ID, 2], PARENT_PEC_REPORT_ID),
            policyID: POLICY_ID,
            ownerAccountID: 2,
            parentReportActionID: ACTION_PEC_ID,
        };
        const result = computeAvatarResult({report});

        expect(result.shouldShowSubscript).toBe(true);
        expect(result.avatarType).toBe('subscript');
        expect(result.icons).toHaveLength(2);
    });

    // ── Case 21: Delegate skipped for task without chatReportID ──────
    it('Delegate skipped for task without chatReportID', () => {
        const report = {
            ...createWorkspaceTaskReport(125, [CURRENT_USER_ACCOUNT_ID, 2], PARENT_PEC_REPORT_ID),
            policyID: POLICY_ID,
            ownerAccountID: 2,
        };
        const result = computeAvatarResult({report, delegateAccountID: 5});

        expect(result.icons.at(0)?.id).not.toBe(5);
    });

    // ── Case 22: Delegate applied for task WITH chatReportID ─────────
    it('Delegate applied for task with chatReportID', () => {
        const report = {
            ...createWorkspaceTaskReport(126, [CURRENT_USER_ACCOUNT_ID, 2], PARENT_PEC_REPORT_ID),
            policyID: POLICY_ID,
            ownerAccountID: 2,
            parentReportActionID: ACTION_PEC_ID,
            chatReportID: PARENT_PEC_REPORT_ID,
        };
        const result = computeAvatarResult({report, delegateAccountID: 5});

        expect(result.icons.at(0)?.id).toBe(5);
    });
});
