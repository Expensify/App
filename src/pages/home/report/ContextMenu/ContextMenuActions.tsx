import {Str} from 'expensify-common';
import type {RefObject} from 'react';
import React from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import MiniQuickEmojiReactions from '@components/Reactions/MiniQuickEmojiReactions';
import QuickEmojiReactions from '@components/Reactions/QuickEmojiReactions';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import Clipboard from '@libs/Clipboard';
import EmailUtils from '@libs/EmailUtils';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import fileDownload from '@libs/fileDownload';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from '@libs/LocalePhoneNumber';
import {getForReportActionTemp} from '@libs/ModifiedExpenseMessage';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {getCleanedTagName} from '@libs/PolicyUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {
    getActionableCardFraudAlertMessage,
    getActionableMentionWhisperMessage,
    getAddedApprovalRuleMessage,
    getAddedConnectionMessage,
    getAutoPayApprovedReportsEnabledMessage,
    getAutoReimbursementMessage,
    getCardIssuedMessage,
    getChangedApproverActionMessage,
    getCompanyAddressUpdateMessage,
    getCompanyCardConnectionBrokenMessage,
    getCreatedReportForUnapprovedTransactionsMessage,
    getDefaultApproverUpdateMessage,
    getDeletedApprovalRuleMessage,
    getDismissedViolationMessageText,
    getDynamicExternalWorkflowRoutedMessage,
    getExportIntegrationMessageHTML,
    getForwardsToUpdateMessage,
    getHarvestCreatedExpenseReportMessage,
    getIntegrationSyncFailedMessage,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
    getIOUReportIDFromReportActionPreview,
    getJoinRequestMessage,
    getMarkedReimbursedMessage,
    getMemberChangeMessageFragment,
    getMessageOfOldDotReportAction,
    getOriginalMessage,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDefaultTitleMessage,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyChangeLogUpdateEmployee,
    getReimburserUpdateMessage,
    getRemovedConnectionMessage,
    getRenamedAction,
    getReportAction,
    getReportActionMessageText,
    getRoomAvatarUpdatedMessage,
    getSubmitsToUpdateMessage,
    getTagListNameUpdatedMessage,
    getTravelUpdateMessage,
    getUpdateACHAccountMessage,
    getUpdatedApprovalRuleMessage,
    getUpdatedAuditRateMessage,
    getUpdatedManualApprovalThresholdMessage,
    getUpdateRoomDescriptionMessage,
    getWorkspaceAttendeeTrackingUpdateMessage,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
    getWorkspaceCustomUnitUpdatedMessage,
    getWorkspaceDescriptionUpdatedMessage,
    getWorkspaceFeatureEnabledMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionableJoinRequest,
    isActionableMentionWhisper,
    isActionableTrackExpense,
    isActionOfType,
    isCardIssuedAction,
    isCreatedAction,
    isCreatedTaskReportAction,
    isDeletedAction as isDeletedActionReportActionsUtils,
    isMarkAsClosedAction,
    isMemberChangeAction,
    isMessageDeleted,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isMovedAction,
    isOldDotReportAction,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isReportActionAttachment,
    isReportPreviewAction as isReportPreviewActionReportActionsUtils,
    isTagModificationAction,
    isTaskAction as isTaskActionReportActionsUtils,
    isTripPreview,
    isUnapprovedAction,
    isWhisperAction as isWhisperActionReportActionsUtils,
} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {
    canDeleteReportAction,
    canEditReportAction,
    canFlagReportAction,
    canHoldUnholdReportAction,
    changeMoneyRequestHoldStatus,
    getChildReportNotificationPreference as getChildReportNotificationPreferenceReportUtils,
    getDeletedTransactionMessage,
    getIOUReportActionDisplayMessage,
    getMovedActionMessage,
    getMovedTransactionMessage,
    getOriginalReportID,
    getPolicyChangeMessage,
    getReimbursementDeQueuedOrCanceledActionMessage,
    getReimbursementQueuedActionMessage,
    getReportName as getReportNameDeprecated,
    getReportOrDraftReport,
    getReportPreviewMessage,
    getUnreportedTransactionMessage,
    getWorkspaceNameUpdatedMessage,
    isExpenseReport,
    shouldDisableThread,
    shouldDisplayThreadReplies as shouldDisplayThreadRepliesReportUtils,
} from '@libs/ReportUtils';
import {getTaskCreatedMessage, getTaskReportActionMessage} from '@libs/TaskUtils';
import {setDownload} from '@userActions/Download';
import {
    deleteReportActionDraft,
    markCommentAsUnread,
    navigateToAndOpenChildReport,
    openReport,
    readNewestAction,
    saveReportActionDraft,
    toggleEmojiReaction,
    togglePinnedState,
    toggleSubscribeToChildReport,
} from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Beta, Card, Download as DownloadOnyx, OnyxInputOrEntry, Policy, PolicyTagLists, ReportAction, ReportActionReactions, Report as ReportType, Transaction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import KeyboardUtils from '@src/utils/keyboard';
import type {ContextMenuAnchor} from './ReportActionContextMenu';
import {hideContextMenu, showDeleteModal} from './ReportActionContextMenu';

/** Gets the HTML version of the message in an action */
function getActionHtml(reportAction: OnyxInputOrEntry<ReportAction>): string {
    const message = Array.isArray(reportAction?.message) ? (reportAction?.message?.at(-1) ?? null) : (reportAction?.message ?? null);
    return message?.html ?? '';
}

/** Sets the HTML string to Clipboard */
function setClipboardMessage(content: string | undefined) {
    if (!content) {
        return;
    }
    if (!Clipboard.canSetHtml()) {
        Clipboard.setString(Parser.htmlToMarkdown(content));
    } else {
        // Use markdown format text for the plain text(clipboard type "text/plain") to ensure consistency across all platforms.
        // More info: https://github.com/Expensify/App/issues/53718
        const markdownText = Parser.htmlToMarkdown(content);
        Clipboard.setHtml(content, markdownText);
    }
}

type ShouldShow = (args: {
    type: string;
    reportAction: OnyxEntry<ReportAction>;
    childReportActions: OnyxCollection<ReportAction>;
    isArchivedRoom: boolean;
    betas: OnyxEntry<Beta[]>;
    menuTarget: RefObject<ContextMenuAnchor> | undefined;
    isChronosReport: boolean;
    reportID?: string;
    isPinnedChat: boolean;
    isUnreadChat: boolean;
    isThreadReportParentAction: boolean;
    isOffline: boolean;
    isMini: boolean;
    isProduction: boolean;
    moneyRequestAction: ReportAction | undefined;
    areHoldRequirementsMet: boolean;
    isDebugModeEnabled: OnyxEntry<boolean>;
    iouTransaction: OnyxEntry<Transaction>;
    transactions?: OnyxCollection<Transaction>;
    moneyRequestReport?: OnyxEntry<ReportType>;
    moneyRequestPolicy?: OnyxEntry<Policy>;
    isHarvestReport?: boolean;
}) => boolean;

type ContextMenuActionPayload = {
    reportAction: ReportAction;
    transaction?: OnyxEntry<Transaction>;
    reportID: string | undefined;
    currentUserAccountID: number;
    report: OnyxEntry<ReportType>;
    draftMessage: string;
    selection: string;
    close: () => void;
    transitionActionSheetState: (params: {type: string; payload?: Record<string, unknown>}) => void;
    openContextMenu: () => void;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    anchor?: RefObject<HTMLDivElement | View | Text | null>;
    checkIfContextMenuActive?: () => void;
    openOverflowMenu: (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<View | null>) => void;
    event?: GestureResponderEvent | MouseEvent | KeyboardEvent;
    setIsEmojiPickerActive?: (state: boolean) => void;
    anchorRef?: RefObject<View | null>;
    moneyRequestAction: ReportAction | undefined;
    card?: Card;
    originalReport: OnyxEntry<ReportType>;
    isHarvestReport?: boolean;
    isTryNewDotNVPDismissed?: boolean;
    childReport?: OnyxEntry<ReportType>;
    movedFromReport?: OnyxEntry<ReportType>;
    movedToReport?: OnyxEntry<ReportType>;
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];
    policy?: OnyxEntry<Policy>;
    policyTags: OnyxEntry<PolicyTagLists>;
    translate: LocalizedTranslate;
    harvestReport?: OnyxEntry<ReportType>;
    isDelegateAccessRestricted?: boolean;
    showDelegateNoAccessModal?: () => void;
};

type OnPress = (closePopover: boolean, payload: ContextMenuActionPayload, selection?: string, reportID?: string, draftMessage?: string) => void;

type RenderContent = (closePopover: boolean, payload: ContextMenuActionPayload) => React.ReactElement;

type GetDescription = (selection?: string) => string | void;

type ContextMenuActionWithContent = {
    renderContent: RenderContent;
};

type ContextMenuActionWithIcon = WithSentryLabel & {
    textTranslateKey: TranslationPaths;
    icon:
        | IconAsset
        | Extract<
              ExpensifyIconName,
              'Download' | 'ThreeDots' | 'ChatBubbleReply' | 'ChatBubbleUnread' | 'Mail' | 'Pencil' | 'Stopwatch' | 'Bell' | 'Copy' | 'LinkCopy' | 'Pin' | 'Flag' | 'Bug' | 'Trashcan'
          >;
    successTextTranslateKey?: TranslationPaths;
    successIcon?:
        | IconAsset
        | Extract<
              ExpensifyIconName,
              | 'Download'
              | 'ChatBubbleReply'
              | 'ChatBubbleUnread'
              | 'Checkmark'
              | 'Mail'
              | 'Pencil'
              | 'Stopwatch'
              | 'Bell'
              | 'Copy'
              | 'LinkCopy'
              | 'Pin'
              | 'Flag'
              | 'Bug'
              | 'Trashcan'
              | 'ThreeDots'
          >;
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
        shouldShow: ({type, reportAction}) => {
            const isDynamicWorkflowRoutedAction = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
            return type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !!reportAction && 'message' in reportAction && !isMessageDeleted(reportAction) && !isDynamicWorkflowRoutedAction;
        },
        renderContent: (closePopover, {reportID, reportAction, currentUserAccountID, close: closeManually, openContextMenu, setIsEmojiPickerActive}) => {
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

            const toggleEmojiAndCloseMenu = (emoji: Emoji, existingReactions: OnyxEntry<ReportActionReactions>, preferredSkinTone: number) => {
                toggleEmojiReaction(reportID, reportAction, emoji, existingReactions, preferredSkinTone, currentUserAccountID);
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
        icon: 'ChatBubbleReply',
        shouldShow: ({type, reportAction, reportID, isThreadReportParentAction, isArchivedRoom}) => {
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION || !reportID) {
                return false;
            }
            return !shouldDisableThread(reportAction, isThreadReportParentAction, isArchivedRoom);
        },
        onPress: (closePopover, {reportAction, childReport, originalReport}) => {
            if (closePopover) {
                hideContextMenu(false, () => {
                    KeyboardUtils.dismiss().then(() => {
                        navigateToAndOpenChildReport(childReport, reportAction, originalReport);
                    });
                });
                return;
            }
            navigateToAndOpenChildReport(childReport, reportAction, originalReport);
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.markAsUnread',
        icon: 'ChatBubbleUnread',
        successIcon: 'Checkmark',
        shouldShow: ({type, reportAction, isUnreadChat}) => {
            const isDynamicWorkflowRoutedAction = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
            return (type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !isDynamicWorkflowRoutedAction) || (type === CONST.CONTEXT_MENU_TYPES.REPORT && !isUnreadChat);
        },
        onPress: (closePopover, {reportAction, reportID, currentUserAccountID}) => {
            markCommentAsUnread(reportID, reportAction, currentUserAccountID);
            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.markAsRead',
        icon: 'Mail',
        successIcon: 'Checkmark',
        shouldShow: ({type, isUnreadChat}) => type === CONST.CONTEXT_MENU_TYPES.REPORT && isUnreadChat,
        onPress: (closePopover, {reportID}) => {
            readNewestAction(reportID, true);
            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_READ,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.editAction',
        icon: 'Pencil',
        shouldShow: ({type, reportAction, isArchivedRoom, isChronosReport, moneyRequestAction}) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && (canEditReportAction(reportAction) || canEditReportAction(moneyRequestAction)) && !isArchivedRoom && !isChronosReport,
        onPress: (closePopover, {reportID, reportAction, draftMessage, moneyRequestAction}) => {
            if (isMoneyRequestAction(reportAction) || isMoneyRequestAction(moneyRequestAction)) {
                const editExpense = () => {
                    const childReportID = reportAction?.childReportID;
                    openReport(childReportID);
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
                };
                if (closePopover) {
                    hideContextMenu(false, editExpense);
                    return;
                }
                editExpense();
                return;
            }
            const editAction = () => {
                if (!draftMessage) {
                    saveReportActionDraft(reportID, reportAction, Parser.htmlToMarkdown(getActionHtml(reportAction)));
                } else {
                    deleteReportActionDraft(reportID, reportAction);
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
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'iou.unhold',
        icon: 'Stopwatch',
        shouldShow: ({type, moneyRequestReport, moneyRequestAction, moneyRequestPolicy, areHoldRequirementsMet, iouTransaction}) => {
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION || !areHoldRequirementsMet) {
                return false;
            }
            const holdReportAction = getReportAction(moneyRequestAction?.childReportID, `${iouTransaction?.comment?.hold ?? ''}`);
            return canHoldUnholdReportAction(moneyRequestReport, moneyRequestAction, holdReportAction, iouTransaction, moneyRequestPolicy).canUnholdRequest;
        },
        onPress: (closePopover, {moneyRequestAction, isDelegateAccessRestricted, showDelegateNoAccessModal}) => {
            if (isDelegateAccessRestricted) {
                hideContextMenu(false, showDelegateNoAccessModal);
                return;
            }

            if (closePopover) {
                hideContextMenu(false, () => changeMoneyRequestHoldStatus(moneyRequestAction));
                return;
            }

            // No popover to hide, call changeMoneyRequestHoldStatus immediately
            changeMoneyRequestHoldStatus(moneyRequestAction);
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.UNHOLD,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'iou.hold',
        icon: 'Stopwatch',
        shouldShow: ({type, moneyRequestReport, moneyRequestAction, moneyRequestPolicy, areHoldRequirementsMet, iouTransaction}) => {
            if (type !== CONST.CONTEXT_MENU_TYPES.REPORT_ACTION || !areHoldRequirementsMet) {
                return false;
            }
            const holdReportAction = getReportAction(moneyRequestAction?.childReportID, `${iouTransaction?.comment?.hold ?? ''}`);
            return canHoldUnholdReportAction(moneyRequestReport, moneyRequestAction, holdReportAction, iouTransaction, moneyRequestPolicy).canHoldRequest;
        },
        onPress: (closePopover, {moneyRequestAction, isDelegateAccessRestricted, showDelegateNoAccessModal}) => {
            if (isDelegateAccessRestricted) {
                hideContextMenu(false, showDelegateNoAccessModal);
                return;
            }

            if (closePopover) {
                hideContextMenu(false, () => changeMoneyRequestHoldStatus(moneyRequestAction));
                return;
            }

            // No popover to hide, call changeMoneyRequestHoldStatus immediately
            changeMoneyRequestHoldStatus(moneyRequestAction);
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.HOLD,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.joinThread',
        icon: 'Bell',
        shouldShow: ({reportAction, isArchivedRoom, isThreadReportParentAction, isHarvestReport}) => {
            const childReportNotificationPreference = getChildReportNotificationPreferenceReportUtils(reportAction);
            const isDeletedAction = isDeletedActionReportActionsUtils(reportAction);
            const shouldDisplayThreadReplies = shouldDisplayThreadRepliesReportUtils(reportAction, isThreadReportParentAction);
            const subscribed = childReportNotificationPreference !== 'hidden';
            const isWhisperAction = isWhisperActionReportActionsUtils(reportAction) || isActionableTrackExpense(reportAction);
            const isExpenseReportAction = isMoneyRequestAction(reportAction) || isReportPreviewActionReportActionsUtils(reportAction);
            const isTaskAction = isCreatedTaskReportAction(reportAction);
            const isHarvestCreatedExpenseReportAction = isHarvestReport && isCreatedAction(reportAction);
            const shouldDisableJoinThread = shouldDisableThread(reportAction, isThreadReportParentAction, isArchivedRoom);
            return (
                !subscribed &&
                !isWhisperAction &&
                !isTaskAction &&
                !isExpenseReportAction &&
                !isThreadReportParentAction &&
                !isHarvestCreatedExpenseReportAction &&
                !shouldDisableJoinThread &&
                (shouldDisplayThreadReplies || (!isDeletedAction && !isArchivedRoom))
            );
        },
        onPress: (closePopover, {reportAction, currentUserAccountID, originalReport}) => {
            const childReportNotificationPreference = getChildReportNotificationPreferenceReportUtils(reportAction);
            if (closePopover) {
                hideContextMenu(false, () => {
                    ReportActionComposeFocusManager.focus();
                    toggleSubscribeToChildReport(reportAction?.childReportID, currentUserAccountID, reportAction, originalReport, childReportNotificationPreference);
                });
                return;
            }

            ReportActionComposeFocusManager.focus();
            toggleSubscribeToChildReport(reportAction?.childReportID, currentUserAccountID, reportAction, originalReport, childReportNotificationPreference);
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.JOIN_THREAD,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.leaveThread',
        icon: Expensicons.Exit,
        shouldShow: ({reportAction, isArchivedRoom, isThreadReportParentAction, isHarvestReport}) => {
            const childReportNotificationPreference = getChildReportNotificationPreferenceReportUtils(reportAction);
            const isDeletedAction = isDeletedActionReportActionsUtils(reportAction);
            const shouldDisplayThreadReplies = shouldDisplayThreadRepliesReportUtils(reportAction, isThreadReportParentAction);
            const subscribed = childReportNotificationPreference !== 'hidden';
            const isWhisperAction = isWhisperActionReportActionsUtils(reportAction) || isActionableTrackExpense(reportAction);
            const isExpenseReportAction = isMoneyRequestAction(reportAction) || isReportPreviewActionReportActionsUtils(reportAction);
            const isTaskAction = isCreatedTaskReportAction(reportAction);
            const isHarvestCreatedExpenseReportAction = isHarvestReport && isCreatedAction(reportAction);
            return (
                subscribed &&
                !isWhisperAction &&
                !isTaskAction &&
                !isExpenseReportAction &&
                !isThreadReportParentAction &&
                !isHarvestCreatedExpenseReportAction &&
                (shouldDisplayThreadReplies || (!isDeletedAction && !isArchivedRoom))
            );
        },
        onPress: (closePopover, {reportAction, currentUserAccountID, originalReport}) => {
            const childReportNotificationPreference = getChildReportNotificationPreferenceReportUtils(reportAction);
            if (closePopover) {
                hideContextMenu(false, () => {
                    ReportActionComposeFocusManager.focus();
                    toggleSubscribeToChildReport(reportAction?.childReportID, currentUserAccountID, reportAction, originalReport, childReportNotificationPreference);
                });
                return;
            }

            ReportActionComposeFocusManager.focus();
            toggleSubscribeToChildReport(reportAction?.childReportID, currentUserAccountID, reportAction, originalReport, childReportNotificationPreference);
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.LEAVE_THREAD,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyURLToClipboard',
        icon: 'Copy',
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: 'Checkmark',
        shouldShow: ({type}) => type === CONST.CONTEXT_MENU_TYPES.LINK,
        onPress: (closePopover, {selection}) => {
            Clipboard.setString(selection);
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: (selection) => selection,
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_URL,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'common.copyToClipboard',
        icon: 'Copy',
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: 'Checkmark',
        shouldShow: ({type}) => type === CONST.CONTEXT_MENU_TYPES.TEXT,
        onPress: (closePopover, {selection}) => {
            Clipboard.setString(selection);
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: () => undefined,
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_TO_CLIPBOARD,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyEmailToClipboard',
        icon: 'Copy',
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: 'Checkmark',
        shouldShow: ({type}) => type === CONST.CONTEXT_MENU_TYPES.EMAIL,
        onPress: (closePopover, {selection}) => {
            Clipboard.setString(EmailUtils.trimMailTo(selection));
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: (selection) => EmailUtils.prefixMailSeparatorsWithBreakOpportunities(EmailUtils.trimMailTo(selection ?? '')),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_EMAIL,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyMessage',
        icon: 'Copy',
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: 'Checkmark',
        shouldShow: ({type, reportAction}) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !isReportActionAttachment(reportAction) && !isMessageDeleted(reportAction) && !isTripPreview(reportAction),

        // If return value is true, we switch the `text` and `icon` on
        // `ContextMenuItem` with `successText` and `successIcon` which will fall back to
        // the `text` and `icon`
        onPress: (
            closePopover,
            {
                reportAction,
                transaction,
                selection,
                report,
                card,
                originalReport,
                isHarvestReport,
                isTryNewDotNVPDismissed,
                movedFromReport,
                movedToReport,
                childReport,
                getLocalDateFromDatetime,
                policy,
                policyTags,
                translate,
                harvestReport,
            },
        ) => {
            const isReportPreviewAction = isReportPreviewActionReportActionsUtils(reportAction);
            const messageHtml = getActionHtml(reportAction);
            const messageText = getReportActionMessageText(reportAction);

            const isAttachment = isReportActionAttachment(reportAction);
            if (!isAttachment) {
                const content = selection || messageHtml;
                if (isReportPreviewAction) {
                    const iouReportID = getIOUReportIDFromReportActionPreview(reportAction);
                    const displayMessage = getReportPreviewMessage(iouReportID, reportAction, undefined, undefined, undefined, undefined, undefined, true);
                    Clipboard.setString(displayMessage);
                } else if (isTaskActionReportActionsUtils(reportAction)) {
                    const {text, html} = getTaskReportActionMessage(translate, reportAction);
                    const displayMessage = html ?? text;
                    setClipboardMessage(displayMessage);
                } else if (isModifiedExpenseAction(reportAction)) {
                    const modifyExpenseMessage = getForReportActionTemp({
                        translate,
                        reportAction,
                        policy,
                        movedFromReport,
                        movedToReport,
                        policyTags,
                    });
                    Clipboard.setString(modifyExpenseMessage);
                } else if (isReimbursementDeQueuedOrCanceledAction(reportAction)) {
                    const displayMessage = getReimbursementDeQueuedOrCanceledActionMessage(translate, reportAction, report);
                    Clipboard.setString(displayMessage);
                } else if (isMoneyRequestAction(reportAction)) {
                    const displayMessage = getIOUReportActionDisplayMessage(translate, reportAction, transaction, report);
                    if (displayMessage === Parser.htmlToText(displayMessage)) {
                        Clipboard.setString(displayMessage);
                    } else {
                        setClipboardMessage(displayMessage);
                    }
                } else if (isCreatedTaskReportAction(reportAction)) {
                    const taskPreviewMessage = getTaskCreatedMessage(translate, reportAction, childReport, true);
                    Clipboard.setString(taskPreviewMessage);
                } else if (isMemberChangeAction(reportAction)) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    const logMessage = getMemberChangeMessageFragment(translate, reportAction, getReportNameDeprecated).html ?? '';
                    setClipboardMessage(logMessage);
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
                    Clipboard.setString(Str.htmlDecode(getWorkspaceNameUpdatedMessage(translate, reportAction)));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION) {
                    Clipboard.setString(getWorkspaceDescriptionUpdatedMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
                    Clipboard.setString(getWorkspaceCurrencyUpdateMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
                    Clipboard.setString(getWorkspaceFrequencyUpdateMessage(translate, reportAction));
                } else if (
                    reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY ||
                    reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY ||
                    reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY ||
                    reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME
                ) {
                    Clipboard.setString(getWorkspaceCategoryUpdateMessage(translate, reportAction));
                } else if (
                    reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX ||
                    reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX ||
                    reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX
                ) {
                    Clipboard.setString(getWorkspaceTaxUpdateMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME) {
                    Clipboard.setString(getCleanedTagName(getTagListNameUpdatedMessage(translate, reportAction)));
                } else if (isTagModificationAction(reportAction.actionName)) {
                    Clipboard.setString(getCleanedTagName(getWorkspaceTagUpdateMessage(translate, reportAction)));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT) {
                    Clipboard.setString(getWorkspaceCustomUnitUpdatedMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE) {
                    Clipboard.setString(getWorkspaceCustomUnitRateAddedMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE) {
                    Clipboard.setString(getWorkspaceCustomUnitRateUpdatedMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
                    Clipboard.setString(getWorkspaceCustomUnitRateDeletedMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
                    Clipboard.setString(getWorkspaceReportFieldAddMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
                    Clipboard.setString(getWorkspaceReportFieldUpdateMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
                    Clipboard.setString(getWorkspaceReportFieldDeleteMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
                    setClipboardMessage(getWorkspaceUpdateFieldMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED) {
                    Clipboard.setString(getWorkspaceFeatureEnabledMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED) {
                    Clipboard.setString(getWorkspaceAttendeeTrackingUpdateMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER) {
                    Clipboard.setString(getDefaultApproverUpdateMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO) {
                    Clipboard.setString(getSubmitsToUpdateMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO) {
                    Clipboard.setString(getForwardsToUpdateMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED) {
                    Clipboard.setString(getAutoPayApprovedReportsEnabledMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT) {
                    Clipboard.setString(getAutoReimbursementMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME) {
                    Clipboard.setString(getInvoiceCompanyNameUpdateMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE) {
                    Clipboard.setString(getInvoiceCompanyWebsiteUpdateMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER) {
                    Clipboard.setString(getReimburserUpdateMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED) {
                    Clipboard.setString(getWorkspaceReimbursementUpdateMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT) {
                    Clipboard.setString(getUpdateACHAccountMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS) {
                    Clipboard.setString(getCompanyAddressUpdateMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT) {
                    Clipboard.setString(getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT) {
                    Clipboard.setString(getPolicyChangeLogMaxExpenseAmountMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE) {
                    Clipboard.setString(getPolicyChangeLogMaxExpenseAgeMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE) {
                    Clipboard.setString(getPolicyChangeLogDefaultBillableMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE) {
                    Clipboard.setString(getPolicyChangeLogDefaultReimbursableMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED) {
                    Clipboard.setString(getPolicyChangeLogDefaultTitleEnforcedMessage(translate, reportAction));
                } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE) {
                    Clipboard.setString(getPolicyChangeLogDefaultTitleMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION)) {
                    setClipboardMessage(getUnreportedTransactionMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
                    Clipboard.setString(getMarkedReimbursedMessage(reportAction));
                } else if (isReimbursementQueuedAction(reportAction)) {
                    Clipboard.setString(
                        getReimbursementQueuedActionMessage({reportAction, translate, formatPhoneNumber: formatPhoneNumberPhoneUtils, report, shouldUseShortDisplayName: false}),
                    );
                } else if (isActionableMentionWhisper(reportAction)) {
                    const mentionWhisperMessage = getActionableMentionWhisperMessage(translate, reportAction);
                    setClipboardMessage(mentionWhisperMessage);
                } else if (isActionableTrackExpense(reportAction)) {
                    setClipboardMessage(CONST.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE);
                } else if (isRenamedAction(reportAction)) {
                    setClipboardMessage(getRenamedAction(translate, reportAction, isExpenseReport(report)));
                } else if (
                    isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
                    isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
                    isMarkAsClosedAction(reportAction)
                ) {
                    const harvesting = !isMarkAsClosedAction(reportAction) ? (getOriginalMessage(reportAction)?.harvesting ?? false) : false;
                    if (harvesting) {
                        setClipboardMessage(translate('iou.automaticallySubmitted'));
                    } else {
                        Clipboard.setString(translate('iou.submitted', {memo: getOriginalMessage(reportAction)?.message}));
                    }
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
                    const {automaticAction} = getOriginalMessage(reportAction) ?? {};
                    if (automaticAction) {
                        setClipboardMessage(translate('iou.automaticallyApproved'));
                    } else {
                        Clipboard.setString(translate('iou.approvedMessage'));
                    }
                } else if (isUnapprovedAction(reportAction)) {
                    Clipboard.setString(translate('iou.unapproved'));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
                    const {automaticAction} = getOriginalMessage(reportAction) ?? {};
                    if (automaticAction) {
                        setClipboardMessage(translate('iou.automaticallyForwarded'));
                    } else {
                        Clipboard.setString(translate('iou.forwarded'));
                    }
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
                    Clipboard.setString(translate('iou.rejectedThisReport'));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
                    const displayMessage = translate('workspaceActions.upgradedWorkspace');
                    Clipboard.setString(displayMessage);
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE) {
                    const displayMessage = Parser.htmlToText(translate('workspaceActions.forcedCorporateUpgrade'));
                    Clipboard.setString(displayMessage);
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
                    Clipboard.setString(translate('workspaceActions.downgradedWorkspace'));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD) {
                    Clipboard.setString(translate('iou.heldExpense'));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
                    Clipboard.setString(translate('iou.unheldExpense'));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD) {
                    Clipboard.setString(translate('iou.reject.reportActions.rejectedExpense'));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED) {
                    Clipboard.setString(translate('iou.reject.reportActions.markedAsResolved'));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
                    Clipboard.setString(translate('iou.retracted'));
                } else if (isOldDotReportAction(reportAction)) {
                    const oldDotActionMessage = getMessageOfOldDotReportAction(translate, reportAction);
                    Clipboard.setString(oldDotActionMessage);
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION) {
                    const originalMessage = getOriginalMessage(reportAction) as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION>['originalMessage'];
                    Clipboard.setString(getDismissedViolationMessageText(translate, originalMessage));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
                    Clipboard.setString(translate('violations.resolvedDuplicates'));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
                    setClipboardMessage(getExportIntegrationMessageHTML(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
                    setClipboardMessage(getUpdateRoomDescriptionMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR) {
                    setClipboardMessage(getRoomAvatarUpdatedMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
                    setClipboardMessage(getPolicyChangeLogAddEmployeeMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
                    setClipboardMessage(getPolicyChangeLogUpdateEmployee(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
                    setClipboardMessage(getPolicyChangeLogDeleteMemberMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION) {
                    setClipboardMessage(getDeletedTransactionMessage(translate, reportAction));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
                    setClipboardMessage(translate('iou.reopened'));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
                    setClipboardMessage(getIntegrationSyncFailedMessage(translate, reportAction, report?.policyID, isTryNewDotNVPDismissed));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
                    setClipboardMessage(getCompanyCardConnectionBrokenMessage(translate, reportAction));
                } else if (isCardIssuedAction(reportAction)) {
                    setClipboardMessage(getCardIssuedMessage({reportAction, shouldRenderHTML: true, policyID: report?.policyID, expensifyCard: card, translate}));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION)) {
                    setClipboardMessage(getAddedConnectionMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
                    setClipboardMessage(getRemovedConnectionMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
                    setClipboardMessage(getTravelUpdateMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE)) {
                    setClipboardMessage(getUpdatedAuditRateMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE)) {
                    setClipboardMessage(getAddedApprovalRuleMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE)) {
                    setClipboardMessage(getDeletedApprovalRuleMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE)) {
                    setClipboardMessage(getUpdatedApprovalRuleMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD)) {
                    setClipboardMessage(getUpdatedManualApprovalThresholdMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
                    setClipboardMessage(getChangedApproverActionMessage(translate, reportAction));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION)) {
                    setClipboardMessage(getMovedTransactionMessage(translate, reportAction));
                } else if (isMovedAction(reportAction)) {
                    setClipboardMessage(getMovedActionMessage(translate, reportAction, originalReport));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT)) {
                    setClipboardMessage(getActionableCardFraudAlertMessage(translate, reportAction, getLocalDateFromDatetime));
                } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY) {
                    const displayMessage = getPolicyChangeMessage(translate, reportAction);
                    Clipboard.setString(displayMessage);
                } else if (isActionableJoinRequest(reportAction)) {
                    const displayMessage = getJoinRequestMessage(translate, reportAction);
                    Clipboard.setString(displayMessage);
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED)) {
                    setClipboardMessage(getDynamicExternalWorkflowRoutedMessage(reportAction, translate));
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CREATED) && isHarvestReport) {
                    const harvestReportName = getReportName(harvestReport);
                    const displayMessage = getHarvestCreatedExpenseReportMessage(harvestReport?.reportID, harvestReportName, translate);
                    setClipboardMessage(displayMessage);
                } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS)) {
                    const {originalID} = getOriginalMessage(reportAction) ?? {};
                    const reportName = getReportName(getReportOrDraftReport(originalID));
                    const displayMessage = getCreatedReportForUnapprovedTransactionsMessage(originalID, reportName, translate);
                    setClipboardMessage(displayMessage);
                } else if (content) {
                    setClipboardMessage(
                        content.replaceAll(/(<mention-user>)(.*?)(<\/mention-user>)/gi, (match, openTag: string, innerContent: string, closeTag: string): string => {
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
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyLink',
        icon: 'LinkCopy',
        successIcon: 'Checkmark',
        successTextTranslateKey: 'reportActionContextMenu.copied',
        shouldShow: ({type, reportAction, menuTarget}) => {
            const isAttachment = isReportActionAttachment(reportAction);

            // Only hide the copy link menu item when context menu is opened over img element.
            const isAttachmentTarget = menuTarget?.current && 'tagName' in menuTarget.current && menuTarget?.current.tagName === 'IMG' && isAttachment;
            const isDynamicWorkflowRoutedAction = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
            return type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && !isAttachmentTarget && !isMessageDeleted(reportAction) && !isDynamicWorkflowRoutedAction;
        },
        onPress: (closePopover, {reportAction, reportID}) => {
            const originalReportID = getOriginalReportID(reportID, reportAction);
            getEnvironmentURL().then((environmentURL) => {
                const reportActionID = reportAction?.reportActionID;
                Clipboard.setString(`${environmentURL}/r/${originalReportID}/${reportActionID}`);
            });
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'common.pin',
        icon: 'Pin',
        shouldShow: ({type, isPinnedChat}) => type === CONST.CONTEXT_MENU_TYPES.REPORT && !isPinnedChat,
        onPress: (closePopover, {reportID}) => {
            togglePinnedState(reportID, false);
            if (closePopover) {
                hideContextMenu(false, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.PIN,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'common.unPin',
        icon: 'Pin',
        shouldShow: ({type, isPinnedChat}) => type === CONST.CONTEXT_MENU_TYPES.REPORT && isPinnedChat,
        onPress: (closePopover, {reportID}) => {
            togglePinnedState(reportID, true);
            if (closePopover) {
                hideContextMenu(false, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.UNPIN,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.flagAsOffensive',
        icon: 'Flag',
        shouldShow: ({type, reportAction, isArchivedRoom, isChronosReport, reportID}) =>
            type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION &&
            canFlagReportAction(reportAction, reportID) &&
            !isArchivedRoom &&
            !isChronosReport &&
            reportAction?.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE,
        onPress: (closePopover, {reportID, reportAction}) => {
            if (!reportID) {
                return;
            }

            const activeRoute = Navigation.getActiveRoute();
            if (closePopover) {
                hideContextMenu(false, () => {
                    KeyboardUtils.dismiss().then(() => {
                        Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute));
                    });
                });
                return;
            }

            Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute));
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.FLAG_AS_OFFENSIVE,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'common.download',
        icon: 'Download',
        successTextTranslateKey: 'common.download',
        successIcon: 'Download',
        shouldShow: ({reportAction, isOffline}) => {
            const isAttachment = isReportActionAttachment(reportAction);
            const html = getActionHtml(reportAction);
            const isUploading = html.includes(CONST.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE);
            return isAttachment && !isUploading && !!reportAction?.reportActionID && !isMessageDeleted(reportAction) && !isOffline;
        },
        onPress: (closePopover, {reportAction, translate}) => {
            const html = getActionHtml(reportAction);
            const {originalFileName, sourceURL} = getAttachmentDetails(html);
            const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL ?? '');
            const sourceID = (sourceURL?.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
            setDownload(sourceID, true);
            const anchorRegex = CONST.REGEX_LINK_IN_ANCHOR;
            const isAnchorTag = anchorRegex.test(html);
            fileDownload(translate, sourceURLWithAuth, originalFileName ?? '', '', isAnchorTag && isMobileSafari()).then(() => setDownload(sourceID, false));
            if (closePopover) {
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }
        },
        getDescription: () => {},
        shouldDisable: (download) => download?.isDownloading ?? false,
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.DOWNLOAD,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyOnyxData',
        icon: 'Copy',
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: 'Checkmark',
        shouldShow: ({type, isProduction}) => type === CONST.CONTEXT_MENU_TYPES.REPORT && !isProduction,
        onPress: (closePopover, {report}) => {
            Clipboard.setString(JSON.stringify(report, null, 4));
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_ONYX_DATA,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'debug.debug',
        icon: 'Bug',
        shouldShow: ({type, isDebugModeEnabled}) => [CONST.CONTEXT_MENU_TYPES.REPORT_ACTION, CONST.CONTEXT_MENU_TYPES.REPORT].some((value) => value === type) && !!isDebugModeEnabled,
        onPress: (closePopover, {reportID, reportAction}) => {
            if (reportAction) {
                Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION.getRoute(reportID, reportAction.reportActionID));
            } else {
                Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(reportID));
            }
            hideContextMenu(false, ReportActionComposeFocusManager.focus);
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.DEBUG,
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'common.delete',
        icon: 'Trashcan',
        shouldShow: ({type, reportAction, isArchivedRoom, isChronosReport, reportID: reportIDParam, moneyRequestAction, iouTransaction, transactions, childReportActions}) => {
            // Until deleting parent threads is supported in FE, we will prevent the user from deleting a thread parent
            let reportID = reportIDParam;

            if (isMoneyRequestAction(moneyRequestAction)) {
                reportID = getOriginalMessage(moneyRequestAction)?.IOUReportID;
            } else if (isReportPreviewActionReportActionsUtils(reportAction)) {
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
        onPress: (closePopover, {reportID: reportIDParam, reportAction, moneyRequestAction}) => {
            const iouReportID = isMoneyRequestAction(moneyRequestAction) ? getOriginalMessage(moneyRequestAction)?.IOUReportID : undefined;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const reportID = iouReportID && Number(iouReportID) !== 0 ? iouReportID : reportIDParam;
            if (closePopover) {
                // Hide popover, then call showDeleteConfirmModal
                hideContextMenu(false, () => showDeleteModal(reportID, moneyRequestAction ?? reportAction));
                return;
            }

            // No popover to hide, call showDeleteConfirmModal immediately
            showDeleteModal(reportID, moneyRequestAction ?? reportAction);
        },
        getDescription: () => {},
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.DELETE,
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.menu',
        icon: 'ThreeDots',
        shouldShow: ({isMini}) => isMini,
        onPress: (closePopover, {openOverflowMenu, event, openContextMenu, anchorRef}) => {
            openOverflowMenu(event as GestureResponderEvent | MouseEvent, anchorRef ?? {current: null});
            openContextMenu();
        },
        getDescription: () => {},
        shouldPreventDefaultFocusOnPress: false,
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MENU,
    },
];

const restrictedReadOnlyActions = new Set<TranslationPaths>([
    'reportActionContextMenu.replyInThread',
    'reportActionContextMenu.editAction',
    'reportActionContextMenu.joinThread',
    'common.delete',
]);

const RestrictedReadOnlyContextMenuActions: ContextMenuAction[] = ContextMenuActions.filter(
    (action) => 'textTranslateKey' in action && restrictedReadOnlyActions.has(action.textTranslateKey),
);

export {RestrictedReadOnlyContextMenuActions};
export default ContextMenuActions;
export type {ContextMenuActionPayload, ContextMenuAction};
