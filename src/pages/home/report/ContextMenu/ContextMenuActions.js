"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestrictedReadOnlyContextMenuActions = void 0;
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var MiniQuickEmojiReactions_1 = require("@components/Reactions/MiniQuickEmojiReactions");
var QuickEmojiReactions_1 = require("@components/Reactions/QuickEmojiReactions");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var Browser_1 = require("@libs/Browser");
var Clipboard_1 = require("@libs/Clipboard");
var EmailUtils_1 = require("@libs/EmailUtils");
var Environment_1 = require("@libs/Environment/Environment");
var fileDownload_1 = require("@libs/fileDownload");
var getAttachmentDetails_1 = require("@libs/fileDownload/getAttachmentDetails");
var Localize_1 = require("@libs/Localize");
var ModifiedExpenseMessage_1 = require("@libs/ModifiedExpenseMessage");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionComposeFocusManager_1 = require("@libs/ReportActionComposeFocusManager");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TaskUtils_1 = require("@libs/TaskUtils");
var Download_1 = require("@userActions/Download");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var keyboard_1 = require("@src/utils/keyboard");
var ReportActionContextMenu_1 = require("./ReportActionContextMenu");
/** Gets the HTML version of the message in an action */
function getActionHtml(reportAction) {
    var _a, _b, _c, _d;
    var message = Array.isArray(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) ? ((_b = (_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) === null || _a === void 0 ? void 0 : _a.at(-1)) !== null && _b !== void 0 ? _b : null) : ((_c = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) !== null && _c !== void 0 ? _c : null);
    return (_d = message === null || message === void 0 ? void 0 : message.html) !== null && _d !== void 0 ? _d : '';
}
/** Sets the HTML string to Clipboard */
function setClipboardMessage(content) {
    if (!content) {
        return;
    }
    if (!Clipboard_1.default.canSetHtml()) {
        Clipboard_1.default.setString(Parser_1.default.htmlToMarkdown(content));
    }
    else {
        // Use markdown format text for the plain text(clipboard type "text/plain") to ensure consistency across all platforms.
        // More info: https://github.com/Expensify/App/issues/53718
        var markdownText = Parser_1.default.htmlToMarkdown(content);
        Clipboard_1.default.setHtml(content, markdownText);
    }
}
// A list of all the context actions in this menu.
var ContextMenuActions = [
    {
        isAnonymousAction: false,
        shouldShow: function (_a) {
            var type = _a.type, reportAction = _a.reportAction;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION && !!reportAction && 'message' in reportAction && !(0, ReportActionsUtils_1.isMessageDeleted)(reportAction);
        },
        renderContent: function (closePopover, _a) {
            var reportID = _a.reportID, reportAction = _a.reportAction, closeManually = _a.close, openContextMenu = _a.openContextMenu, setIsEmojiPickerActive = _a.setIsEmojiPickerActive;
            var isMini = !closePopover;
            var closeContextMenu = function (onHideCallback) {
                if (isMini) {
                    closeManually();
                    if (onHideCallback) {
                        onHideCallback();
                    }
                }
                else {
                    (0, ReportActionContextMenu_1.hideContextMenu)(false, onHideCallback);
                }
            };
            var toggleEmojiAndCloseMenu = function (emoji, existingReactions) {
                (0, Report_1.toggleEmojiReaction)(reportID, reportAction, emoji, existingReactions);
                closeContextMenu();
                setIsEmojiPickerActive === null || setIsEmojiPickerActive === void 0 ? void 0 : setIsEmojiPickerActive(false);
            };
            if (isMini) {
                return (<MiniQuickEmojiReactions_1.default key="MiniQuickEmojiReactions" onEmojiSelected={toggleEmojiAndCloseMenu} onPressOpenPicker={function () {
                        openContextMenu();
                        setIsEmojiPickerActive === null || setIsEmojiPickerActive === void 0 ? void 0 : setIsEmojiPickerActive(true);
                    }} onEmojiPickerClosed={function () {
                        closeContextMenu();
                        setIsEmojiPickerActive === null || setIsEmojiPickerActive === void 0 ? void 0 : setIsEmojiPickerActive(false);
                    }} reportActionID={reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID} reportAction={reportAction}/>);
            }
            return (<QuickEmojiReactions_1.default key="BaseQuickEmojiReactions" closeContextMenu={closeContextMenu} onEmojiSelected={toggleEmojiAndCloseMenu} reportActionID={reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID} reportAction={reportAction} setIsEmojiPickerActive={setIsEmojiPickerActive}/>);
        },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.replyInThread',
        icon: Expensicons.ChatBubbleReply,
        shouldShow: function (_a) {
            var type = _a.type, reportAction = _a.reportAction, reportID = _a.reportID, isThreadReportParentAction = _a.isThreadReportParentAction, isArchivedRoom = _a.isArchivedRoom;
            if (type !== CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION || !reportID) {
                return false;
            }
            return !(0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, isThreadReportParentAction, isArchivedRoom);
        },
        onPress: function (closePopover, _a) {
            var reportAction = _a.reportAction, reportID = _a.reportID;
            var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, reportAction);
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(false, function () {
                    keyboard_1.default.dismiss().then(function () {
                        (0, Report_1.navigateToAndOpenChildReport)(reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID, reportAction, originalReportID);
                    });
                });
                return;
            }
            (0, Report_1.navigateToAndOpenChildReport)(reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID, reportAction, originalReportID);
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.markAsUnread',
        icon: Expensicons.ChatBubbleUnread,
        successIcon: Expensicons.Checkmark,
        shouldShow: function (_a) {
            var type = _a.type, isUnreadChat = _a.isUnreadChat;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION || (type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT && !isUnreadChat);
        },
        onPress: function (closePopover, _a) {
            var reportAction = _a.reportAction, reportID = _a.reportID;
            (0, Report_1.markCommentAsUnread)(reportID, reportAction);
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(true, ReportActionComposeFocusManager_1.default.focus);
            }
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.markAsRead',
        icon: Expensicons.Mail,
        successIcon: Expensicons.Checkmark,
        shouldShow: function (_a) {
            var type = _a.type, isUnreadChat = _a.isUnreadChat;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT && isUnreadChat;
        },
        onPress: function (closePopover, _a) {
            var reportID = _a.reportID;
            (0, Report_1.readNewestAction)(reportID, true);
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(true, ReportActionComposeFocusManager_1.default.focus);
            }
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.editAction',
        icon: Expensicons.Pencil,
        shouldShow: function (_a) {
            var type = _a.type, reportAction = _a.reportAction, isArchivedRoom = _a.isArchivedRoom, isChronosReport = _a.isChronosReport;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION && (0, ReportUtils_1.canEditReportAction)(reportAction) && !isArchivedRoom && !isChronosReport;
        },
        onPress: function (closePopover, _a) {
            var reportID = _a.reportID, reportAction = _a.reportAction, draftMessage = _a.draftMessage;
            if ((0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction)) {
                (0, ReportActionContextMenu_1.hideContextMenu)(false);
                var childReportID = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID;
                (0, Report_1.openReport)(childReportID);
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(childReportID));
                return;
            }
            var editAction = function () {
                if (!draftMessage) {
                    (0, Report_1.saveReportActionDraft)(reportID, reportAction, Parser_1.default.htmlToMarkdown(getActionHtml(reportAction)));
                }
                else {
                    (0, Report_1.deleteReportActionDraft)(reportID, reportAction);
                }
            };
            if (closePopover) {
                // Hide popover, then call editAction
                (0, ReportActionContextMenu_1.hideContextMenu)(false, editAction);
                return;
            }
            // No popover to hide, call editAction immediately
            editAction();
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'iou.unhold',
        icon: Expensicons.Stopwatch,
        shouldShow: function (_a) {
            var type = _a.type, moneyRequestAction = _a.moneyRequestAction, areHoldRequirementsMet = _a.areHoldRequirementsMet;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION && areHoldRequirementsMet && (0, ReportUtils_1.canHoldUnholdReportAction)(moneyRequestAction).canUnholdRequest;
        },
        onPress: function (closePopover, _a) {
            var moneyRequestAction = _a.moneyRequestAction;
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(false, function () { return (0, ReportUtils_1.changeMoneyRequestHoldStatus)(moneyRequestAction); });
                return;
            }
            // No popover to hide, call changeMoneyRequestHoldStatus immediately
            (0, ReportUtils_1.changeMoneyRequestHoldStatus)(moneyRequestAction);
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'iou.hold',
        icon: Expensicons.Stopwatch,
        shouldShow: function (_a) {
            var type = _a.type, moneyRequestAction = _a.moneyRequestAction, areHoldRequirementsMet = _a.areHoldRequirementsMet;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION && areHoldRequirementsMet && (0, ReportUtils_1.canHoldUnholdReportAction)(moneyRequestAction).canHoldRequest;
        },
        onPress: function (closePopover, _a) {
            var moneyRequestAction = _a.moneyRequestAction;
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(false, function () { return (0, ReportUtils_1.changeMoneyRequestHoldStatus)(moneyRequestAction); });
                return;
            }
            // No popover to hide, call changeMoneyRequestHoldStatus immediately
            (0, ReportUtils_1.changeMoneyRequestHoldStatus)(moneyRequestAction);
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.joinThread',
        icon: Expensicons.Bell,
        shouldShow: function (_a) {
            var reportAction = _a.reportAction, isArchivedRoom = _a.isArchivedRoom, isThreadReportParentAction = _a.isThreadReportParentAction;
            var childReportNotificationPreference = (0, ReportUtils_1.getChildReportNotificationPreference)(reportAction);
            var isDeletedAction = (0, ReportActionsUtils_1.isDeletedAction)(reportAction);
            var shouldDisplayThreadReplies = (0, ReportUtils_1.shouldDisplayThreadReplies)(reportAction, isThreadReportParentAction);
            var subscribed = childReportNotificationPreference !== 'hidden';
            var isWhisperAction = (0, ReportActionsUtils_1.isWhisperAction)(reportAction) || (0, ReportActionsUtils_1.isActionableTrackExpense)(reportAction);
            var isExpenseReportAction = (0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) || (0, ReportActionsUtils_1.isReportPreviewAction)(reportAction);
            var isTaskAction = (0, ReportActionsUtils_1.isCreatedTaskReportAction)(reportAction);
            return (!subscribed &&
                !isWhisperAction &&
                !isTaskAction &&
                !isExpenseReportAction &&
                !isThreadReportParentAction &&
                (shouldDisplayThreadReplies || (!isDeletedAction && !isArchivedRoom)));
        },
        onPress: function (closePopover, _a) {
            var reportAction = _a.reportAction, reportID = _a.reportID;
            var childReportNotificationPreference = (0, ReportUtils_1.getChildReportNotificationPreference)(reportAction);
            var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, reportAction);
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(false, function () {
                    ReportActionComposeFocusManager_1.default.focus();
                    (0, Report_1.toggleSubscribeToChildReport)(reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID, reportAction, originalReportID, childReportNotificationPreference);
                });
                return;
            }
            ReportActionComposeFocusManager_1.default.focus();
            (0, Report_1.toggleSubscribeToChildReport)(reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID, reportAction, originalReportID, childReportNotificationPreference);
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyURLToClipboard',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: function (_a) {
            var type = _a.type;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.LINK;
        },
        onPress: function (closePopover, _a) {
            var selection = _a.selection;
            Clipboard_1.default.setString(selection);
            (0, ReportActionContextMenu_1.hideContextMenu)(true, ReportActionComposeFocusManager_1.default.focus);
        },
        getDescription: function (selection) { return selection; },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyToClipboard',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: function (_a) {
            var type = _a.type;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.TEXT;
        },
        onPress: function (closePopover, _a) {
            var selection = _a.selection;
            Clipboard_1.default.setString(selection);
            (0, ReportActionContextMenu_1.hideContextMenu)(true, ReportActionComposeFocusManager_1.default.focus);
        },
        getDescription: function () { return undefined; },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyEmailToClipboard',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: function (_a) {
            var type = _a.type;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.EMAIL;
        },
        onPress: function (closePopover, _a) {
            var selection = _a.selection;
            Clipboard_1.default.setString(EmailUtils_1.default.trimMailTo(selection));
            (0, ReportActionContextMenu_1.hideContextMenu)(true, ReportActionComposeFocusManager_1.default.focus);
        },
        getDescription: function (selection) { return EmailUtils_1.default.prefixMailSeparatorsWithBreakOpportunities(EmailUtils_1.default.trimMailTo(selection !== null && selection !== void 0 ? selection : '')); },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyToClipboard',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: function (_a) {
            var type = _a.type, reportAction = _a.reportAction;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION && !(0, ReportActionsUtils_1.isReportActionAttachment)(reportAction) && !(0, ReportActionsUtils_1.isMessageDeleted)(reportAction) && !(0, ReportActionsUtils_1.isTripPreview)(reportAction);
        },
        // If return value is true, we switch the `text` and `icon` on
        // `ContextMenuItem` with `successText` and `successIcon` which will fall back to
        // the `text` and `icon`
        onPress: function (closePopover, _a) {
            var _b, _c, _d, _e, _f, _g;
            var reportAction = _a.reportAction, transaction = _a.transaction, selection = _a.selection, report = _a.report, reportID = _a.reportID, card = _a.card;
            var isReportPreviewAction = (0, ReportActionsUtils_1.isReportPreviewAction)(reportAction);
            var messageHtml = getActionHtml(reportAction);
            var messageText = (0, ReportActionsUtils_1.getReportActionMessageText)(reportAction);
            var isAttachment = (0, ReportActionsUtils_1.isReportActionAttachment)(reportAction);
            if (!isAttachment) {
                var content = selection || messageHtml;
                if (isReportPreviewAction) {
                    var iouReportID = (0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(reportAction);
                    var displayMessage = (0, ReportUtils_1.getReportPreviewMessage)(iouReportID, reportAction);
                    Clipboard_1.default.setString(displayMessage);
                }
                else if ((0, ReportActionsUtils_1.isTaskAction)(reportAction)) {
                    var _h = (0, TaskUtils_1.getTaskReportActionMessage)(reportAction), text = _h.text, html = _h.html;
                    var displayMessage = html !== null && html !== void 0 ? html : text;
                    setClipboardMessage(displayMessage);
                }
                else if ((0, ReportActionsUtils_1.isModifiedExpenseAction)(reportAction)) {
                    var modifyExpenseMessage = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: reportID, reportAction: reportAction });
                    Clipboard_1.default.setString(modifyExpenseMessage);
                }
                else if ((0, ReportActionsUtils_1.isReimbursementDeQueuedOrCanceledAction)(reportAction)) {
                    var expenseReportID = ((_b = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) !== null && _b !== void 0 ? _b : {}).expenseReportID;
                    var displayMessage = (0, ReportUtils_1.getReimbursementDeQueuedOrCanceledActionMessage)(reportAction, expenseReportID);
                    Clipboard_1.default.setString(displayMessage);
                }
                else if ((0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction)) {
                    var displayMessage = (0, ReportUtils_1.getIOUReportActionDisplayMessage)(reportAction, transaction);
                    if (displayMessage === Parser_1.default.htmlToText(displayMessage)) {
                        Clipboard_1.default.setString(displayMessage);
                    }
                    else {
                        setClipboardMessage(displayMessage);
                    }
                }
                else if ((0, ReportActionsUtils_1.isCreatedTaskReportAction)(reportAction)) {
                    var taskPreviewMessage = (0, TaskUtils_1.getTaskCreatedMessage)(reportAction, true);
                    Clipboard_1.default.setString(taskPreviewMessage);
                }
                else if ((0, ReportActionsUtils_1.isMemberChangeAction)(reportAction)) {
                    var logMessage = (_c = (0, ReportActionsUtils_1.getMemberChangeMessageFragment)(reportAction, ReportUtils_1.getReportName).html) !== null && _c !== void 0 ? _c : '';
                    setClipboardMessage(logMessage);
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
                    Clipboard_1.default.setString(expensify_common_1.Str.htmlDecode((0, ReportUtils_1.getWorkspaceNameUpdatedMessage)(reportAction)));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceDescriptionUpdatedMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceCurrencyUpdateMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceFrequencyUpdateMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY ||
                    (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY ||
                    (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY ||
                    (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceCategoryUpdateMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME) {
                    Clipboard_1.default.setString((0, PolicyUtils_1.getCleanedTagName)((0, ReportActionsUtils_1.getTagListNameUpdatedMessage)(reportAction)));
                }
                else if ((0, ReportActionsUtils_1.isTagModificationAction)(reportAction.actionName)) {
                    Clipboard_1.default.setString((0, PolicyUtils_1.getCleanedTagName)((0, ReportActionsUtils_1.getWorkspaceTagUpdateMessage)(reportAction)));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceCustomUnitUpdatedMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceCustomUnitRateAddedMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceCustomUnitRateUpdatedMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceCustomUnitRateDeletedMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceReportFieldAddMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceReportFieldUpdateMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getWorkspaceReportFieldDeleteMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
                    setClipboardMessage((0, ReportActionsUtils_1.getWorkspaceUpdateFieldMessage)(reportAction));
                }
                else if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getPolicyChangeLogMaxExpenseAmountNoReceiptMessage)(reportAction));
                }
                else if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getPolicyChangeLogMaxExpenseAmountMessage)(reportAction));
                }
                else if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getPolicyChangeLogDefaultBillableMessage)(reportAction));
                }
                else if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED) {
                    Clipboard_1.default.setString((0, ReportActionsUtils_1.getPolicyChangeLogDefaultTitleEnforcedMessage)(reportAction));
                }
                else if ((0, ReportActionsUtils_1.isReimbursementQueuedAction)(reportAction)) {
                    Clipboard_1.default.setString((0, ReportUtils_1.getReimbursementQueuedActionMessage)({ reportAction: reportAction, reportOrID: reportID, shouldUseShortDisplayName: false }));
                }
                else if ((0, ReportActionsUtils_1.isActionableMentionWhisper)(reportAction)) {
                    var mentionWhisperMessage = (0, ReportActionsUtils_1.getActionableMentionWhisperMessage)(reportAction);
                    setClipboardMessage(mentionWhisperMessage);
                }
                else if ((0, ReportActionsUtils_1.isActionableTrackExpense)(reportAction)) {
                    setClipboardMessage(CONST_1.default.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE);
                }
                else if ((0, ReportActionsUtils_1.isRenamedAction)(reportAction)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getRenamedAction)(reportAction, (0, ReportUtils_1.isExpenseReport)(report)));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED) ||
                    (0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
                    (0, ReportActionsUtils_1.isMarkAsClosedAction)(reportAction)) {
                    var harvesting = !(0, ReportActionsUtils_1.isMarkAsClosedAction)(reportAction) ? ((_e = (_d = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _d === void 0 ? void 0 : _d.harvesting) !== null && _e !== void 0 ? _e : false) : false;
                    if (harvesting) {
                        setClipboardMessage((0, Localize_1.translateLocal)('iou.automaticallySubmitted'));
                    }
                    else {
                        Clipboard_1.default.setString((0, Localize_1.translateLocal)('iou.submitted'));
                    }
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED)) {
                    var automaticAction = ((_f = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) !== null && _f !== void 0 ? _f : {}).automaticAction;
                    if (automaticAction) {
                        setClipboardMessage((0, Localize_1.translateLocal)('iou.automaticallyApproved'));
                    }
                    else {
                        Clipboard_1.default.setString((0, Localize_1.translateLocal)('iou.approvedMessage'));
                    }
                }
                else if ((0, ReportActionsUtils_1.isUnapprovedAction)(reportAction)) {
                    Clipboard_1.default.setString((0, Localize_1.translateLocal)('iou.unapproved'));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.FORWARDED)) {
                    var automaticAction = ((_g = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) !== null && _g !== void 0 ? _g : {}).automaticAction;
                    if (automaticAction) {
                        setClipboardMessage((0, Localize_1.translateLocal)('iou.automaticallyForwarded'));
                    }
                    else {
                        Clipboard_1.default.setString((0, Localize_1.translateLocal)('iou.forwarded'));
                    }
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.REJECTED) {
                    var displayMessage = (0, ReportUtils_1.getRejectedReportMessage)();
                    Clipboard_1.default.setString(displayMessage);
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
                    var displayMessage = (0, ReportUtils_1.getUpgradeWorkspaceMessage)();
                    Clipboard_1.default.setString(displayMessage);
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
                    var displayMessage = (0, ReportUtils_1.getDowngradeWorkspaceMessage)();
                    Clipboard_1.default.setString(displayMessage);
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.HOLD) {
                    Clipboard_1.default.setString((0, Localize_1.translateLocal)('iou.heldExpense'));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.UNHOLD) {
                    Clipboard_1.default.setString((0, Localize_1.translateLocal)('iou.unheldExpense'));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.RETRACTED) {
                    Clipboard_1.default.setString((0, Localize_1.translateLocal)('iou.retracted'));
                }
                else if ((0, ReportActionsUtils_1.isOldDotReportAction)(reportAction)) {
                    var oldDotActionMessage = (0, ReportActionsUtils_1.getMessageOfOldDotReportAction)(reportAction);
                    Clipboard_1.default.setString(oldDotActionMessage);
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION) {
                    var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction);
                    var reason = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.reason;
                    var violationName = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.violationName;
                    Clipboard_1.default.setString((0, Localize_1.translateLocal)("violationDismissal.".concat(violationName, ".").concat(reason)));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
                    Clipboard_1.default.setString((0, Localize_1.translateLocal)('violations.resolvedDuplicates'));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
                    setClipboardMessage((0, ReportActionsUtils_1.getExportIntegrationMessageHTML)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
                    setClipboardMessage((0, ReportActionsUtils_1.getUpdateRoomDescriptionMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
                    setClipboardMessage((0, ReportActionsUtils_1.getPolicyChangeLogAddEmployeeMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
                    setClipboardMessage((0, ReportActionsUtils_1.getPolicyChangeLogUpdateEmployee)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
                    setClipboardMessage((0, ReportActionsUtils_1.getPolicyChangeLogDeleteMemberMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION) {
                    setClipboardMessage((0, ReportUtils_1.getDeletedTransactionMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.REOPENED) {
                    setClipboardMessage((0, ReportActionsUtils_1.getReopenedMessage)());
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getIntegrationSyncFailedMessage)(reportAction, report === null || report === void 0 ? void 0 : report.policyID));
                }
                else if ((0, ReportActionsUtils_1.isCardIssuedAction)(reportAction)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getCardIssuedMessage)({ reportAction: reportAction, shouldRenderHTML: true, policyID: report === null || report === void 0 ? void 0 : report.policyID, card: card }));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getAddedConnectionMessage)(reportAction));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getRemovedConnectionMessage)(reportAction));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getTravelUpdateMessage)(reportAction));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getUpdatedAuditRateMessage)(reportAction));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getAddedApprovalRuleMessage)(reportAction));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getDeletedApprovalRuleMessage)(reportAction));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getUpdatedApprovalRuleMessage)(reportAction));
                }
                else if ((0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD)) {
                    setClipboardMessage((0, ReportActionsUtils_1.getUpdatedManualApprovalThresholdMessage)(reportAction));
                }
                else if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.CHANGE_POLICY) {
                    var displayMessage = (0, ReportUtils_1.getPolicyChangeMessage)(reportAction);
                    Clipboard_1.default.setString(displayMessage);
                }
                else if ((0, ReportActionsUtils_1.isActionableJoinRequest)(reportAction)) {
                    var displayMessage = (0, ReportActionsUtils_1.getJoinRequestMessage)(reportAction);
                    Clipboard_1.default.setString(displayMessage);
                }
                else if (content) {
                    setClipboardMessage(content.replace(/(<mention-user>)(.*?)(<\/mention-user>)/gi, function (match, openTag, innerContent, closeTag) {
                        var modifiedContent = expensify_common_1.Str.removeSMSDomain(innerContent) || '';
                        return openTag + modifiedContent + closeTag || '';
                    }));
                }
                else if (messageText) {
                    Clipboard_1.default.setString(messageText);
                }
            }
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(true, ReportActionComposeFocusManager_1.default.focus);
            }
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyLink',
        icon: Expensicons.LinkCopy,
        successIcon: Expensicons.Checkmark,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        shouldShow: function (_a) {
            var type = _a.type, reportAction = _a.reportAction, menuTarget = _a.menuTarget;
            var isAttachment = (0, ReportActionsUtils_1.isReportActionAttachment)(reportAction);
            // Only hide the copy link menu item when context menu is opened over img element.
            var isAttachmentTarget = (menuTarget === null || menuTarget === void 0 ? void 0 : menuTarget.current) && 'tagName' in menuTarget.current && (menuTarget === null || menuTarget === void 0 ? void 0 : menuTarget.current.tagName) === 'IMG' && isAttachment;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION && !isAttachmentTarget && !(0, ReportActionsUtils_1.isMessageDeleted)(reportAction);
        },
        onPress: function (closePopover, _a) {
            var reportAction = _a.reportAction, reportID = _a.reportID;
            var originalReportID = (0, ReportUtils_1.getOriginalReportID)(reportID, reportAction);
            (0, Environment_1.getEnvironmentURL)().then(function (environmentURL) {
                var reportActionID = reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID;
                Clipboard_1.default.setString("".concat(environmentURL, "/r/").concat(originalReportID, "/").concat(reportActionID));
            });
            (0, ReportActionContextMenu_1.hideContextMenu)(true, ReportActionComposeFocusManager_1.default.focus);
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'common.pin',
        icon: Expensicons.Pin,
        shouldShow: function (_a) {
            var type = _a.type, isPinnedChat = _a.isPinnedChat;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT && !isPinnedChat;
        },
        onPress: function (closePopover, _a) {
            var reportID = _a.reportID;
            (0, Report_1.togglePinnedState)(reportID, false);
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(false, ReportActionComposeFocusManager_1.default.focus);
            }
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'common.unPin',
        icon: Expensicons.Pin,
        shouldShow: function (_a) {
            var type = _a.type, isPinnedChat = _a.isPinnedChat;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT && isPinnedChat;
        },
        onPress: function (closePopover, _a) {
            var reportID = _a.reportID;
            (0, Report_1.togglePinnedState)(reportID, true);
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(false, ReportActionComposeFocusManager_1.default.focus);
            }
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.flagAsOffensive',
        icon: Expensicons.Flag,
        shouldShow: function (_a) {
            var type = _a.type, reportAction = _a.reportAction, isArchivedRoom = _a.isArchivedRoom, isChronosReport = _a.isChronosReport, reportID = _a.reportID;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION &&
                (0, ReportUtils_1.canFlagReportAction)(reportAction, reportID) &&
                !isArchivedRoom &&
                !isChronosReport &&
                (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID) !== CONST_1.default.ACCOUNT_ID.CONCIERGE;
        },
        onPress: function (closePopover, _a) {
            var reportID = _a.reportID, reportAction = _a.reportAction;
            if (!reportID) {
                return;
            }
            var activeRoute = Navigation_1.default.getActiveRoute();
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(false, function () {
                    keyboard_1.default.dismiss().then(function () {
                        Navigation_1.default.navigate(ROUTES_1.default.FLAG_COMMENT.getRoute(reportID, reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID, activeRoute));
                    });
                });
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.FLAG_COMMENT.getRoute(reportID, reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID, activeRoute));
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'common.download',
        icon: Expensicons.Download,
        successTextTranslateKey: 'common.download',
        successIcon: Expensicons.Download,
        shouldShow: function (_a) {
            var reportAction = _a.reportAction, isOffline = _a.isOffline;
            var isAttachment = (0, ReportActionsUtils_1.isReportActionAttachment)(reportAction);
            var html = getActionHtml(reportAction);
            var isUploading = html.includes(CONST_1.default.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE);
            return isAttachment && !isUploading && !!(reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID) && !(0, ReportActionsUtils_1.isMessageDeleted)(reportAction) && !isOffline;
        },
        onPress: function (closePopover, _a) {
            var _b;
            var reportAction = _a.reportAction;
            var html = getActionHtml(reportAction);
            var _c = (0, getAttachmentDetails_1.default)(html), originalFileName = _c.originalFileName, sourceURL = _c.sourceURL;
            var sourceURLWithAuth = (0, addEncryptedAuthTokenToURL_1.default)(sourceURL !== null && sourceURL !== void 0 ? sourceURL : '');
            var sourceID = ((_b = sourceURL === null || sourceURL === void 0 ? void 0 : sourceURL.match(CONST_1.default.REGEX.ATTACHMENT_ID)) !== null && _b !== void 0 ? _b : [])[1];
            (0, Download_1.setDownload)(sourceID, true);
            var anchorRegex = CONST_1.default.REGEX_LINK_IN_ANCHOR;
            var isAnchorTag = anchorRegex.test(html);
            (0, fileDownload_1.default)(sourceURLWithAuth, originalFileName !== null && originalFileName !== void 0 ? originalFileName : '', '', isAnchorTag && (0, Browser_1.isMobileSafari)()).then(function () { return (0, Download_1.setDownload)(sourceID, false); });
            if (closePopover) {
                (0, ReportActionContextMenu_1.hideContextMenu)(true, ReportActionComposeFocusManager_1.default.focus);
            }
        },
        getDescription: function () { },
        shouldDisable: function (download) { var _a; return (_a = download === null || download === void 0 ? void 0 : download.isDownloading) !== null && _a !== void 0 ? _a : false; },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.copyOnyxData',
        icon: Expensicons.Copy,
        successTextTranslateKey: 'reportActionContextMenu.copied',
        successIcon: Expensicons.Checkmark,
        shouldShow: function (_a) {
            var type = _a.type, isProduction = _a.isProduction;
            return type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT && !isProduction;
        },
        onPress: function (closePopover, _a) {
            var report = _a.report;
            Clipboard_1.default.setString(JSON.stringify(report, null, 4));
            (0, ReportActionContextMenu_1.hideContextMenu)(true, ReportActionComposeFocusManager_1.default.focus);
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'debug.debug',
        icon: Expensicons.Bug,
        shouldShow: function (_a) {
            var type = _a.type, account = _a.account;
            return [CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION, CONST_1.default.CONTEXT_MENU_TYPES.REPORT].some(function (value) { return value === type; }) && !!(account === null || account === void 0 ? void 0 : account.isDebugModeEnabled);
        },
        onPress: function (closePopover, _a) {
            var reportID = _a.reportID, reportAction = _a.reportAction;
            if (reportAction) {
                Navigation_1.default.navigate(ROUTES_1.default.DEBUG_REPORT_ACTION.getRoute(reportID, reportAction.reportActionID));
            }
            else {
                Navigation_1.default.navigate(ROUTES_1.default.DEBUG_REPORT.getRoute(reportID));
            }
            (0, ReportActionContextMenu_1.hideContextMenu)(false, ReportActionComposeFocusManager_1.default.focus);
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: false,
        textTranslateKey: 'reportActionContextMenu.deleteAction',
        icon: Expensicons.Trashcan,
        shouldShow: function (_a) {
            var _b;
            var type = _a.type, reportAction = _a.reportAction, isArchivedRoom = _a.isArchivedRoom, isChronosReport = _a.isChronosReport, reportID = _a.reportID, moneyRequestAction = _a.moneyRequestAction, iouTransaction = _a.iouTransaction;
            // Until deleting parent threads is supported in FE, we will prevent the user from deleting a thread parent
            return !!reportID &&
                type === CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION &&
                (0, ReportUtils_1.canDeleteReportAction)(moneyRequestAction !== null && moneyRequestAction !== void 0 ? moneyRequestAction : reportAction, (0, ReportActionsUtils_1.isMoneyRequestAction)(moneyRequestAction) ? (_b = (0, ReportActionsUtils_1.getOriginalMessage)(moneyRequestAction)) === null || _b === void 0 ? void 0 : _b.IOUReportID : reportID, iouTransaction) &&
                !isArchivedRoom &&
                !isChronosReport &&
                !(0, ReportActionsUtils_1.isMessageDeleted)(reportAction);
        },
        onPress: function (closePopover, _a) {
            var _b;
            var reportIDParam = _a.reportID, reportAction = _a.reportAction, moneyRequestAction = _a.moneyRequestAction;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            var reportID = (0, ReportActionsUtils_1.isMoneyRequestAction)(moneyRequestAction) ? ((_b = (0, ReportActionsUtils_1.getOriginalMessage)(moneyRequestAction)) === null || _b === void 0 ? void 0 : _b.IOUReportID) || reportIDParam : reportIDParam;
            if (closePopover) {
                // Hide popover, then call showDeleteConfirmModal
                (0, ReportActionContextMenu_1.hideContextMenu)(false, function () { return (0, ReportActionContextMenu_1.showDeleteModal)(reportID, moneyRequestAction !== null && moneyRequestAction !== void 0 ? moneyRequestAction : reportAction); });
                return;
            }
            // No popover to hide, call showDeleteConfirmModal immediately
            (0, ReportActionContextMenu_1.showDeleteModal)(reportID, moneyRequestAction !== null && moneyRequestAction !== void 0 ? moneyRequestAction : reportAction);
        },
        getDescription: function () { },
    },
    {
        isAnonymousAction: true,
        textTranslateKey: 'reportActionContextMenu.menu',
        icon: Expensicons.ThreeDots,
        shouldShow: function (_a) {
            var isMini = _a.isMini;
            return isMini;
        },
        onPress: function (closePopover, _a) {
            var openOverflowMenu = _a.openOverflowMenu, event = _a.event, openContextMenu = _a.openContextMenu, anchorRef = _a.anchorRef;
            openOverflowMenu(event, anchorRef !== null && anchorRef !== void 0 ? anchorRef : { current: null });
            openContextMenu();
        },
        getDescription: function () { },
        shouldPreventDefaultFocusOnPress: false,
    },
];
var restrictedReadOnlyActions = [
    'reportActionContextMenu.replyInThread',
    'reportActionContextMenu.editAction',
    'reportActionContextMenu.joinThread',
    'reportActionContextMenu.deleteAction',
];
var RestrictedReadOnlyContextMenuActions = ContextMenuActions.filter(function (action) { return 'textTranslateKey' in action && restrictedReadOnlyActions.includes(action.textTranslateKey); });
exports.RestrictedReadOnlyContextMenuActions = RestrictedReadOnlyContextMenuActions;
exports.default = ContextMenuActions;
