/* eslint-disable @typescript-eslint/no-deprecated -- report action fixtures write originalMessage, which the backend still sends */
import {renderHook} from '@testing-library/react-native';

import useActionAvatar from '@components/Avatar/connected/useActionAvatar';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type UseReportPreviewSenderID from '@hooks/useReportPreviewSenderID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportAction} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type ReportActionName from '@src/types/onyx/ReportActionName';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../../utils/createMock';
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
const OTHER_WORKSPACE_THREAD_ID = '930';
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
// An expense's thread that sits on another workspace than the report the expense is in.
const otherWorkspaceThread: Report = {reportID: OTHER_WORKSPACE_THREAD_ID, type: CONST.REPORT.TYPE.CHAT, parentReportID: EXPENSE_REPORT_ID, policyID: RECEIVER_POLICY_ID};
const tripRoom: Report = {reportID: TRIP_ROOM_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM, chatReportID: WORKSPACE_CHAT_ID, policyID: POLICY_ID};

const baseAction = {reportActionID: PREVIEW_ID, created: '2024-01-01 00:00:00', actorAccountID: USER_ACCOUNT_ID};

const comment = (overrides: Partial<ReportAction> = {}): ReportAction =>
    createMock<ReportAction>({...baseAction, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, message: [{type: 'COMMENT', html: 'Hi', text: 'Hi'}], ...overrides});

const reportPreview = (childReport: Report, overrides: Partial<ReportAction> = {}): ReportAction =>
    createMock<ReportAction>({
        ...baseAction,
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        childReportID: childReport.reportID,
        childOwnerAccountID: childReport.ownerAccountID,
        childManagerAccountID: childReport.managerID,
        originalMessage: {linkedReportID: childReport.reportID},
        ...overrides,
    });

const harvestedSubmit = createMock<ReportAction>({
    ...baseAction,
    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
    originalMessage: {amount: 100, currency: CONST.CURRENCY.USD, harvesting: true},
});

const createdExpense = createMock<ReportAction>({
    ...baseAction,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 't1', IOUReportID: EXPENSE_REPORT_ID, amount: 100, currency: CONST.CURRENCY.USD},
});

const tripPreview = createMock<ReportAction>({
    ...baseAction,
    actionName: CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW,
    childReportID: TRIP_ROOM_ID,
    originalMessage: {linkedReportID: TRIP_ROOM_ID},
});

// Records what the sender lookup is asked for while still answering it, so the scenarios keep running on real lookups.
const mockSenderLookupCalls: unknown[] = [];
jest.mock('@hooks/useReportPreviewSenderID', () => {
    const actual = jest.requireActual<{default: typeof UseReportPreviewSenderID}>('@hooks/useReportPreviewSenderID');
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

const USER_ICON = {id: USER_ACCOUNT_ID, name: 'User Name', type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/user.png'};
const MANAGER_ICON = {id: MANAGER_ACCOUNT_ID, name: 'Manager Name', type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/manager.png'};
const COPILOT_ICON = {id: DELEGATE_ACCOUNT_ID, name: 'Copilot Name', type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/copilot.png'};
// A human agent shows under their first name, so the subscript stays short next to Concierge.
const AGENT_ICON = {id: AGENT_ACCOUNT_ID, name: 'Agent', type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/agent.png'};
const CONCIERGE_ICON = {id: CONST.ACCOUNT_ID.CONCIERGE, name: 'Concierge', type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/concierge.png'};
const WORKSPACE_ICON = {id: POLICY_ID, name: 'Sender Workspace', type: CONST.ICON_TYPE_WORKSPACE, source: 'https://example.com/ws.png'};
const RECEIVER_WORKSPACE_ICON = {id: RECEIVER_POLICY_ID, name: 'Receiver Workspace', type: CONST.ICON_TYPE_WORKSPACE, source: 'https://example.com/receiver.png'};

// The header reads the actor's status, timezone and login next to the avatar.
const USER_PROFILE = {status: personalDetails[USER_ACCOUNT_ID]?.status, timezone: personalDetails[USER_ACCOUNT_ID]?.timezone, login: 'user@example.com'};

type ExpectedAvatar = {
    /** What the header reads off the hook next to the avatar */
    details: Record<string, unknown>;
    layout: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;
    primaryAvatar: ReturnType<typeof pickIcon>;

    /** Only checked for layouts that draw a second avatar */
    secondaryAvatar?: ReturnType<typeof pickIcon>;

    copilotAccountID?: number;
};

type Scenario = [
    name: string,
    report: Report,
    action: ReportAction | undefined,
    shouldUseRealActor: boolean,
    chatReportForAction: Report,
    expected: ExpectedAvatar,
    isActionStored?: boolean,
];

const {SINGLE, SUBSCRIPT, MULTIPLE, MULTIPLE_DIAGONAL} = CONST.REPORT_ACTION_AVATARS.TYPE;
const userActor = {accountID: USER_ACCOUNT_ID, isWorkspaceActor: false, shouldDisplayAllActors: false, actorHint: 'user@example.com', ...USER_PROFILE};
const conciergeActor = {accountID: CONST.ACCOUNT_ID.CONCIERGE, isWorkspaceActor: false, shouldDisplayAllActors: false, actorHint: CONST.EMAIL.CONCIERGE, login: CONST.EMAIL.CONCIERGE};
const iouActors = {
    avatarType: MULTIPLE,
    accountID: MANAGER_ACCOUNT_ID,
    isWorkspaceActor: false,
    shouldDisplayAllActors: true,
    actorHint: 'manager@example.com',
    login: 'manager@example.com',
};
const invoiceActors = {accountID: MANAGER_ACCOUNT_ID, isWorkspaceActor: true, shouldDisplayAllActors: true, actorHint: POLICY_ID, login: 'manager@example.com'};

const SCENARIOS: Scenario[] = [
    ['a comment in a DM', dm, comment(), false, dm, {details: {...userActor, avatarType: SINGLE, chatReportID: DM_ID}, layout: SINGLE, primaryAvatar: USER_ICON}],
    [
        'a copilot comment in a DM',
        dm,
        comment({delegateAccountID: DELEGATE_ACCOUNT_ID}),
        false,
        dm,
        {
            details: {...userActor, avatarType: SINGLE, actorHint: 'copilot@example.com', actedForAccountID: USER_ACCOUNT_ID, chatReportID: DM_ID},
            layout: SINGLE,
            primaryAvatar: COPILOT_ICON,
            copilotAccountID: DELEGATE_ACCOUNT_ID,
        },
    ],
    [
        'a Concierge reply revealing a human agent',
        dm,
        comment(createMock<ReportAction>({actorAccountID: CONST.ACCOUNT_ID.CONCIERGE, originalMessage: {html: 'Hi', whisperedTo: [], humanAgentAccountID: AGENT_ACCOUNT_ID}})),
        false,
        dm,
        {details: {...conciergeActor, avatarType: SUBSCRIPT, chatReportID: DM_ID}, layout: SUBSCRIPT, primaryAvatar: CONCIERGE_ICON, secondaryAvatar: AGENT_ICON},
    ],
    [
        'a comment in a workspace chat',
        workspaceChat,
        comment(),
        false,
        workspaceChat,
        {details: {...userActor, avatarType: SINGLE, chatReportID: WORKSPACE_CHAT_ID}, layout: SINGLE, primaryAvatar: USER_ICON},
    ],
    [
        'a harvested submission in the inbox',
        expenseReport,
        harvestedSubmit,
        false,
        workspaceChat,
        {details: {...conciergeActor, avatarType: SINGLE, chatReportID: WORKSPACE_CHAT_ID, iouReportID: EXPENSE_REPORT_ID}, layout: SINGLE, primaryAvatar: CONCIERGE_ICON},
    ],
    [
        'a harvested submission on Search',
        expenseReport,
        harvestedSubmit,
        true,
        workspaceChat,
        {details: {...userActor, avatarType: SINGLE, chatReportID: WORKSPACE_CHAT_ID, iouReportID: EXPENSE_REPORT_ID}, layout: SINGLE, primaryAvatar: USER_ICON},
    ],
    [
        'a created expense in a workspace expense report',
        expenseReport,
        createdExpense,
        false,
        workspaceChat,
        {
            details: {...userActor, avatarType: SUBSCRIPT, chatReportID: WORKSPACE_CHAT_ID, iouReportID: EXPENSE_REPORT_ID},
            layout: SUBSCRIPT,
            primaryAvatar: USER_ICON,
            secondaryAvatar: WORKSPACE_ICON,
        },
    ],
    [
        'an IOU report preview',
        iouReport,
        reportPreview(iouReport),
        false,
        dm,
        {details: {...iouActors, chatReportID: DM_ID, iouReportID: IOU_REPORT_ID}, layout: MULTIPLE_DIAGONAL, primaryAvatar: MANAGER_ICON, secondaryAvatar: USER_ICON},
    ],
    [
        'an IOU report preview with one sender',
        singleSenderIOUReport,
        reportPreview(singleSenderIOUReport, {isOptimisticAction: true}),
        false,
        dm,
        {
            details: {...userActor, avatarType: SINGLE, reportPreviewSenderID: USER_ACCOUNT_ID, chatReportID: DM_ID, iouReportID: SINGLE_SENDER_IOU_REPORT_ID},
            layout: SINGLE,
            primaryAvatar: USER_ICON,
        },
    ],
    [
        'a copilot IOU report preview',
        iouReport,
        reportPreview(iouReport, {delegateAccountID: DELEGATE_ACCOUNT_ID}),
        false,
        dm,
        {
            details: {
                ...userActor,
                avatarType: MULTIPLE,
                shouldDisplayAllActors: true,
                actorHint: 'copilot@example.com',
                actedForAccountID: USER_ACCOUNT_ID,
                chatReportID: DM_ID,
                iouReportID: IOU_REPORT_ID,
            },
            layout: MULTIPLE_DIAGONAL,
            primaryAvatar: COPILOT_ICON,
            secondaryAvatar: USER_ICON,
        },
    ],
    [
        'an expense report preview in a workspace chat',
        expenseReport,
        reportPreview(expenseReport),
        false,
        workspaceChat,
        {
            details: {...userActor, avatarType: SUBSCRIPT, chatReportID: WORKSPACE_CHAT_ID, iouReportID: EXPENSE_REPORT_ID},
            layout: SUBSCRIPT,
            primaryAvatar: USER_ICON,
            secondaryAvatar: WORKSPACE_ICON,
        },
    ],
    [
        'an invoice preview to a person',
        invoiceReport,
        reportPreview(invoiceReport),
        false,
        invoiceRoom,
        {
            details: {...invoiceActors, avatarType: SUBSCRIPT, chatReportID: INVOICE_ROOM_ID, iouReportID: INVOICE_REPORT_ID},
            layout: SUBSCRIPT,
            primaryAvatar: WORKSPACE_ICON,
            secondaryAvatar: MANAGER_ICON,
        },
    ],
    [
        'an invoice preview to a workspace',
        b2bInvoiceReport,
        reportPreview(b2bInvoiceReport),
        false,
        b2bInvoiceRoom,
        {
            details: {...invoiceActors, avatarType: MULTIPLE, chatReportID: B2B_INVOICE_ROOM_ID, iouReportID: B2B_INVOICE_REPORT_ID},
            layout: MULTIPLE_DIAGONAL,
            primaryAvatar: WORKSPACE_ICON,
            secondaryAvatar: RECEIVER_WORKSPACE_ICON,
        },
    ],
    [
        'a comment inside an invoice report',
        invoiceReport,
        comment(),
        false,
        invoiceRoom,
        {details: {...userActor, avatarType: SINGLE, chatReportID: INVOICE_ROOM_ID, iouReportID: INVOICE_REPORT_ID}, layout: SINGLE, primaryAvatar: USER_ICON},
    ],
    [
        'a trip preview',
        workspaceChat,
        tripPreview,
        false,
        workspaceChat,
        {details: {...userActor, avatarType: SUBSCRIPT, chatReportID: WORKSPACE_CHAT_ID}, layout: SUBSCRIPT, primaryAvatar: USER_ICON, secondaryAvatar: WORKSPACE_ICON},
    ],
    [
        'a canceled task without its action',
        taskReport,
        undefined,
        false,
        dm,
        {
            details: {avatarType: SINGLE, accountID: CONST.DEFAULT_NUMBER_ID, isWorkspaceActor: false, shouldDisplayAllActors: false, actorHint: '', iouReportID: TASK_REPORT_ID},
            layout: SINGLE,
            primaryAvatar: USER_ICON,
        },
    ],
    [
        'a deleted expense in its thread',
        transactionThread,
        createdExpense,
        false,
        expenseReport,
        {details: {...userActor, avatarType: SUBSCRIPT, chatReportID: TRANSACTION_THREAD_ID}, layout: SUBSCRIPT, primaryAvatar: USER_ICON, secondaryAvatar: WORKSPACE_ICON},
    ],
    [
        'an invoice preview to a workspace whose policy has not loaded',
        pendingB2BInvoiceReport,
        reportPreview(pendingB2BInvoiceReport),
        false,
        pendingB2BInvoiceRoom,
        // The receiver has no name until its policy loads, so only the sender workspace is drawn.
        {
            details: {...invoiceActors, avatarType: MULTIPLE, chatReportID: PENDING_B2B_INVOICE_ROOM_ID, iouReportID: PENDING_B2B_INVOICE_REPORT_ID},
            layout: SINGLE,
            primaryAvatar: WORKSPACE_ICON,
        },
    ],
    [
        'an IOU report preview missing from its chat actions',
        searchIOUReport,
        reportPreview(searchIOUReport),
        false,
        dm,
        {details: {...iouActors, chatReportID: DM_ID, iouReportID: SEARCH_IOU_REPORT_ID}, layout: MULTIPLE_DIAGONAL, primaryAvatar: MANAGER_ICON, secondaryAvatar: USER_ICON},
        false,
    ],
    [
        'an invoice preview to a workspace missing from its room actions',
        b2bInvoiceReport,
        reportPreview(b2bInvoiceReport),
        false,
        b2bInvoiceRoom,
        {
            details: {...invoiceActors, avatarType: MULTIPLE, chatReportID: B2B_INVOICE_ROOM_ID, iouReportID: B2B_INVOICE_REPORT_ID},
            layout: MULTIPLE_DIAGONAL,
            primaryAvatar: WORKSPACE_ICON,
            secondaryAvatar: RECEIVER_WORKSPACE_ICON,
        },
        false,
    ],
    [
        'a created expense whose thread sits on another workspace',
        expenseReport,
        {...createdExpense, childReportID: OTHER_WORKSPACE_THREAD_ID},
        false,
        workspaceChat,
        // The subscript pictures the thread's workspace, while its ID still comes from the expense report's policy.
        {
            details: {...userActor, avatarType: SUBSCRIPT, chatReportID: WORKSPACE_CHAT_ID, iouReportID: EXPENSE_REPORT_ID},
            layout: SUBSCRIPT,
            primaryAvatar: USER_ICON,
            secondaryAvatar: {...RECEIVER_WORKSPACE_ICON, id: POLICY_ID},
        },
    ],
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
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OTHER_WORKSPACE_THREAD_ID}`, otherWorkspaceThread),
        ]);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it.each(SCENARIOS)('should picture %s', async (_, report, action, shouldUseRealActor, chatReportForAction, expected, isActionStored = true) => {
        // Given the action stored in its chat, so report previews can find themselves through their report, unless the case leaves it out
        if (action && isActionStored) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportForAction.reportID}`, {[action.reportActionID]: action});
        }
        await waitForBatchedUpdates();

        // When the action's avatar is resolved from the same inputs ReportActionItemSingle passes
        const {result} = renderHook(() => useActionAvatar({report, action, shouldUseRealActor}), {wrapper});
        await waitForBatchedUpdates();

        // Then the header reads the actor's details off it
        const data = result.current;
        expect({
            avatarType: data.avatarType,
            accountID: data.accountID,
            isWorkspaceActor: data.isWorkspaceActor,
            shouldDisplayAllActors: data.shouldDisplayAllActors,
            actorHint: data.actorHint,
            actedForAccountID: data.actedForAccountID,
            reportPreviewSenderID: data.reportPreviewSenderID,
            chatReportID: data.chatReportID,
            iouReportID: data.iouReportID,
            status: data.actorPersonalDetails?.status,
            timezone: data.actorPersonalDetails?.timezone,
            login: data.actorPersonalDetails?.login,
            pendingAvatar: data.actorPersonalDetails?.pendingFields?.avatar,
        }).toEqual(expected.details);

        // And the avatars render in the expected layout, with a copilot badge only on a single avatar a copilot acted through
        expect(data.layout).toBe(expected.layout);
        expect(pickIcon(data.primaryAvatar)).toEqual(expected.primaryAvatar);
        if (data.layout !== CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE) {
            expect(pickIcon(data.secondaryAvatar)).toEqual(expected.secondaryAvatar);
        }
        expect(data.primaryAvatar.copilot?.accountID).toBe(expected.copilotAccountID);
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

    it('should picture an invoice preview by its sender until the invoice names its workspace', async () => {
        // Given an invoice preview whose invoice and room name no workspace yet, as while an optimistic invoice loads
        const action = reportPreview(noWorkspaceInvoiceReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${NO_WORKSPACE_INVOICE_ROOM_ID}`, {[action.reportActionID]: action});
        await waitForBatchedUpdates();

        // When its avatar is resolved
        const {result} = renderHook(() => useActionAvatar({report: noWorkspaceInvoiceReport, action, shouldUseRealActor: false}), {wrapper});
        await waitForBatchedUpdates();

        // Then the person the preview is credited to stands in for the workspace
        expect(pickIcon(result.current.primaryAvatar)).toEqual(MANAGER_ICON);
        expect(result.current.accountID).toBe(MANAGER_ACCOUNT_ID);

        // And the accessibility label names that person by login rather than reading out their account ID
        expect(result.current.actorHint).toBe('manager@example.com');
    });

    it('should not badge a Concierge action with the copilot whose request created it', async () => {
        // Given a track expense whisper authored by Concierge that the server still stamped with the copilot driving the account
        const action = comment({actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER, actorAccountID: CONST.ACCOUNT_ID.CONCIERGE, delegateAccountID: DELEGATE_ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${DM_ID}`, {[action.reportActionID]: action});
        await waitForBatchedUpdates();

        // When its avatar is resolved
        const {result} = renderHook(() => useActionAvatar({report: dm, action, shouldUseRealActor: false}), {wrapper});
        await waitForBatchedUpdates();

        // Then Concierge shows alone without a copilot badge, so its tooltip does not claim a copilot acted for Concierge
        expect(result.current.layout).toBe(SINGLE);
        expect(pickIcon(result.current.primaryAvatar)).toEqual(CONCIERGE_ICON);
        expect(result.current.primaryAvatar.copilot).toBeUndefined();
    });

    const PROCESSOR_ACCOUNT_ID = 5;
    const BILL_REPORT_ID = '940';
    const BILL_INVOICE_REPORT_ID = '941';
    const PROCESSOR_ICON = {id: PROCESSOR_ACCOUNT_ID, name: 'Tom Jones', type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/tom.png'};
    const BILL_CONCIERGE_ICON = {
        id: CONST.ACCOUNT_ID.CONCIERGE,
        name: CONST.CONCIERGE_DISPLAY_NAME,
        type: CONST.ICON_TYPE_AVATAR,
        source: expect.objectContaining({src: 'mock-ConciergeAvatar'}),
    };
    // Bill intake stores a bill's history under its receiver.
    const billReport: Report = {reportID: BILL_REPORT_ID, type: CONST.REPORT.UNSUPPORTED_TYPE.BILL, ownerAccountID: USER_ACCOUNT_ID, managerID: USER_ACCOUNT_ID};
    // Bill intake stores the history of an invoice linked to a bill under its vendor.
    const billInvoiceReport: Report = {reportID: BILL_INVOICE_REPORT_ID, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: MANAGER_ACCOUNT_ID, managerID: USER_ACCOUNT_ID};

    it.each([
        ['bill', CONST.REPORT.ACTIONS.TYPE.CREATED, USER_ACCOUNT_ID, PROCESSOR_ACCOUNT_ID, billReport, PROCESSOR_ICON],
        ['bill', CONST.REPORT.ACTIONS.TYPE.CREATED, USER_ACCOUNT_ID, 0, billReport, BILL_CONCIERGE_ICON],
        ['bill', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, USER_ACCOUNT_ID, PROCESSOR_ACCOUNT_ID, billReport, PROCESSOR_ICON],
        ['bill', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, USER_ACCOUNT_ID, 0, billReport, BILL_CONCIERGE_ICON],
        ['invoice linked to a bill', CONST.REPORT.ACTIONS.TYPE.CREATED, MANAGER_ACCOUNT_ID, PROCESSOR_ACCOUNT_ID, billInvoiceReport, PROCESSOR_ICON],
        ['invoice linked to a bill', CONST.REPORT.ACTIONS.TYPE.CREATED, MANAGER_ACCOUNT_ID, 0, billInvoiceReport, BILL_CONCIERGE_ICON],
        ['invoice linked to a bill', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, MANAGER_ACCOUNT_ID, PROCESSOR_ACCOUNT_ID, billInvoiceReport, PROCESSOR_ICON],
        ['invoice linked to a bill', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, MANAGER_ACCOUNT_ID, 0, billInvoiceReport, BILL_CONCIERGE_ICON],
    ] as const)(
        'should credit the %s history action %s, stored under account %s, to processor %s or Concierge',
        async (_, actionName, storedActorAccountID, processor, report, expectedIcon) => {
            // Given a Bill Pay history action stored under the receiver or vendor, and a creation action naming the processor, or none when the bill came from an email
            const action = createMock<ReportAction>({...baseAction, actionName, actorAccountID: storedActorAccountID});
            const createdAction = createMock<ReportAction>({...baseAction, reportActionID: 'created', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, originalMessage: {processor}});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[createdAction.reportActionID]: createdAction});
            if (report.type === CONST.REPORT.TYPE.INVOICE) {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {billID: 9402});
            }
            // Concierge keeps its email as its name here, as it does before its personal details fully load.
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [PROCESSOR_ACCOUNT_ID]: {accountID: PROCESSOR_ACCOUNT_ID, displayName: 'Tom Jones', avatar: 'https://example.com/tom.png'},
                [CONST.ACCOUNT_ID.CONCIERGE]: {displayName: CONST.EMAIL.CONCIERGE},
            });
            await waitForBatchedUpdates();

            // When its avatar is resolved
            const {result} = renderHook(() => useActionAvatar({report, action, shouldUseRealActor: false}), {wrapper});
            await waitForBatchedUpdates();

            // Then the avatar pictures the person who entered the bill, or Concierge under its own name and avatar, instead of the stored account
            expect(pickIcon(result.current.primaryAvatar)).toEqual(expectedIcon);
            expect(result.current.accountID).toBe(processor || CONST.ACCOUNT_ID.CONCIERGE);
        },
    );

    it.each(
        Object.values(CONST.REPORT.ACTIONS.TYPE)
            .flatMap((value): ReportActionName[] => (typeof value === 'object' ? Object.values(value) : [value]))
            .map((actionName) => [actionName, actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW] as const),
    )('should credit a %s action inside an invoice report to the workspace only for a report preview: %s', async (actionName, expectedIsWorkspaceActor) => {
        // Given an action of that kind inside an invoice report, authored by a person
        const action = comment({actionName});

        // When its avatar is resolved
        const {result} = renderHook(() => useActionAvatar({report: invoiceReport, action, shouldUseRealActor: false}), {wrapper});
        await waitForBatchedUpdates();

        // Then only the report preview stands for the sending workspace, so pressing any other action opens its author's profile
        expect(result.current.isWorkspaceActor).toBe(expectedIsWorkspaceActor);
    });

    it("should keep the customer's avatar on their own message in a support ticket", async () => {
        // Given a support ticket assigned to a rep, created from the customer's message in their chat
        const supportTicket: Report = {
            reportID: '950',
            type: CONST.REPORT.TYPE.SUPPORT_TICKET,
            chatReportID: DM_ID,
            parentReportID: DM_ID,
            parentReportActionID: PREVIEW_ID,
            ownerAccountID: USER_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
        };
        const customerMessage = comment({childReportID: supportTicket.reportID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${DM_ID}`, {[customerMessage.reportActionID]: customerMessage});
        await waitForBatchedUpdates();

        // When the customer's message resolves its author's avatar
        const {result} = renderHook(() => useActionAvatar({report: supportTicket, action: customerMessage, shouldUseRealActor: false}), {wrapper});
        await waitForBatchedUpdates();

        // Then it pictures the customer, since only the ticket's header swaps in the assigned rep
        expect(pickIcon(result.current.primaryAvatar)).toEqual(USER_ICON);
        expect(result.current.accountID).toBe(USER_ACCOUNT_ID);
    });
});
