import {renderHook} from '@testing-library/react-native';

import useActionAvatar from '@components/Avatar/connected/useActionAvatar';
import getAvatarLayout from '@components/Avatar/layouts/getAvatarLayout';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportActionAvatars from '@components/ReportActionAvatars/useReportActionAvatars';
import type UseReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';

import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportAction} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

const USER_ACCOUNT_ID = 1;
const MANAGER_ACCOUNT_ID = 2;
const DELEGATE_ACCOUNT_ID = 3;
const AGENT_ACCOUNT_ID = 4;

const POLICY_ID = 'AAAA1111';
const RECEIVER_POLICY_ID = 'BBBB2222';
const DM_ID = '100';
const IOU_REPORT_ID = '101';
const WORKSPACE_CHAT_ID = '200';
const EXPENSE_REPORT_ID = '201';
const INVOICE_ROOM_ID = '300';
const INVOICE_REPORT_ID = '301';
const B2B_INVOICE_ROOM_ID = '400';
const B2B_INVOICE_REPORT_ID = '401';
const TRIP_ROOM_ID = '500';
const SINGLE_SENDER_IOU_REPORT_ID = '600';
const TASK_REPORT_ID = '700';
const PENDING_B2B_INVOICE_ROOM_ID = '900';
const PENDING_B2B_INVOICE_REPORT_ID = '901';
const NO_WORKSPACE_INVOICE_ROOM_ID = '910';
const NO_WORKSPACE_INVOICE_REPORT_ID = '911';
const SEARCH_IOU_REPORT_ID = '920';
const TRANSACTION_THREAD_ID = '800';
const PREVIEW_ID = '9001';

const personalDetails: PersonalDetailsList = {
    [USER_ACCOUNT_ID]: {
        accountID: USER_ACCOUNT_ID,
        login: 'user@example.com',
        displayName: 'User Name',
        avatar: 'https://example.com/user.png',
        status: {emojiCode: '🌴', text: 'Away', clearAfter: ''},
        timezone: {selected: 'Europe/Warsaw'},
    },
    [MANAGER_ACCOUNT_ID]: {accountID: MANAGER_ACCOUNT_ID, login: 'manager@example.com', displayName: 'Manager Name', avatar: 'https://example.com/manager.png'},
    [DELEGATE_ACCOUNT_ID]: {accountID: DELEGATE_ACCOUNT_ID, login: 'copilot@example.com', displayName: 'Copilot Name', avatar: 'https://example.com/copilot.png'},
    [AGENT_ACCOUNT_ID]: {accountID: AGENT_ACCOUNT_ID, login: 'agent@example.com', displayName: 'Agent Smith', firstName: 'Agent', avatar: 'https://example.com/agent.png'},
    [CONST.ACCOUNT_ID.CONCIERGE]: {accountID: CONST.ACCOUNT_ID.CONCIERGE, login: CONST.EMAIL.CONCIERGE, displayName: 'Concierge', avatar: 'https://example.com/concierge.png'},
};

const policy: Partial<Policy> = {id: POLICY_ID, name: 'Sender Workspace', type: CONST.POLICY.TYPE.TEAM, avatarURL: 'https://example.com/ws.png'};
const receiverPolicy: Partial<Policy> = {id: RECEIVER_POLICY_ID, name: 'Receiver Workspace', type: CONST.POLICY.TYPE.TEAM, avatarURL: 'https://example.com/receiver.png'};

const dm: Report = {
    reportID: DM_ID,
    type: CONST.REPORT.TYPE.CHAT,
    participants: {[USER_ACCOUNT_ID]: {notificationPreference: 'always'}, [MANAGER_ACCOUNT_ID]: {notificationPreference: 'always'}},
};
const iouReport: Report = {
    reportID: IOU_REPORT_ID,
    type: CONST.REPORT.TYPE.IOU,
    chatReportID: DM_ID,
    parentReportID: DM_ID,
    parentReportActionID: PREVIEW_ID,
    ownerAccountID: USER_ACCOUNT_ID,
    managerID: MANAGER_ACCOUNT_ID,
};
const workspaceChat: Report = {
    reportID: WORKSPACE_CHAT_ID,
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: POLICY_ID,
    ownerAccountID: USER_ACCOUNT_ID,
};
const expenseReport: Report = {
    reportID: EXPENSE_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    chatReportID: WORKSPACE_CHAT_ID,
    parentReportID: WORKSPACE_CHAT_ID,
    parentReportActionID: PREVIEW_ID,
    policyID: POLICY_ID,
    ownerAccountID: USER_ACCOUNT_ID,
    managerID: MANAGER_ACCOUNT_ID,
};
const invoiceRoom: Report = {
    reportID: INVOICE_ROOM_ID,
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
    policyID: POLICY_ID,
    invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: MANAGER_ACCOUNT_ID},
};
const invoiceReport: Report = {
    reportID: INVOICE_REPORT_ID,
    type: CONST.REPORT.TYPE.INVOICE,
    chatReportID: INVOICE_ROOM_ID,
    parentReportID: INVOICE_ROOM_ID,
    parentReportActionID: PREVIEW_ID,
    policyID: POLICY_ID,
    ownerAccountID: USER_ACCOUNT_ID,
    managerID: MANAGER_ACCOUNT_ID,
};
const b2bInvoiceRoom: Report = {
    ...invoiceRoom,
    reportID: B2B_INVOICE_ROOM_ID,
    invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: RECEIVER_POLICY_ID},
};
const b2bInvoiceReport: Report = {...invoiceReport, reportID: B2B_INVOICE_REPORT_ID, chatReportID: B2B_INVOICE_ROOM_ID, parentReportID: B2B_INVOICE_ROOM_ID};
// The current user just sent this report's only expense, so its optimistic preview singles them out.
const singleSenderIOUReport: Report = {...iouReport, reportID: SINGLE_SENDER_IOU_REPORT_ID};
// The receiving workspace's policy has not loaded yet, so the receiver has no name.
const pendingB2BInvoiceRoom: Report = {...b2bInvoiceRoom, reportID: PENDING_B2B_INVOICE_ROOM_ID, invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: 'CCCC3333'}};
const pendingB2BInvoiceReport: Report = {...invoiceReport, reportID: PENDING_B2B_INVOICE_REPORT_ID, chatReportID: PENDING_B2B_INVOICE_ROOM_ID, parentReportID: PENDING_B2B_INVOICE_ROOM_ID};
// Neither the invoice nor its room names a workspace yet.
const noWorkspaceInvoiceRoom: Report = {...invoiceRoom, reportID: NO_WORKSPACE_INVOICE_ROOM_ID, policyID: undefined};
const noWorkspaceInvoiceReport: Report = {
    ...invoiceReport,
    reportID: NO_WORKSPACE_INVOICE_REPORT_ID,
    chatReportID: NO_WORKSPACE_INVOICE_ROOM_ID,
    parentReportID: NO_WORKSPACE_INVOICE_ROOM_ID,
    policyID: undefined,
};
// On Search, the snapshot can hold an IOU report preview without its chat's actions.
const searchIOUReport: Report = {...iouReport, reportID: SEARCH_IOU_REPORT_ID};
// A canceled task renders its header without an action, so the avatar falls back to the task report itself.
const taskReport: Report = {reportID: TASK_REPORT_ID, type: CONST.REPORT.TYPE.TASK, parentReportID: DM_ID, ownerAccountID: USER_ACCOUNT_ID, managerID: MANAGER_ACCOUNT_ID};
// A deleted expense's thread renders the expense it hangs off.
const transactionThread: Report = {
    reportID: TRANSACTION_THREAD_ID,
    type: CONST.REPORT.TYPE.CHAT,
    parentReportID: EXPENSE_REPORT_ID,
    chatReportID: EXPENSE_REPORT_ID,
    parentReportActionID: PREVIEW_ID,
    policyID: POLICY_ID,
};
const tripRoom: Report = {reportID: TRIP_ROOM_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM, chatReportID: WORKSPACE_CHAT_ID, policyID: POLICY_ID};

const baseAction = {reportActionID: PREVIEW_ID, created: '2024-01-01 00:00:00', actorAccountID: USER_ACCOUNT_ID};

const comment = (overrides: Partial<ReportAction> = {}): ReportAction =>
    ({...baseAction, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, message: [{type: 'COMMENT', html: 'Hi', text: 'Hi'}], ...overrides}) as ReportAction;

const reportPreview = (childReport: Report, overrides: Partial<ReportAction> = {}): ReportAction =>
    ({
        ...baseAction,
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        childReportID: childReport.reportID,
        childOwnerAccountID: childReport.ownerAccountID,
        childManagerAccountID: childReport.managerID,
        originalMessage: {linkedReportID: childReport.reportID},
        ...overrides,
    }) as ReportAction;

const harvestedSubmit = {
    ...baseAction,
    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
    originalMessage: {amount: 100, currency: CONST.CURRENCY.USD, harvesting: true},
} as ReportAction;

const createdExpense = {
    ...baseAction,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 't1', IOUReportID: EXPENSE_REPORT_ID, amount: 100, currency: CONST.CURRENCY.USD},
} as ReportAction;

const tripPreview = {
    ...baseAction,
    actionName: CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW,
    childReportID: TRIP_ROOM_ID,
    originalMessage: {linkedReportID: TRIP_ROOM_ID},
} as ReportAction;

// Records what the sender lookup is asked for while still answering it, so the parity checks keep running on real lookups.
const mockSenderLookupCalls: unknown[] = [];
jest.mock('@components/ReportActionAvatars/useReportPreviewSenderID', () => {
    const actual = jest.requireActual<{default: typeof UseReportPreviewSenderID}>('@components/ReportActionAvatars/useReportPreviewSenderID');
    return {
        ...actual,
        __esModule: true,
        default: (params: Parameters<typeof actual.default>[0]) => {
            mockSenderLookupCalls.push(params);
            return actual.default(params);
        },
    };
});

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <CurrentUserPersonalDetailsProvider>{children}</CurrentUserPersonalDetailsProvider>
    </OnyxListItemProvider>
);

const pickIcon = (icon: Icon | undefined) => (icon ? {id: icon.id, name: icon.name, type: icon.type, source: icon.source} : undefined);

type Scenario = [name: string, report: Report, action: ReportAction | undefined, shouldUseRealActor: boolean, chatReportForAction: Report, isActionStored?: boolean];

const SCENARIOS: Scenario[] = [
    ['a comment in a DM', dm, comment(), false, dm],
    ['a copilot comment in a DM', dm, comment({delegateAccountID: DELEGATE_ACCOUNT_ID}), false, dm],
    [
        'a Concierge reply revealing a human agent',
        dm,
        comment({actorAccountID: CONST.ACCOUNT_ID.CONCIERGE, originalMessage: {html: 'Hi', whisperedTo: [], humanAgentAccountID: AGENT_ACCOUNT_ID}} as Partial<ReportAction>),
        false,
        dm,
    ],
    ['a comment in a workspace chat', workspaceChat, comment(), false, workspaceChat],
    ['a harvested submission in the inbox', expenseReport, harvestedSubmit, false, workspaceChat],
    ['a harvested submission on Search', expenseReport, harvestedSubmit, true, workspaceChat],
    ['a created expense in a workspace expense report', expenseReport, createdExpense, false, workspaceChat],
    ['an IOU report preview', iouReport, reportPreview(iouReport), false, dm],
    ['an IOU report preview with one sender', singleSenderIOUReport, reportPreview(singleSenderIOUReport, {isOptimisticAction: true}), false, dm],
    ['a copilot IOU report preview', iouReport, reportPreview(iouReport, {delegateAccountID: DELEGATE_ACCOUNT_ID}), false, dm],
    ['an expense report preview in a workspace chat', expenseReport, reportPreview(expenseReport), false, workspaceChat],
    ['an invoice preview to a person', invoiceReport, reportPreview(invoiceReport), false, invoiceRoom],
    ['an invoice preview to a workspace', b2bInvoiceReport, reportPreview(b2bInvoiceReport), false, b2bInvoiceRoom],
    ['a comment inside an invoice report', invoiceReport, comment(), false, invoiceRoom],
    ['a trip preview', workspaceChat, tripPreview, false, workspaceChat],
    ['a canceled task without its action', taskReport, undefined, false, dm],
    ['a deleted expense in its thread', transactionThread, createdExpense, false, expenseReport],
    ['an invoice preview to a workspace whose policy has not loaded', pendingB2BInvoiceReport, reportPreview(pendingB2BInvoiceReport), false, pendingB2BInvoiceRoom],
    ['an IOU report preview missing from its chat actions', searchIOUReport, reportPreview(searchIOUReport), false, dm, false],
];

describe('useActionAvatar', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Promise.all([
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails),
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy),
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${RECEIVER_POLICY_ID}`, receiverPolicy),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${DM_ID}`, dm),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`, iouReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${WORKSPACE_CHAT_ID}`, workspaceChat),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, expenseReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${INVOICE_ROOM_ID}`, invoiceRoom),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${INVOICE_REPORT_ID}`, invoiceReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${B2B_INVOICE_ROOM_ID}`, b2bInvoiceRoom),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${B2B_INVOICE_REPORT_ID}`, b2bInvoiceReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TRIP_ROOM_ID}`, tripRoom),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SINGLE_SENDER_IOU_REPORT_ID}`, singleSenderIOUReport),
            Onyx.merge(ONYXKEYS.SESSION, {accountID: USER_ACCOUNT_ID}),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TASK_REPORT_ID}`, taskReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TRANSACTION_THREAD_ID}`, transactionThread),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${PENDING_B2B_INVOICE_ROOM_ID}`, pendingB2BInvoiceRoom),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${PENDING_B2B_INVOICE_REPORT_ID}`, pendingB2BInvoiceReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${NO_WORKSPACE_INVOICE_ROOM_ID}`, noWorkspaceInvoiceRoom),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${NO_WORKSPACE_INVOICE_REPORT_ID}`, noWorkspaceInvoiceReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SEARCH_IOU_REPORT_ID}`, searchIOUReport),
        ]);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it.each(SCENARIOS)('should picture %s like the legacy avatars do', async (_, report, action, shouldUseRealActor, chatReportForAction, isActionStored = true) => {
        // Given the action stored in its chat, so report previews can find themselves through their report, unless the case leaves it out
        if (action && isActionStored) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportForAction.reportID}`, {[action.reportActionID]: action});
        }
        await waitForBatchedUpdates();

        // When both the legacy hook and the new one resolve the action's avatar from the same inputs ReportActionItemSingle passes
        const {result: legacy} = renderHook(() => useReportActionAvatars({report, action, shouldUseRealActor}), {wrapper});
        const {result: current} = renderHook(() => useActionAvatar({report, action, shouldUseRealActor}), {wrapper});
        await waitForBatchedUpdates();

        // Then the header reads the same details off both
        const legacyData = legacy.current;
        const currentData = current.current;
        expect({
            avatarType: currentData.avatarType,
            accountID: currentData.accountID,
            isWorkspaceActor: currentData.isWorkspaceActor,
            shouldDisplayAllActors: currentData.shouldDisplayAllActors,
            actorHint: currentData.actorHint,
            actedForAccountID: currentData.actedForAccountID,
            reportPreviewSenderID: currentData.reportPreviewSenderID,
            chatReportID: currentData.chatReportID,
            iouReportID: currentData.iouReportID,
            status: currentData.actorPersonalDetails?.status,
            timezone: currentData.actorPersonalDetails?.timezone,
            login: currentData.actorPersonalDetails?.login,
            pendingAvatar: currentData.actorPersonalDetails?.pendingFields?.avatar,
        }).toEqual({
            avatarType: legacyData.avatarType,
            accountID: legacyData.details.accountID,
            isWorkspaceActor: legacyData.details.isWorkspaceActor,
            shouldDisplayAllActors: legacyData.details.shouldDisplayAllActors,
            actorHint: legacyData.details.actorHint,
            actedForAccountID: legacyData.details.delegateAccountID,
            reportPreviewSenderID: legacyData.reportPreviewSenderID,
            chatReportID: legacyData.source.chatReport?.reportID,
            iouReportID: legacyData.source.iouReport?.reportID,
            status: legacyData.details.status,
            timezone: legacyData.details.timezone,
            login: legacyData.details.login,
            pendingAvatar: legacyData.details.pendingFields?.avatar,
        });

        // And the same avatars render in the same layout, with the same copilot badge
        const legacyLayout = getAvatarLayout({icons: legacyData.avatars, avatarType: legacyData.avatarType, shouldRequireSecondaryIconName: true});
        expect(currentData.layout).toBe(legacyLayout.layout);
        expect(pickIcon(currentData.primaryAvatar)).toEqual(pickIcon(legacyLayout.primaryIcon));
        if (currentData.layout !== CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE) {
            expect(pickIcon(currentData.secondaryAvatar)).toEqual(pickIcon(legacyLayout.secondaryIcon));
        }
        const legacyCopilotAccountID = legacyData.details.delegateAccountID ? getDelegateAccountIDFromReportAction(action) : undefined;
        expect(currentData.primaryAvatar.copilot?.accountID).toBe(currentData.layout === CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE ? legacyCopilotAccountID : undefined);
    });

    it('should not look up a report preview sender for an action that is not a report preview', async () => {
        // Given a plain comment, which every chat row renders most often
        const action = comment();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${DM_ID}`, {[action.reportActionID]: action});
        await waitForBatchedUpdates();
        mockSenderLookupCalls.length = 0;

        // When its avatar is resolved
        renderHook(() => useActionAvatar({report: dm, action, shouldUseRealActor: false}), {wrapper});
        await waitForBatchedUpdates();

        // Then the sender lookup gets nothing to subscribe to, so the row skips the transactions, splits and policy it reads
        expect(mockSenderLookupCalls.length).toBeGreaterThan(0);
        expect(mockSenderLookupCalls.every((call) => JSON.stringify(call) === JSON.stringify({}))).toBe(true);
    });

    it('should label an invoice preview by its sender until the invoice names its workspace', async () => {
        // Given an invoice preview whose invoice and room name no workspace yet, so the unknown account (ID 0) stands in for it.
        // This differs from the legacy avatars, which showed the receiver alone, but invoices are always sent from a workspace.
        const action = reportPreview(noWorkspaceInvoiceReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${NO_WORKSPACE_INVOICE_ROOM_ID}`, {[action.reportActionID]: action});
        await waitForBatchedUpdates();

        // When its avatar is resolved
        const {result} = renderHook(() => useActionAvatar({report: noWorkspaceInvoiceReport, action, shouldUseRealActor: false}), {wrapper});
        await waitForBatchedUpdates();

        // Then the accessibility label names the account the preview is credited to rather than reading "0"
        expect(result.current.actorHint).toBe('manager@example.com');
    });
});
