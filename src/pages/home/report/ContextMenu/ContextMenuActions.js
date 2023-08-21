import React from 'react';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import lodashGet from 'lodash/get';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import * as Report from '../../../../libs/actions/Report';
import * as Download from '../../../../libs/actions/Download';
import Clipboard from '../../../../libs/Clipboard';
import * as ReportUtils from '../../../../libs/ReportUtils';
import * as ReportActionUtils from '../../../../libs/ReportActionsUtils';
import ReportActionComposeFocusManager from '../../../../libs/ReportActionComposeFocusManager';
import {hideContextMenu, showDeleteModal} from './ReportActionContextMenu';
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
        shouldShow: (type, reportAction) => type === CONTEXT_MENU_TYPES.REPORT_ACTION && _.has(reportAction, 'message') && !ReportActionUtils.isMessageDeleted(reportAction),
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
        shouldShow: (type, reportAction) => {
            const message = _.last(lodashGet(reportAction, 'message', [{}]));
            const isAttachment = _.has(reportAction, 'isAttachment') ? reportAction.isAttachment : ReportUtils.isReportMessageAttachment(message);
            return isAttachment && message.html !== CONST.ATTACHMENT_UPLOADING_MESSAGE_HTML && reportAction.reportActionID && !ReportActionUtils.isMessageDeleted(reportAction);
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
            const isCommentAction = reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && !ReportUtils.isThreadFirstChat(reportAction, reportID);
            const isReportPreviewAction = reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW;
            const isIOUAction = reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && !ReportActionUtils.isSplitBillAction(reportAction);
            return isCommentAction || isReportPreviewAction || isIOUAction;
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
        isAnonymousAction: false,
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
        isAnonymousAction: false,
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
            type === CONTEXT_MENU_TYPES.REPORT_ACTION &&
            reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU &&
            reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED &&
            reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED &&
            reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.TASKREOPENED &&
            !ReportActionUtils.isCreatedTaskReportAction(reportAction) &&
            !ReportUtils.isReportMessageAttachment(_.last(lodashGet(reportAction, ['message'], [{}]))) &&
            !ReportActionUtils.isMessageDeleted(reportAction),

        // If return value is true, we switch the `text` and `icon` on
        // `ContextMenuItem` with `successText` and `successIcon` which will fallback to
        // the `text` and `icon`
        onPress: (closePopover, {reportAction, selection}) => {
            const isReportPreviewAction = ReportActionUtils.isReportPreviewAction(reportAction);
            const message = _.last(lodashGet(reportAction, 'message', [{}]));
            const messageHtml = lodashGet(message, 'html', '');

            const isAttachment = _.has(reportAction, 'isAttachment') ? reportAction.isAttachment : ReportUtils.isReportMessageAttachment(message);
            if (!isAttachment) {
                const content = selection || messageHtml;
                if (isReportPreviewAction) {
                    const iouReport = ReportUtils.getReport(ReportActionUtils.getIOUReportIDFromReportActionPreview(reportAction));
                    const displayMessage = ReportUtils.getReportPreviewMessage(iouReport, reportAction);
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
            } else {
                Clipboard.setString(messageHtml);
            }
            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
    },

    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.copyLink',
        icon: Expensicons.LinkCopy,
        successIcon: Expensicons.Checkmark,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget) => {
            const message = _.last(lodashGet(reportAction, 'message', [{}]));
            const isAttachment = _.has(reportAction, 'isAttachment') ? reportAction.isAttachment : ReportUtils.isReportMessageAttachment(message);

            // Only hide the copylink menu item when context menu is opened over img element.
            const isAttachmentTarget = lodashGet(menuTarget, 'tagName') === 'IMG' && isAttachment;
            return Permissions.canUseCommentLinking(betas) && type === CONTEXT_MENU_TYPES.REPORT_ACTION && !isAttachmentTarget && !ReportActionUtils.isMessageDeleted(reportAction);
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            Environment.getEnvironmentURL().then((environmentURL) => {
                const reportActionID = parseInt(lodashGet(reportAction, 'reportActionID'), 10);
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
        textTranslateKey: 'reportActionContextMenu.editComment',
        icon: Expensicons.Pencil,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport) =>
            type === CONTEXT_MENU_TYPES.REPORT_ACTION && ReportUtils.canEditReportAction(reportAction) && !isArchivedRoom && !isChronosReport,
        onPress: (closePopover, {reportID, reportAction, draftMessage}) => {
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
            !ReportActionUtils.isMessageDeleted(reportAction),
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
                hideContextMenu(false, () => Navigation.navigate(ROUTES.getFlagCommentRoute(reportID, reportAction.reportActionID)));
            }

            Navigation.navigate(ROUTES.getFlagCommentRoute(reportID, reportAction.reportActionID));
        },
        getDescription: () => {},
    },
];

export {CONTEXT_MENU_TYPES};
