import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import type {MutableRefObject} from 'react';
import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import * as Expensicons from '@components/Icon/Expensicons';
import MiniQuickEmojiReactions from '@components/Reactions/MiniQuickEmojiReactions';
import QuickEmojiReactions from '@components/Reactions/QuickEmojiReactions';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import Clipboard from '@libs/Clipboard';
import EmailUtils from '@libs/EmailUtils';
import * as Environment from '@libs/Environment/Environment';
import fileDownload from '@libs/fileDownload';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TaskUtils from '@libs/TaskUtils';
import * as Download from '@userActions/Download';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Beta, ReportAction, ReportActionReactions} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import {hideContextMenu, showDeleteModal} from './ReportActionContextMenu';

/** Gets the HTML version of the message in an action */
function getActionHtml(reportAction: OnyxEntry<ReportAction>): string {
    const message = reportAction?.message?.at(-1) ?? null;
    return message?.html ?? '';
}

/** Gets the text version of the message in an action */
function getActionText(reportAction: OnyxEntry<ReportAction>): string {
    return reportAction?.message?.reduce((acc, curr) => `${acc}${curr.text}`, '') ?? '';
}

/** Sets the HTML string to Clipboard */
function setClipboardMessage(content: string) {
    const parser = new ExpensiMark();
    if (!Clipboard.canSetHtml()) {
        Clipboard.setString(parser.htmlToMarkdown(content));
    } else {
        const plainText = parser.htmlToText(content);
        Clipboard.setHtml(content, plainText);
    }
}

type ShouldShow = (
    type: string,
    reportAction: OnyxEntry<ReportAction>,
    isArchivedRoom: boolean,
    betas: OnyxEntry<Beta[]>,
    menuTarget: MutableRefObject<HTMLElement | null> | undefined,
    isChronosReport: boolean,
    reportID: string,
    isPinnedChat: boolean,
    isUnreadChat: boolean,
    isOffline: boolean,
    isMini: boolean,
) => boolean;

type ContextMenuActionPayload = {
    reportAction: ReportAction;
    reportID: string;
    draftMessage: string;
    selection: string;
    close: () => void;
    openContextMenu: () => void;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    openOverflowMenu: (event: GestureResponderEvent | MouseEvent) => void;
    event?: GestureResponderEvent | MouseEvent | KeyboardEvent;
};

type OnPress = (closePopover: boolean, payload: ContextMenuActionPayload, selection?: string, reportID?: string, draftMessage?: string) => void;

type RenderContent = (closePopover: boolean, payload: ContextMenuActionPayload) => React.ReactElement;

type GetDescription = (selection?: string) => string | void;

type ContextMenuActionWithContent = {
    renderContent: RenderContent;
};

type ContextMenuActionWithIcon = {
    textTranslateKey: TranslationPaths;
    icon: IconAsset;
    successTextTranslateKey?: TranslationPaths;
    successIcon?: IconAsset;
    onPress: OnPress;
    getDescription: GetDescription;
};

type ContextMenuAction = (ContextMenuActionWithContent | ContextMenuActionWithIcon) & {
    isAnonymousAction: boolean;
    shouldShow: ShouldShow;
};

// A list of all the context actions in this menu.
const ContextMenuActions: ContextMenuAction[] = [
    {
        isAnonymousAction: false,
        shouldShow: (type, reportAction): reportAction is ReportAction =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !!reportAction && 'message' in reportAction && !ReportActionsUtils.isMessageDeleted(reportAction),
        renderContent: (closePopover, {reportID, reportAction, close: closeManually, openContextMenu}) => {
            const isMini = !closePopover;

            const closeContextMenu = (onHideCallback?: () => void) => {
                if (isMini) {
                    closeManually();
                    if (onHideCallback) {
                        onHideCallback();
                    }
                } else {
                    hideContextMenu(false, onHideCallback);
                }
            };

            const toggleEmojiAndCloseMenu = (emoji: Emoji, existingReactions: OnyxEntry<ReportActionReactions>) => {
                Report.toggleEmojiReaction(reportID, reportAction, emoji, existingReactions);
                closeContextMenu();
            };

            if (isMini) {
                return (
                    <MiniQuickEmojiReactions
                        key="MiniQuickEmojiReactions"
                        onEmojiSelected={toggleEmojiAndCloseMenu}
                        onPressOpenPicker={openContextMenu}
                        onEmojiPickerClosed={closeContextMenu}
                        reportActionID={reportAction?.reportActionID}
                        reportAction={reportAction}
                    />
                );
            }

            return (
                <QuickEmojiReactions
                    key="BaseQuickEmojiReactions"
                    closeContextMenu={closeContextMenu}
                    onEmojiSelected={toggleEmojiAndCloseMenu}
                    reportActionID={reportAction?.reportActionID}
                    reportAction={reportAction}
                />
            );
        },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'common.download',
        icon: Expensicons.Download,
        successTextTranslateKey: 'common.download',
        successIcon: Expensicons.Download,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID, isPinnedChat, isUnreadChat, isOffline): reportAction is ReportAction => {
            const isAttachment = ReportActionsUtils.isReportActionAttachment(reportAction);
            const messageHtml = reportAction?.message?.at(0)?.html;
            return (
                isAttachment && messageHtml !== CONST.ATTACHMENT_UPLOADING_MESSAGE_HTML && !!reportAction?.reportActionID && !ReportActionsUtils.isMessageDeleted(reportAction) && !isOffline
            );
        },
        onPress: (closePopover, {reportAction}) => {
            const html = getActionHtml(reportAction);
            const {originalFileName, sourceURL} = getAttachmentDetails(html);
            const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL ?? '');
            const sourceID = (sourceURL?.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
            Download.setDownload(sourceID, true);
            fileDownload(sourceURLWithAuth, originalFileName ?? '').then(() => Download.setDownload(sourceID, false));
            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.replyInThread',
        icon: Expensicons.ChatBubbleAdd,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID) => {
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION) {
                return false;
            }
            return !ReportUtils.shouldDisableThread(reportAction, reportID);
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            if (closePopover) {
                hideContextMenu(false, () => {
                    ReportActionComposeFocusManager.focus();
                    Report.navigateToAndOpenChildReport(reportAction?.childReportID ?? '0', reportAction, reportID);
                });
                return;
            }

            Report.navigateToAndOpenChildReport(reportAction?.childReportID ?? '0', reportAction, reportID);
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.editAction',
        icon: Expensicons.Pencil,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && ReportUtils.canEditReportAction(reportAction) && !isArchivedRoom && !isChronosReport,
        onPress: (closePopover, {reportID, reportAction, draftMessage}) => {
            if (ReportActionsUtils.isMoneyRequestAction(reportAction)) {
                hideContextMenu(false);
                const childReportID = reportAction?.childReportID ?? '0';
                if (!childReportID) {
                    const thread = ReportUtils.buildTransactionThread(reportAction, reportID);
                    const userLogins = PersonalDetailsUtils.getLoginsByAccountIDs(thread.participantAccountIDs ?? []);
                    Report.openReport(thread.reportID, userLogins, thread, reportAction?.reportActionID);
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(thread.reportID));
                    return;
                }
                Report.openReport(childReportID);
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
                return;
            }
            const editAction = () => {
                if (!draftMessage) {
                    Report.saveReportActionDraft(reportID, reportAction, getActionHtml(reportAction));
                } else {
                    Report.deleteReportActionDraft(reportID, reportAction);
                }
            };

            if (closePopover) {
                // Hide popover, then call editAction
                hideContextMenu(false, editAction);
                return;
            }

            // No popover to hide, call editAction immediately
            editAction();
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.markAsUnread',
        icon: Expensicons.ChatBubbleUnread,
        successIcon: Expensicons.Checkmark,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID, isPinnedChat, isUnreadChat) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION || (type === CONST.CONTEXT_MENU_TYPES.REPORT && !isUnreadChat),
        onPress: (closePopover, {reportAction, reportID}) => {
            Report.markCommentAsUnread(reportID, reportAction?.created);
            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.markAsRead',
        icon: Expensicons.Mail,
        successIcon: Expensicons.Checkmark,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID, isPinnedChat, isUnreadChat) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT && isUnreadChat,
        onPress: (closePopover, {reportID}) => {
            Report.readNewestAction(reportID);
            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.joinThread',
        icon: Expensicons.Bell,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID) => {
            const childReportNotificationPreference = ReportUtils.getChildReportNotificationPreference(reportAction);
            const isDeletedAction = ReportActionsUtils.isDeletedAction(reportAction);
            const shouldDisplayThreadReplies = ReportUtils.shouldDisplayThreadReplies(reportAction, reportID);
            const subscribed = childReportNotificationPreference !== 'hidden';
            const isCommentAction = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && !ReportUtils.isThreadFirstChat(reportAction, reportID);
            const isReportPreviewAction = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW;
            const isIOUAction = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && !ReportActionsUtils.isSplitBillAction(reportAction);

            const isWhisperAction = ReportActionsUtils.isWhisperAction(reportAction);
            return !subscribed && !isWhisperAction && (isCommentAction || isReportPreviewAction || isIOUAction) && (!isDeletedAction || shouldDisplayThreadReplies);
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            const childReportNotificationPreference = ReportUtils.getChildReportNotificationPreference(reportAction);
            if (closePopover) {
                hideContextMenu(false, () => {
                    ReportActionComposeFocusManager.focus();
                    Report.toggleSubscribeToChildReport(reportAction?.childReportID ?? '0', reportAction, reportID, childReportNotificationPreference);
                });
                return;
            }

            ReportActionComposeFocusManager.focus();
            Report.toggleSubscribeToChildReport(reportAction?.childReportID ?? '0', reportAction, reportID, childReportNotificationPreference);
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.leaveThread',
        icon: Expensicons.BellSlash,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID) => {
            const childReportNotificationPreference = ReportUtils.getChildReportNotificationPreference(reportAction);
            const isDeletedAction = ReportActionsUtils.isDeletedAction(reportAction);
            const shouldDisplayThreadReplies = ReportUtils.shouldDisplayThreadReplies(reportAction, reportID);
            const subscribed = childReportNotificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION) {
                return false;
            }
            const isCommentAction = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && !ReportUtils.isThreadFirstChat(reportAction, reportID);
            const isReportPreviewAction = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW;
            const isIOUAction = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && !ReportActionsUtils.isSplitBillAction(reportAction);
            return subscribed && (isCommentAction || isReportPreviewAction || isIOUAction) && (!isDeletedAction || shouldDisplayThreadReplies);
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            const childReportNotificationPreference = ReportUtils.getChildReportNotificationPreference(reportAction);
            if (closePopover) {
                hideContextMenu(false, () => {
                    ReportActionComposeFocusManager.focus();
                    Report.toggleSubscribeToChildReport(reportAction?.childReportID ?? '0', reportAction, reportID, childReportNotificationPreference);
                });
                return;
            }

            ReportActionComposeFocusManager.focus();
            Report.toggleSubscribeToChildReport(reportAction?.childReportID ?? '0', reportAction, reportID, childReportNotificationPreference);
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyURLToClipboard',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: (type) => type === CONST.CONTEXT_MENU_TYPES.LINK,
        onPress: (closePopover, {selection}) => {
            Clipboard.setString(selection);
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: (selection) => selection,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyEmailToClipboard',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: (type) => type === CONST.CONTEXT_MENU_TYPES.EMAIL,
        onPress: (closePopover, {selection}) => {
            Clipboard.setString(EmailUtils.trimMailTo(selection));
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: (selection) => EmailUtils.prefixMailSeparatorsWithBreakOpportunities(EmailUtils.trimMailTo(selection ?? '')),
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyToClipboard',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: (type, reportAction) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !ReportActionsUtils.isReportActionAttachment(reportAction) && !ReportActionsUtils.isMessageDeleted(reportAction),

        // If return value is true, we switch the `text` and `icon` on
        // `ContextMenuItem` with `successText` and `successIcon` which will fall back to
        // the `text` and `icon`
        onPress: (closePopover, {reportAction, selection, reportID}) => {
            const isTaskAction = ReportActionsUtils.isTaskAction(reportAction);
            const isReportPreviewAction = ReportActionsUtils.isReportPreviewAction(reportAction);
            const messageHtml = isTaskAction ? TaskUtils.getTaskReportActionMessage(reportAction?.actionName) : getActionHtml(reportAction);
            const messageText = getActionText(reportAction);

            const isAttachment = ReportActionsUtils.isReportActionAttachment(reportAction);
            if (!isAttachment) {
                const content = selection || messageHtml;
                if (isReportPreviewAction) {
                    const iouReport = ReportUtils.getReport(ReportActionsUtils.getIOUReportIDFromReportActionPreview(reportAction));
                    const displayMessage = ReportUtils.getReportPreviewMessage(iouReport, reportAction);
                    Clipboard.setString(displayMessage);
                } else if (ReportActionsUtils.isModifiedExpenseAction(reportAction)) {
                    const modifyExpenseMessage = ModifiedExpenseMessage.getForReportAction(reportID, reportAction);
                    Clipboard.setString(modifyExpenseMessage);
                } else if (ReportActionsUtils.isMoneyRequestAction(reportAction)) {
                    const displayMessage = ReportUtils.getIOUReportActionDisplayMessage(reportAction);
                    Clipboard.setString(displayMessage);
                } else if (ReportActionsUtils.isCreatedTaskReportAction(reportAction)) {
                    const taskPreviewMessage = TaskUtils.getTaskCreatedMessage(reportAction);
                    Clipboard.setString(taskPreviewMessage);
                } else if (ReportActionsUtils.isMemberChangeAction(reportAction)) {
                    const logMessage = ReportActionsUtils.getMemberChangeMessageFragment(reportAction).html ?? '';
                    setClipboardMessage(logMessage);
                } else if (content) {
                    setClipboardMessage(content);
                } else if (messageText) {
                    Clipboard.setString(messageText);
                }
            }

            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyLink',
        icon: Expensicons.LinkCopy,
        successIcon: Expensicons.Checkmark,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget) => {
            const isAttachment = ReportActionsUtils.isReportActionAttachment(reportAction);

            // Only hide the copylink menu item when context menu is opened over img element.
            const isAttachmentTarget = menuTarget?.current?.tagName === 'IMG' && isAttachment;
            return Permissions.canUseCommentLinking(betas) && type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !isAttachmentTarget && !ReportActionsUtils.isMessageDeleted(reportAction);
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            Environment.getEnvironmentURL().then((environmentURL) => {
                const reportActionID = reportAction?.reportActionID;
                Clipboard.setString(`${environmentURL}/r/${reportID}/${reportActionID}`);
            });
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.deleteAction',
        icon: Expensicons.Trashcan,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID) =>
            // Until deleting parent threads is supported in FE, we will prevent the user from deleting a thread parent
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION &&
            ReportUtils.canDeleteReportAction(reportAction, reportID) &&
            !isArchivedRoom &&
            !isChronosReport &&
            !ReportActionsUtils.isMessageDeleted(reportAction),
        onPress: (closePopover, {reportID, reportAction}) => {
            if (closePopover) {
                // Hide popover, then call showDeleteConfirmModal
                hideContextMenu(false, () => showDeleteModal(reportID, reportAction));
                return;
            }

            // No popover to hide, call showDeleteConfirmModal immediately
            showDeleteModal(reportID, reportAction);
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'common.pin',
        icon: Expensicons.Pin,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID, isPinnedChat) => type === CONST.CONTEXT_MENU_TYPES.REPORT && !isPinnedChat,
        onPress: (closePopover, {reportID}) => {
            Report.togglePinnedState(reportID, false);
            if (closePopover) {
                hideContextMenu(false, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'common.unPin',
        icon: Expensicons.Pin,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID, isPinnedChat) => type === CONST.CONTEXT_MENU_TYPES.REPORT && isPinnedChat,
        onPress: (closePopover, {reportID}) => {
            Report.togglePinnedState(reportID, true);
            if (closePopover) {
                hideContextMenu(false, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.flagAsOffensive',
        icon: Expensicons.Flag,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION &&
            ReportUtils.canFlagReportAction(reportAction, reportID) &&
            !isArchivedRoom &&
            !isChronosReport &&
            reportAction?.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE,
        onPress: (closePopover, {reportID, reportAction}) => {
            if (closePopover) {
                hideContextMenu(false, () => Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID)));
                return;
            }

            Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID));
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.menu',
        icon: Expensicons.ThreeDots,
        shouldShow: (type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID, isPinnedChat, isUnreadChat, isOffline, isMini) => isMini,
        onPress: (closePopover, {openOverflowMenu, event}) => {
            openOverflowMenu(event as GestureResponderEvent | MouseEvent);
        },
        getDescription: () => {},
    },
];

export default ContextMenuActions;
export type {ContextMenuActionPayload, ContextMenuAction};
