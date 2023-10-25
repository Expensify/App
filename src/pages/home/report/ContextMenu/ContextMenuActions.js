import React from 'react';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import lodashGet from 'lodash/get';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import * as Report from '../../../../libs/actions/Report';
import * as Download from '../../../../libs/actions/Download';
import Clipboard from '../../../../libs/Clipboard';
import * as ReportUtils from '../../../../libs/ReportUtils';
import * as ReportActionsUtils from '../../../../libs/ReportActionsUtils';
import * as PersonalDetailsUtils from '../../../../libs/PersonalDetailsUtils';
import ReportActionComposeFocusManager from '../../../../libs/ReportActionComposeFocusManager';
import {hideContextMenu, showDeleteModal, clearActiveReportAction} from './ReportActionContextMenu';
import CONST from '../../../../CONST';
import getAttachmentDetails from '../../../../libs/fileDownload/getAttachmentDetails';
import fileDownload from '../../../../libs/fileDownload';
import addEncryptedAuthTokenToURL from '../../../../libs/addEncryptedAuthTokenToURL';
import * as Environment from '../../../../libs/Environment/Environment';
import Permissions from '../../../../libs/Permissions';
import QuickEmojiReactions from '../../../../components/Reactions/QuickEmojiReactions';
import MiniQuickEmojiReactions from '../../../../components/Reactions/MiniQuickEmojiReactions';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import * as Task from '../../../../libs/actions/Task';

/**
 * Gets the HTML version of the message in an action.
 * @param {Object} reportAction
 * @return {String}
 */
function getActionText(reportAction) {
    const message = _.last(lodashGet(reportAction, 'message', null));
    return lodashGet(message, 'html', '');
}

const CONTEXT_MENU_TYPES = {
    LINK: 'LINK',
    REPORT_ACTION: 'REPORT_ACTION',
    EMAIL: 'EMAIL',
    REPORT: 'REPORT',
};

// A list of all the context actions in this menu.
export default [
    {
        isAnonymousAction: false,
        shouldKeepOpen: true,
        shouldShow: (type, reportAction) => type === CONTEXT_MENU_TYPES.REPORT_ACTION && _.has(reportAction, 'message') && !ReportActionsUtils.isMessageDeleted(reportAction),
        renderContent: (closePopover, {reportID, reportAction, close: closeManually, openContextMenu}) => {
            const isMini = !closePopover;

            const closeContextMenu = (onHideCallback) => {
                if (isMini) {
                    closeManually();
                    if (onHideCallback) {
                        onHideCallback();
                    }
                } else {
                    hideContextMenu(false, onHideCallback);
                }
            };

            const toggleEmojiAndCloseMenu = (emoji, existingReactions) => {
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
                        reportActionID={reportAction.reportActionID}
                        reportAction={reportAction}
                    />
                );
            }

            return (
                <QuickEmojiReactions
                    key="BaseQuickEmojiReactions"
                    closeContextMenu={closeContextMenu}
                    onEmojiSelected={toggleEmojiAndCloseMenu}
                    reportActionID={reportAction.reportActionID}
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
        shouldShow: (type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID, isPinnedChat, isUnreadChat, isOffline) => {
            const isAttachment = ReportActionsUtils.isReportActionAttachment(reportAction);
            const messageHtml = lodashGet(reportAction, ['message', 0, 'html']);
            return isAttachment && messageHtml !== CONST.ATTACHMENT_UPLOADING_MESSAGE_HTML && reportAction.reportActionID && !ReportActionsUtils.isMessageDeleted(reportAction) && !isOffline;
        },
        onPress: (closePopover, {reportAction}) => {
            const message = _.last(lodashGet(reportAction, 'message', [{}]));
            const html = lodashGet(message, 'html', '');
            const attachmentDetails = getAttachmentDetails(html);
            const {originalFileName, sourceURL} = attachmentDetails;
            const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL);
            const sourceID = (sourceURL.match(CONST.REGEX.ATTACHMENT_ID) || [])[1];
            Download.setDownload(sourceID, true);
            fileDownload(sourceURLWithAuth, originalFileName).then(() => Download.setDownload(sourceID, false));
            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.replyInThread',
        icon: Expensicons.ChatBubble,
        successTextTranslateKey: '',
        successIcon: null,
        shouldShow: (type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID) => {
            if (type !== CONTEXT_MENU_TYPES.REPORT_ACTION) {
                return false;
            }
            const isCommentAction = reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT;
            const isReportPreviewAction = reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW;
            const isIOUAction = reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && !ReportActionsUtils.isSplitBillAction(reportAction);
            const isModifiedExpenseAction = ReportActionsUtils.isModifiedExpenseAction(reportAction);
            const isTaskAction = ReportActionsUtils.isTaskAction(reportAction);
            return (isCommentAction || isReportPreviewAction || isIOUAction || isModifiedExpenseAction || isTaskAction) && !ReportUtils.isThreadFirstChat(reportAction, reportID);
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            if (closePopover) {
                hideContextMenu(false, () => {
                    ReportActionComposeFocusManager.focus();
                    Report.navigateToAndOpenChildReport(lodashGet(reportAction, 'childReportID', '0'), reportAction, reportID);
                });
                return;
            }

            Report.navigateToAndOpenChildReport(lodashGet(reportAction, 'childReportID', '0'), reportAction, reportID);
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyURLToClipboard',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: (type) => type === CONTEXT_MENU_TYPES.LINK,
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
        shouldShow: (type) => type === CONTEXT_MENU_TYPES.EMAIL,
        onPress: (closePopover, {selection}) => {
            Clipboard.setString(selection.replace('mailto:', ''));
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: (selection) => selection.replace('mailto:', ''),
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyToClipboard',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: (type, reportAction) =>
            type === CONTEXT_MENU_TYPES.REPORT_ACTION && !ReportActionsUtils.isReportActionAttachment(reportAction) && !ReportActionsUtils.isMessageDeleted(reportAction),

        // If return value is true, we switch the `text` and `icon` on
        // `ContextMenuItem` with `successText` and `successIcon` which will fallback to
        // the `text` and `icon`
        onPress: (closePopover, {reportAction, selection}) => {
            const isTaskAction = ReportActionsUtils.isTaskAction(reportAction);
            const isCreateTaskAction = ReportActionsUtils.isCreatedTaskReportAction(reportAction);
            const isReportPreviewAction = ReportActionsUtils.isReportPreviewAction(reportAction);
            const message = _.last(lodashGet(reportAction, 'message', [{}]));
            const reportID = lodashGet(reportAction, 'originalMessage.taskReportID', '').toString();
            const messageHtml = isTaskAction || isCreateTaskAction ? Task.getTaskReportActionMessage(reportAction.actionName, reportID, isCreateTaskAction) : lodashGet(message, 'html', '');

            const isAttachment = ReportActionsUtils.isReportActionAttachment(reportAction);
            if (!isAttachment) {
                const content = selection || messageHtml;
                if (isReportPreviewAction) {
                    const iouReport = ReportUtils.getReport(ReportActionsUtils.getIOUReportIDFromReportActionPreview(reportAction));
                    const displayMessage = ReportUtils.getReportPreviewMessage(iouReport, reportAction);
                    Clipboard.setString(displayMessage);
                } else if (ReportActionsUtils.isModifiedExpenseAction(reportAction)) {
                    const modifyExpenseMessage = ReportUtils.getModifiedExpenseMessage(reportAction);
                    Clipboard.setString(modifyExpenseMessage);
                } else if (ReportActionsUtils.isMoneyRequestAction(reportAction)) {
                    const displayMessage = ReportUtils.getIOUReportActionDisplayMessage(reportAction);
                    Clipboard.setString(displayMessage);
                } else if (content) {
                    const parser = new ExpensiMark();
                    if (!Clipboard.canSetHtml()) {
                        Clipboard.setString(parser.htmlToMarkdown(content));
                    } else {
                        const plainText = parser.htmlToText(content);
                        Clipboard.setHtml(content, plainText);
                    }
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
            const isAttachmentTarget = lodashGet(menuTarget, 'tagName') === 'IMG' && isAttachment;
            return Permissions.canUseCommentLinking(betas) && type === CONTEXT_MENU_TYPES.REPORT_ACTION && !isAttachmentTarget && !ReportActionsUtils.isMessageDeleted(reportAction);
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            Environment.getEnvironmentURL().then((environmentURL) => {
                const reportActionID = lodashGet(reportAction, 'reportActionID');
                Clipboard.setString(`${environmentURL}/r/${reportID}/${reportActionID}`);
            });
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: () => {},
    },

    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.markAsUnread',
        icon: Expensicons.Mail,
        successIcon: Expensicons.Checkmark,
        shouldShow: (type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID, isPinnedChat, isUnreadChat) =>
            type === CONTEXT_MENU_TYPES.REPORT_ACTION || (type === CONTEXT_MENU_TYPES.REPORT && !isUnreadChat),
        onPress: (closePopover, {reportAction, reportID}) => {
            Report.markCommentAsUnread(reportID, reportAction.created);
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
        shouldShow: (type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID, isPinnedChat, isUnreadChat) => type === CONTEXT_MENU_TYPES.REPORT && isUnreadChat,
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
        textTranslateKey: 'reportActionContextMenu.editAction',
        icon: Expensicons.Pencil,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport) =>
            type === CONTEXT_MENU_TYPES.REPORT_ACTION && ReportUtils.canEditReportAction(reportAction) && !isArchivedRoom && !isChronosReport,
        onPress: (closePopover, {reportID, reportAction, draftMessage}) => {
            if (ReportActionsUtils.isMoneyRequestAction(reportAction)) {
                hideContextMenu(false);
                const childReportID = lodashGet(reportAction, 'childReportID', 0);
                if (!childReportID) {
                    const thread = ReportUtils.buildTransactionThread(reportAction, reportID);
                    const userLogins = PersonalDetailsUtils.getLoginsByAccountIDs(thread.participantAccountIDs);
                    Report.openReport(thread.reportID, userLogins, thread, reportAction.reportActionID);
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(thread.reportID));
                    return;
                }
                Report.openReport(childReportID);
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
                return;
            }
            const editAction = () => Report.saveReportActionDraft(reportID, reportAction, _.isEmpty(draftMessage) ? getActionText(reportAction) : '');

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
        textTranslateKey: 'reportActionContextMenu.deleteAction',
        icon: Expensicons.Trashcan,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID) =>
            // Until deleting parent threads is supported in FE, we will prevent the user from deleting a thread parent
            type === CONTEXT_MENU_TYPES.REPORT_ACTION &&
            ReportUtils.canDeleteReportAction(reportAction, reportID) &&
            !isArchivedRoom &&
            !isChronosReport &&
            !ReportActionsUtils.isMessageDeleted(reportAction),
        onPress: (closePopover, {reportID, reportAction}) => {
            if (closePopover) {
                // Hide popover, then call showDeleteConfirmModal
                hideContextMenu(false, () => showDeleteModal(reportID, reportAction, true, clearActiveReportAction, clearActiveReportAction));
                return;
            }

            // No popover to hide, call showDeleteConfirmModal immediately
            showDeleteModal(reportID, reportAction, true, clearActiveReportAction, clearActiveReportAction);
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'common.pin',
        icon: Expensicons.Pin,
        shouldShow: (type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID, isPinnedChat) =>
            type === CONTEXT_MENU_TYPES.REPORT && !isPinnedChat && !ReportUtils.isMoneyRequestReport(reportID),
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
        shouldShow: (type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID, isPinnedChat) =>
            type === CONTEXT_MENU_TYPES.REPORT && isPinnedChat && !ReportUtils.isMoneyRequestReport(reportID),
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
            type === CONTEXT_MENU_TYPES.REPORT_ACTION &&
            ReportUtils.canFlagReportAction(reportAction, reportID) &&
            !isArchivedRoom &&
            !isChronosReport &&
            !ReportUtils.isConciergeChatReport(reportID) &&
            reportAction.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE,
        onPress: (closePopover, {reportID, reportAction}) => {
            if (closePopover) {
                hideContextMenu(false, () => Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction.reportActionID)));
                return;
            }

            Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction.reportActionID));
        },
        getDescription: () => {},
    },
];

export {CONTEXT_MENU_TYPES};
