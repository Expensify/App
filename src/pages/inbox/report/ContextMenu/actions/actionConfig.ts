import type {RefObject} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {
    getOriginalMessage,
    getReportAction,
    hasReasoning,
    isActionableTrackExpense,
    isActionOfType,
    isCreatedAction,
    isCreatedTaskReportAction,
    isDeletedAction,
    isMessageDeleted,
    isMoneyRequestAction,
    isReportActionAttachment,
    isReportPreviewAction,
    isTripPreview,
    isWhisperAction,
} from '@libs/ReportActionsUtils';
import {
    canDeleteReportAction,
    canEditReportAction,
    canFlagReportAction,
    canHoldUnholdReportAction,
    getChildReportNotificationPreference,
    shouldDisableThread,
    shouldDisplayThreadReplies,
} from '@libs/ReportUtils';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {Policy, ReportAction, Report as ReportType, Transaction} from '@src/types/onyx';

const ACTION_IDS = {
    EMOJI_REACTION: 'emojiReaction',
    REPLY_IN_THREAD: 'replyInThread',
    MARK_AS_UNREAD: 'markAsUnread',
    EXPLAIN: 'explain',
    MARK_AS_READ: 'markAsRead',
    EDIT: 'edit',
    UNHOLD: 'unhold',
    HOLD: 'hold',
    JOIN_THREAD: 'joinThread',
    LEAVE_THREAD: 'leaveThread',
    COPY_URL: 'copyUrl',
    COPY_TO_CLIPBOARD: 'copyToClipboard',
    COPY_EMAIL: 'copyEmail',
    COPY_MESSAGE: 'copyMessage',
    COPY_LINK: 'copyLink',
    PIN: 'pin',
    UNPIN: 'unpin',
    FLAG_AS_OFFENSIVE: 'flagAsOffensive',
    DOWNLOAD: 'download',
    COPY_ONYX_DATA: 'copyOnyxData',
    DEBUG: 'debug',
    DELETE: 'delete',
    OVERFLOW_MENU: 'overflowMenu',
} as const;

type ActionID = ValueOf<typeof ACTION_IDS>;

type ShouldShowArgs = {
    type: string;
    reportAction: OnyxEntry<ReportAction>;
    childReportActions: OnyxCollection<ReportAction>;
    isArchivedRoom: boolean;
    menuTarget: RefObject<ContextMenuAnchor> | undefined;
    isChronosReport: boolean;
    reportID?: string;
    isPinnedChat: boolean;
    isUnreadChat: boolean;
    isThreadReportParentAction: boolean;
    isOffline: boolean;
    isProduction: boolean;
    moneyRequestAction: ReportAction | undefined;
    areHoldRequirementsMet: boolean;
    isDebugModeEnabled: OnyxEntry<boolean>;
    iouTransaction: OnyxEntry<Transaction>;
    transactions?: OnyxCollection<Transaction>;
    moneyRequestReport?: OnyxEntry<ReportType>;
    moneyRequestPolicy?: OnyxEntry<Policy>;
    isHarvestReport?: boolean;
};

function getActionHtml(reportAction: OnyxEntry<ReportAction>): string {
    const message = Array.isArray(reportAction?.message) ? (reportAction?.message?.at(-1) ?? null) : (reportAction?.message ?? null);
    return message?.html ?? '';
}

const ORDERED_ACTION_SHOULD_SHOW: Array<{id: ActionID; isContentAction: boolean; shouldShow: (args: ShouldShowArgs) => boolean}> = [
    {
        id: ACTION_IDS.EMOJI_REACTION,
        isContentAction: true,
        shouldShow: ({type, reportAction}) => {
            const isDynamicWorkflowRoutedAction = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
            return type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !!reportAction && 'message' in reportAction && !isMessageDeleted(reportAction) && !isDynamicWorkflowRoutedAction;
        },
    },
    {
        id: ACTION_IDS.REPLY_IN_THREAD,
        isContentAction: false,
        shouldShow: ({type, reportAction, reportID, isThreadReportParentAction, isArchivedRoom}) => {
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION || !reportID) {
                return false;
            }
            return !shouldDisableThread(reportAction, isThreadReportParentAction, isArchivedRoom);
        },
    },
    {
        id: ACTION_IDS.MARK_AS_UNREAD,
        isContentAction: false,
        shouldShow: ({type, reportAction, isUnreadChat}) => {
            const isDynamicWorkflowRoutedAction = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
            return (type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !isDynamicWorkflowRoutedAction) || (type === CONST.CONTEXT_MENU_TYPES.REPORT && !isUnreadChat);
        },
    },
    {
        id: ACTION_IDS.EXPLAIN,
        isContentAction: false,
        shouldShow: ({type, reportAction, isArchivedRoom}) => {
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION || isArchivedRoom || !reportAction) {
                return false;
            }
            return hasReasoning(reportAction);
        },
    },
    {
        id: ACTION_IDS.MARK_AS_READ,
        isContentAction: false,
        shouldShow: ({type, isUnreadChat}) => type === CONST.CONTEXT_MENU_TYPES.REPORT && isUnreadChat,
    },
    {
        id: ACTION_IDS.EDIT,
        isContentAction: false,
        shouldShow: ({type, reportAction, isArchivedRoom, isChronosReport, moneyRequestAction}) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && (canEditReportAction(reportAction) || canEditReportAction(moneyRequestAction)) && !isArchivedRoom && !isChronosReport,
    },
    {
        id: ACTION_IDS.UNHOLD,
        isContentAction: false,
        shouldShow: ({type, moneyRequestReport, moneyRequestAction, moneyRequestPolicy, areHoldRequirementsMet, iouTransaction}) => {
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION || !areHoldRequirementsMet) {
                return false;
            }
            const holdReportAction = getReportAction(moneyRequestAction?.childReportID, `${iouTransaction?.comment?.hold ?? ''}`);
            return canHoldUnholdReportAction(moneyRequestReport, moneyRequestAction, holdReportAction, iouTransaction, moneyRequestPolicy).canUnholdRequest;
        },
    },
    {
        id: ACTION_IDS.HOLD,
        isContentAction: false,
        shouldShow: ({type, moneyRequestReport, moneyRequestAction, moneyRequestPolicy, areHoldRequirementsMet, iouTransaction}) => {
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION || !areHoldRequirementsMet) {
                return false;
            }
            const holdReportAction = getReportAction(moneyRequestAction?.childReportID, `${iouTransaction?.comment?.hold ?? ''}`);
            return canHoldUnholdReportAction(moneyRequestReport, moneyRequestAction, holdReportAction, iouTransaction, moneyRequestPolicy).canHoldRequest;
        },
    },
    {
        id: ACTION_IDS.JOIN_THREAD,
        isContentAction: false,
        shouldShow: ({reportAction, isArchivedRoom, isThreadReportParentAction, isHarvestReport}) => {
            const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
            const isDeletedActionResult = isDeletedAction(reportAction);
            const shouldDisplayReplies = shouldDisplayThreadReplies(reportAction, isThreadReportParentAction);
            const subscribed = childReportNotificationPreference !== 'hidden';
            const isWhisper = isWhisperAction(reportAction) || isActionableTrackExpense(reportAction);
            const isExpenseReportAction = isMoneyRequestAction(reportAction) || isReportPreviewAction(reportAction);
            const isTaskAction = isCreatedTaskReportAction(reportAction);
            const isHarvestCreatedExpenseReportAction = !!isHarvestReport && isCreatedAction(reportAction);
            const shouldDisableJoin = shouldDisableThread(reportAction, isThreadReportParentAction, isArchivedRoom);
            return (
                !subscribed &&
                !isWhisper &&
                !isTaskAction &&
                !isExpenseReportAction &&
                !isThreadReportParentAction &&
                !isHarvestCreatedExpenseReportAction &&
                !shouldDisableJoin &&
                (shouldDisplayReplies || (!isDeletedActionResult && !isArchivedRoom))
            );
        },
    },
    {
        id: ACTION_IDS.LEAVE_THREAD,
        isContentAction: false,
        shouldShow: ({reportAction, isArchivedRoom, isThreadReportParentAction, isHarvestReport}) => {
            const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
            const isDeletedActionResult = isDeletedAction(reportAction);
            const shouldDisplayReplies = shouldDisplayThreadReplies(reportAction, isThreadReportParentAction);
            const subscribed = childReportNotificationPreference !== 'hidden';
            const isWhisper = isWhisperAction(reportAction) || isActionableTrackExpense(reportAction);
            const isExpenseReportAction = isMoneyRequestAction(reportAction) || isReportPreviewAction(reportAction);
            const isTaskAction = isCreatedTaskReportAction(reportAction);
            const isHarvestCreatedExpenseReportAction = !!isHarvestReport && isCreatedAction(reportAction);
            return (
                subscribed &&
                !isWhisper &&
                !isTaskAction &&
                !isExpenseReportAction &&
                !isThreadReportParentAction &&
                !isHarvestCreatedExpenseReportAction &&
                (shouldDisplayReplies || (!isDeletedActionResult && !isArchivedRoom))
            );
        },
    },
    {
        id: ACTION_IDS.COPY_URL,
        isContentAction: false,
        shouldShow: ({type}) => type === CONST.CONTEXT_MENU_TYPES.LINK,
    },
    {
        id: ACTION_IDS.COPY_TO_CLIPBOARD,
        isContentAction: false,
        shouldShow: ({type}) => type === CONST.CONTEXT_MENU_TYPES.TEXT,
    },
    {
        id: ACTION_IDS.COPY_EMAIL,
        isContentAction: false,
        shouldShow: ({type}) => type === CONST.CONTEXT_MENU_TYPES.EMAIL,
    },
    {
        id: ACTION_IDS.COPY_MESSAGE,
        isContentAction: false,
        shouldShow: ({type, reportAction}) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !isReportActionAttachment(reportAction) && !isMessageDeleted(reportAction) && !isTripPreview(reportAction),
    },
    {
        id: ACTION_IDS.COPY_LINK,
        isContentAction: false,
        shouldShow: ({type, reportAction, menuTarget}) => {
            const isAttachment = isReportActionAttachment(reportAction);
            const isAttachmentTarget = menuTarget?.current && 'tagName' in menuTarget.current && menuTarget?.current.tagName === 'IMG' && isAttachment;
            const isDynamicWorkflowRoutedAction = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
            return type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !isAttachmentTarget && !isMessageDeleted(reportAction) && !isDynamicWorkflowRoutedAction;
        },
    },
    {
        id: ACTION_IDS.PIN,
        isContentAction: false,
        shouldShow: ({type, isPinnedChat}) => type === CONST.CONTEXT_MENU_TYPES.REPORT && !isPinnedChat,
    },
    {
        id: ACTION_IDS.UNPIN,
        isContentAction: false,
        shouldShow: ({type, isPinnedChat}) => type === CONST.CONTEXT_MENU_TYPES.REPORT && isPinnedChat,
    },
    {
        id: ACTION_IDS.FLAG_AS_OFFENSIVE,
        isContentAction: false,
        shouldShow: ({type, reportAction, isArchivedRoom, isChronosReport, reportID}) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION &&
            canFlagReportAction(reportAction, reportID) &&
            !isArchivedRoom &&
            !isChronosReport &&
            reportAction?.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE,
    },
    {
        id: ACTION_IDS.DOWNLOAD,
        isContentAction: false,
        shouldShow: ({reportAction, isOffline}) => {
            const isAttachment = isReportActionAttachment(reportAction);
            const html = getActionHtml(reportAction);
            const isUploading = html.includes(CONST.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE);
            return isAttachment && !isUploading && !!reportAction?.reportActionID && !isMessageDeleted(reportAction) && !isOffline;
        },
    },
    {
        id: ACTION_IDS.COPY_ONYX_DATA,
        isContentAction: false,
        shouldShow: ({type, isProduction}) => type === CONST.CONTEXT_MENU_TYPES.REPORT && !isProduction,
    },
    {
        id: ACTION_IDS.DEBUG,
        isContentAction: false,
        shouldShow: ({type, isDebugModeEnabled}) => [CONST.CONTEXT_MENU_TYPES.REPORT_ACTION, CONST.CONTEXT_MENU_TYPES.REPORT].some((value) => value === type) && !!isDebugModeEnabled,
    },
    {
        id: ACTION_IDS.DELETE,
        isContentAction: false,
        shouldShow: ({type, reportAction, isArchivedRoom, isChronosReport, reportID: reportIDParam, moneyRequestAction, iouTransaction, transactions, childReportActions}) => {
            let reportID = reportIDParam;
            if (isMoneyRequestAction(moneyRequestAction)) {
                reportID = getOriginalMessage(moneyRequestAction)?.IOUReportID;
            } else if (isReportPreviewAction(reportAction)) {
                reportID = reportAction?.childReportID;
            }
            return (
                !!reportIDParam &&
                type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION &&
                canDeleteReportAction(moneyRequestAction ?? reportAction, reportID, iouTransaction, transactions, childReportActions) &&
                !isArchivedRoom &&
                !isChronosReport &&
                !isMessageDeleted(reportAction)
            );
        },
    },
    {
        id: ACTION_IDS.OVERFLOW_MENU,
        isContentAction: false,
        shouldShow: () => true,
    },
];

const RESTRICTED_READONLY_ACTION_IDS = new Set<ActionID>([ACTION_IDS.REPLY_IN_THREAD, ACTION_IDS.EDIT, ACTION_IDS.JOIN_THREAD, ACTION_IDS.DELETE]);

function getVisibleActionIDs(shouldShowArgs: ShouldShowArgs, disabledActionIDs: Set<string>): ActionID[] {
    return ORDERED_ACTION_SHOULD_SHOW.filter((entry) => entry.id !== 'overflowMenu' && !disabledActionIDs.has(entry.id) && entry.shouldShow(shouldShowArgs)).map((entry) => entry.id);
}

export {ORDERED_ACTION_SHOULD_SHOW, RESTRICTED_READONLY_ACTION_IDS, getActionHtml, getVisibleActionIDs};
export type {ActionID, ShouldShowArgs};
