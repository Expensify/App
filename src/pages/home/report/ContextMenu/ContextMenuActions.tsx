import {Str} from 'expensify-common';
import type {MutableRefObject} from 'react';
import React from 'react';
import {InteractionManager} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import * as Expensicons from '@components/Icon/Expensicons';
import MiniQuickEmojiReactions from '@components/Reactions/MiniQuickEmojiReactions';
import QuickEmojiReactions from '@components/Reactions/QuickEmojiReactions';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as Browser from '@libs/Browser';
import Clipboard from '@libs/Clipboard';
import EmailUtils from '@libs/EmailUtils';
import * as Environment from '@libs/Environment/Environment';
import fileDownload from '@libs/fileDownload';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import * as Localize from '@libs/Localize';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import * as TaskUtils from '@libs/TaskUtils';
import * as Download from '@userActions/Download';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Beta, Download as DownloadOnyx, OnyxInputOrEntry, ReportAction, ReportActionReactions, Transaction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {ContextMenuAnchor} from './ReportActionContextMenu';
import {hideContextMenu, showDeleteModal} from './ReportActionContextMenu';

/** Gets the HTML version of the message in an action */
function getActionHtml(reportAction: OnyxInputOrEntry<ReportAction>): string {
    const message = Array.isArray(reportAction?.message) ? reportAction?.message?.at(-1) ?? null : reportAction?.message ?? null;
    return message?.html ?? '';
}

/** Sets the HTML string to Clipboard */
function setClipboardMessage(content: string) {
    if (!Clipboard.canSetHtml()) {
        Clipboard.setString(Parser.htmlToMarkdown(content));
    } else {
        const anchorRegex = CONST.REGEX_LINK_IN_ANCHOR;
        const isAnchorTag = anchorRegex.test(content);
        const plainText = isAnchorTag ? Parser.htmlToMarkdown(content) : Parser.htmlToText(content);
        Clipboard.setHtml(content, plainText);
    }
}

type ShouldShow = (
    type: string,
    reportAction: OnyxEntry<ReportAction>,
    isArchivedRoom: boolean,
    betas: OnyxEntry<Beta[]>,
    menuTarget: MutableRefObject<ContextMenuAnchor> | undefined,
    isChronosReport: boolean,
    reportID: string,
    isPinnedChat: boolean,
    isUnreadChat: boolean,
    isOffline: boolean,
    isMini: boolean,
    isProduction: boolean,
    moneyRequestAction: ReportAction | undefined,
    areHoldRequirementsMet: boolean,
) => boolean;

type ContextMenuActionPayload = {
    reportAction: ReportAction;
    transaction?: OnyxEntry<Transaction>;
    reportID: string;
    draftMessage: string;
    selection: string;
    close: () => void;
    openContextMenu: () => void;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    anchor?: MutableRefObject<HTMLDivElement | View | Text | null>;
    checkIfContextMenuActive?: () => void;
    openOverflowMenu: (event: GestureResponderEvent | MouseEvent, anchorRef: MutableRefObject<View | null>) => void;
    event?: GestureResponderEvent | MouseEvent | KeyboardEvent;
    setIsEmojiPickerActive?: (state: boolean) => void;
    anchorRef?: MutableRefObject<View | null>;
    moneyRequestAction: ReportAction | undefined;
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
    shouldPreventDefaultFocusOnPress?: boolean;
    shouldDisable?: (download: OnyxEntry<DownloadOnyx>) => boolean;
};

// A list of all the context actions in this menu.
const ContextMenuActions: ContextMenuAction[] = [
    {
        isAnonymousAction: false,
        shouldShow: (type, reportAction): reportAction is ReportAction =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !!reportAction && 'message' in reportAction && !ReportActionsUtils.isMessageDeleted(reportAction),
        renderContent: (closePopover, {reportID, reportAction, close: closeManually, openContextMenu, setIsEmojiPickerActive}) => {
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
                setIsEmojiPickerActive?.(false);
            };

            if (isMini) {
                return (
                    <MiniQuickEmojiReactions
                        key="MiniQuickEmojiReactions"
                        onEmojiSelected={toggleEmojiAndCloseMenu}
                        onPressOpenPicker={() => {
                            openContextMenu();
                            setIsEmojiPickerActive?.(true);
                        }}
                        onEmojiPickerClosed={() => {
                            closeContextMenu();
                            setIsEmojiPickerActive?.(false);
                        }}
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
                    setIsEmojiPickerActive={setIsEmojiPickerActive}
                />
            );
        },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.replyInThread',
        icon: Expensicons.ChatBubbleReply,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID) => {
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION) {
                return false;
            }
            return !ReportUtils.shouldDisableThread(reportAction, reportID);
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
            if (closePopover) {
                hideContextMenu(false, () => {
                    InteractionManager.runAfterInteractions(() => {
                        // Normally the focus callback of the main composer doesn't focus when willBlurTextInputOnTapOutside
                        // is false, so we need to pass true here to override this condition.
                        ReportActionComposeFocusManager.focus(true);
                    });
                    Report.navigateToAndOpenChildReport(reportAction?.childReportID, reportAction, originalReportID);
                });
                return;
            }
            Report.navigateToAndOpenChildReport(reportAction?.childReportID, reportAction, originalReportID);
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
            const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
            Report.markCommentAsUnread(originalReportID, reportAction?.created);
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
            Report.readNewestAction(reportID, true);
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
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && ReportUtils.canEditReportAction(reportAction) && !isArchivedRoom && !isChronosReport,
        onPress: (closePopover, {reportID, reportAction, draftMessage}) => {
            if (ReportActionsUtils.isMoneyRequestAction(reportAction)) {
                hideContextMenu(false);
                const childReportID = reportAction?.childReportID;
                Report.openReport(childReportID);
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
                return;
            }
            const editAction = () => {
                if (!draftMessage) {
                    Report.saveReportActionDraft(reportID, reportAction, Parser.htmlToMarkdown(getActionHtml(reportAction)));
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
        textTranslateKey: 'iou.unhold',
        icon: Expensicons.Stopwatch,
        shouldShow: (
            type,
            reportAction,
            isArchivedRoom,
            betas,
            anchor,
            isChronosReport,
            reportID,
            isPinnedChat,
            isUnreadChat,
            isOffline,
            isMini,
            isProduction,
            moneyRequestAction,
            areHoldRequirementsMet,
        ) => type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && areHoldRequirementsMet && ReportUtils.canHoldUnholdReportAction(moneyRequestAction).canUnholdRequest,
        onPress: (closePopover, {moneyRequestAction}) => {
            if (closePopover) {
                hideContextMenu(false, () => ReportUtils.changeMoneyRequestHoldStatus(moneyRequestAction));
                return;
            }

            // No popover to hide, call changeMoneyRequestHoldStatus immediately
            ReportUtils.changeMoneyRequestHoldStatus(moneyRequestAction);
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'iou.hold',
        icon: Expensicons.Stopwatch,
        shouldShow: (
            type,
            reportAction,
            isArchivedRoom,
            betas,
            anchor,
            isChronosReport,
            reportID,
            isPinnedChat,
            isUnreadChat,
            isOffline,
            isMini,
            isProduction,
            moneyRequestAction,
            areHoldRequirementsMet,
        ) => type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && areHoldRequirementsMet && ReportUtils.canHoldUnholdReportAction(moneyRequestAction).canHoldRequest,
        onPress: (closePopover, {moneyRequestAction}) => {
            if (closePopover) {
                hideContextMenu(false, () => ReportUtils.changeMoneyRequestHoldStatus(moneyRequestAction));
                return;
            }

            // No popover to hide, call changeMoneyRequestHoldStatus immediately
            ReportUtils.changeMoneyRequestHoldStatus(moneyRequestAction);
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
            const isThreadFirstChat = ReportUtils.isThreadFirstChat(reportAction, reportID);
            const isWhisperAction = ReportActionsUtils.isWhisperAction(reportAction) || ReportActionsUtils.isActionableTrackExpense(reportAction);
            const isExpenseReportAction = ReportActionsUtils.isMoneyRequestAction(reportAction) || ReportActionsUtils.isReportPreviewAction(reportAction);
            return !subscribed && !isWhisperAction && !isExpenseReportAction && !isThreadFirstChat && (shouldDisplayThreadReplies || (!isDeletedAction && !isArchivedRoom));
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            const childReportNotificationPreference = ReportUtils.getChildReportNotificationPreference(reportAction);
            const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
            if (closePopover) {
                hideContextMenu(false, () => {
                    ReportActionComposeFocusManager.focus();
                    Report.toggleSubscribeToChildReport(reportAction?.childReportID, reportAction, originalReportID, childReportNotificationPreference);
                });
                return;
            }

            ReportActionComposeFocusManager.focus();
            Report.toggleSubscribeToChildReport(reportAction?.childReportID, reportAction, originalReportID, childReportNotificationPreference);
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
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION &&
            !ReportActionsUtils.isReportActionAttachment(reportAction) &&
            !ReportActionsUtils.isMessageDeleted(reportAction) &&
            !ReportActionsUtils.isTripPreview(reportAction),

        // If return value is true, we switch the `text` and `icon` on
        // `ContextMenuItem` with `successText` and `successIcon` which will fall back to
        // the `text` and `icon`
        onPress: (closePopover, {reportAction, transaction, selection, reportID}) => {
            const isReportPreviewAction = ReportActionsUtils.isReportPreviewAction(reportAction);
            const messageHtml = getActionHtml(reportAction);
            const messageText = ReportActionsUtils.getReportActionMessageText(reportAction);

            const isAttachment = ReportActionsUtils.isReportActionAttachment(reportAction);
            if (!isAttachment) {
                const content = selection || messageHtml;
                if (isReportPreviewAction) {
                    const iouReportID = ReportActionsUtils.getIOUReportIDFromReportActionPreview(reportAction);
                    const displayMessage = ReportUtils.getReportPreviewMessage(iouReportID, reportAction);
                    Clipboard.setString(displayMessage);
                } else if (ReportActionsUtils.isTaskAction(reportAction)) {
                    const {text, html} = TaskUtils.getTaskReportActionMessage(reportAction);
                    const displayMessage = html ?? text;
                    setClipboardMessage(displayMessage);
                } else if (ReportActionsUtils.isModifiedExpenseAction(reportAction)) {
                    const modifyExpenseMessage = ModifiedExpenseMessage.getForReportAction(reportID, reportAction);
                    Clipboard.setString(modifyExpenseMessage);
                } else if (ReportActionsUtils.isReimbursementDeQueuedAction(reportAction)) {
                    const {expenseReportID} = ReportActionsUtils.getOriginalMessage(reportAction) ?? {};
                    const displayMessage = ReportUtils.getReimbursementDeQueuedActionMessage(reportAction, expenseReportID);
                    Clipboard.setString(displayMessage);
                } else if (ReportActionsUtils.isMoneyRequestAction(reportAction)) {
                    const displayMessage = ReportUtils.getIOUReportActionDisplayMessage(reportAction, transaction);
                    Clipboard.setString(displayMessage);
                } else if (ReportActionsUtils.isCreatedTaskReportAction(reportAction)) {
                    const taskPreviewMessage = TaskUtils.getTaskCreatedMessage(reportAction);
                    Clipboard.setString(taskPreviewMessage);
                } else if (ReportActionsUtils.isMemberChangeAction(reportAction)) {
                    const logMessage = ReportActionsUtils.getMemberChangeMessageFragment(reportAction).html ?? '';
                    setClipboardMessage(logMessage);
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
                    Clipboard.setString(ReportUtils.getWorkspaceNameUpdatedMessage(reportAction));
                } else if (ReportActionsUtils.isReimbursementQueuedAction(reportAction)) {
                    Clipboard.setString(ReportUtils.getReimbursementQueuedActionMessage(reportAction, reportID, false));
                } else if (ReportActionsUtils.isActionableMentionWhisper(reportAction)) {
                    const mentionWhisperMessage = ReportActionsUtils.getActionableMentionWhisperMessage(reportAction);
                    setClipboardMessage(mentionWhisperMessage);
                } else if (ReportActionsUtils.isActionableTrackExpense(reportAction)) {
                    setClipboardMessage(CONST.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE);
                } else if (ReportActionsUtils.isRenamedAction(reportAction)) {
                    setClipboardMessage(ReportActionsUtils.getRenamedAction(reportAction));
                } else if (
                    ReportActionsUtils.isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
                    ReportActionsUtils.isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED)
                ) {
                    const {harvesting} = ReportActionsUtils.getOriginalMessage(reportAction) ?? {};
                    let displayMessage = '';
                    if (harvesting) {
                        displayMessage = ReportUtils.getReportAutomaticallySubmittedMessage(reportAction);
                    } else {
                        displayMessage = ReportUtils.getIOUSubmittedMessage(reportAction);
                    }
                    Clipboard.setString(displayMessage);
                } else if (ReportActionsUtils.isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
                    const {automaticAction} = ReportActionsUtils.getOriginalMessage(reportAction) ?? {};
                    let displayMessage = '';
                    if (automaticAction) {
                        displayMessage = ReportUtils.getReportAutomaticallyApprovedMessage(reportAction);
                    } else {
                        displayMessage = ReportUtils.getIOUApprovedMessage(reportAction);
                    }
                    Clipboard.setString(displayMessage);
                } else if (ReportActionsUtils.isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
                    const {automaticAction} = ReportActionsUtils.getOriginalMessage(reportAction) ?? {};
                    let displayMessage = '';
                    if (automaticAction) {
                        displayMessage = ReportUtils.getReportAutomaticallyForwardedMessage(reportAction, reportID);
                    } else {
                        displayMessage = ReportUtils.getIOUForwardedMessage(reportAction, reportID);
                    }
                    Clipboard.setString(displayMessage);
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
                    const displayMessage = ReportUtils.getRejectedReportMessage();
                    Clipboard.setString(displayMessage);
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD) {
                    Clipboard.setString(Localize.translateLocal('iou.heldExpense'));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
                    Clipboard.setString(Localize.translateLocal('iou.unheldExpense'));
                } else if (ReportActionsUtils.isOldDotReportAction(reportAction)) {
                    const oldDotActionMessage = ReportActionsUtils.getMessageOfOldDotReportAction(reportAction);
                    Clipboard.setString(oldDotActionMessage);
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION) {
                    const originalMessage = ReportActionsUtils.getOriginalMessage(reportAction) as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION>['originalMessage'];
                    const reason = originalMessage?.reason;
                    const violationName = originalMessage?.violationName;
                    Clipboard.setString(Localize.translateLocal(`violationDismissal.${violationName}.${reason}` as TranslationPaths));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
                    setClipboardMessage(ReportActionsUtils.getExportIntegrationMessageHTML(reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
                    setClipboardMessage(ReportActionsUtils.getUpdateRoomDescriptionMessage(reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
                    setClipboardMessage(ReportActionsUtils.getPolicyChangeLogAddEmployeeMessage(reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
                    setClipboardMessage(ReportActionsUtils.getPolicyChangeLogChangeRoleMessage(reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
                    setClipboardMessage(ReportActionsUtils.getPolicyChangeLogDeleteMemberMessage(reportAction));
                } else if (ReportActionsUtils.isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
                    const {label, errorMessage} = ReportActionsUtils.getOriginalMessage(reportAction) ?? {label: '', errorMessage: ''};
                    setClipboardMessage(Localize.translateLocal('report.actions.type.integrationSyncFailed', {label, errorMessage}));
                } else if (ReportActionsUtils.isCardIssuedAction(reportAction)) {
                    const report = ReportUtils.getReport(reportID);
                    setClipboardMessage(ReportActionsUtils.getCardIssuedMessage(reportAction, true, report?.policyID));
                } else if (ReportActionsUtils.isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
                    setClipboardMessage(ReportActionsUtils.getRemovedConnectionMessage(reportAction));
                } else if (content) {
                    setClipboardMessage(
                        content.replace(/(<mention-user>)(.*?)(<\/mention-user>)/gi, (match, openTag: string, innerContent: string, closeTag: string): string => {
                            const modifiedContent = Str.removeSMSDomain(innerContent) || '';
                            return openTag + modifiedContent + closeTag || '';
                        }),
                    );
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
            const isAttachmentTarget = menuTarget?.current && 'tagName' in menuTarget.current && menuTarget?.current.tagName === 'IMG' && isAttachment;
            return type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !isAttachmentTarget && !ReportActionsUtils.isMessageDeleted(reportAction);
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
            Environment.getEnvironmentURL().then((environmentURL) => {
                const reportActionID = reportAction?.reportActionID;
                Clipboard.setString(`${environmentURL}/r/${originalReportID}/${reportActionID}`);
            });
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
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
            const activeRoute = Navigation.getActiveRoute();
            if (closePopover) {
                hideContextMenu(false, () => Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute)));
                return;
            }

            Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute));
        },
        getDescription: () => {},
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'common.download',
        icon: Expensicons.Download,
        successTextTranslateKey: 'common.download',
        successIcon: Expensicons.Download,
        shouldShow: (type, reportAction, isArchivedRoom, betas, menuTarget, isChronosReport, reportID, isPinnedChat, isUnreadChat, isOffline): reportAction is ReportAction => {
            const isAttachment = ReportActionsUtils.isReportActionAttachment(reportAction);
            const html = getActionHtml(reportAction);
            const isUploading = html.includes(CONST.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE);
            return isAttachment && !isUploading && !!reportAction?.reportActionID && !ReportActionsUtils.isMessageDeleted(reportAction) && !isOffline;
        },
        onPress: (closePopover, {reportAction}) => {
            const html = getActionHtml(reportAction);
            const {originalFileName, sourceURL} = getAttachmentDetails(html);
            const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL ?? '');
            const sourceID = (sourceURL?.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
            Download.setDownload(sourceID, true);
            const anchorRegex = CONST.REGEX_LINK_IN_ANCHOR;
            const isAnchorTag = anchorRegex.test(html);
            fileDownload(sourceURLWithAuth, originalFileName ?? '', '', isAnchorTag && Browser.isMobileSafari()).then(() => Download.setDownload(sourceID, false));
            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
        shouldDisable: (download) => download?.isDownloading ?? false,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyOnyxData',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: (type, isProduction) => type === CONST.CONTEXT_MENU_TYPES.REPORT && !isProduction,
        onPress: (closePopover, {reportID}) => {
            const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            Clipboard.setString(JSON.stringify(report, null, 4));
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
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.menu',
        icon: Expensicons.ThreeDots,
        shouldShow: (type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID, isPinnedChat, isUnreadChat, isOffline, isMini) => isMini,
        onPress: (closePopover, {openOverflowMenu, event, openContextMenu, anchorRef}) => {
            openOverflowMenu(event as GestureResponderEvent | MouseEvent, anchorRef ?? {current: null});
            openContextMenu();
        },
        getDescription: () => {},
        shouldPreventDefaultFocusOnPress: false,
    },
];

const restrictedReadOnlyActions: TranslationPaths[] = [
    'reportActionContextMenu.replyInThread',
    'reportActionContextMenu.editAction',
    'reportActionContextMenu.joinThread',
    'reportActionContextMenu.deleteAction',
];

const RestrictedReadOnlyContextMenuActions: ContextMenuAction[] = ContextMenuActions.filter(
    (action) => 'textTranslateKey' in action && restrictedReadOnlyActions.includes(action.textTranslateKey),
);

export {RestrictedReadOnlyContextMenuActions};
export default ContextMenuActions;
export type {ContextMenuActionPayload, ContextMenuAction};
