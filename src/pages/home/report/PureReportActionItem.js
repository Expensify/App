"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var fast_equals_1 = require("fast-equals");
var mapValues_1 = require("lodash/mapValues");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ActionSheetAwareScrollView = require("@components/ActionSheetAwareScrollView");
var AttachmentContext_1 = require("@components/AttachmentContext");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DisplayNames_1 = require("@components/DisplayNames");
var Hoverable_1 = require("@components/Hoverable");
var MentionReportContext_1 = require("@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var InlineSystemMessage_1 = require("@components/InlineSystemMessage");
var KYCWall_1 = require("@components/KYCWall");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var PressableWithSecondaryInteraction_1 = require("@components/PressableWithSecondaryInteraction");
var ReportActionItemEmojiReactions_1 = require("@components/Reactions/ReportActionItemEmojiReactions");
var RenderHTML_1 = require("@components/RenderHTML");
var ActionableItemButtons_1 = require("@components/ReportActionItem/ActionableItemButtons");
var ChronosOOOListActions_1 = require("@components/ReportActionItem/ChronosOOOListActions");
var ExportIntegration_1 = require("@components/ReportActionItem/ExportIntegration");
var IssueCardMessage_1 = require("@components/ReportActionItem/IssueCardMessage");
var MoneyRequestAction_1 = require("@components/ReportActionItem/MoneyRequestAction");
var MoneyRequestReportPreview_1 = require("@components/ReportActionItem/MoneyRequestReportPreview");
var TaskAction_1 = require("@components/ReportActionItem/TaskAction");
var TaskPreview_1 = require("@components/ReportActionItem/TaskPreview");
var TransactionPreview_1 = require("@components/ReportActionItem/TransactionPreview");
var TripRoomPreview_1 = require("@components/ReportActionItem/TripRoomPreview");
var SearchContext_1 = require("@components/Search/SearchContext");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var UnreadActionIndicator_1 = require("@components/UnreadActionIndicator");
var useLocalize_1 = require("@hooks/useLocalize");
var usePermissions_1 = require("@hooks/usePermissions");
var usePrevious_1 = require("@hooks/usePrevious");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ControlSelection_1 = require("@libs/ControlSelection");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var focusComposerWithDelay_1 = require("@libs/focusComposerWithDelay");
var isReportMessageAttachment_1 = require("@libs/isReportMessageAttachment");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Permissions_1 = require("@libs/Permissions");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SelectionScraper_1 = require("@libs/SelectionScraper");
var shouldRenderAppPaymentCard_1 = require("@libs/shouldRenderAppPaymentCard");
var ReportScreenContext_1 = require("@pages/home/ReportScreenContext");
var AttachmentModalContext_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContext");
var variables_1 = require("@styles/variables");
var BankAccounts_1 = require("@userActions/BankAccounts");
var EmojiPickerAction_1 = require("@userActions/EmojiPickerAction");
var Member_1 = require("@userActions/Policy/Member");
var Report_1 = require("@userActions/Report");
var Session_1 = require("@userActions/Session");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ContextMenuActions_1 = require("./ContextMenu/ContextMenuActions");
var MiniReportActionContextMenu_1 = require("./ContextMenu/MiniReportActionContextMenu");
var ReportActionContextMenu_1 = require("./ContextMenu/ReportActionContextMenu");
var LinkPreviewer_1 = require("./LinkPreviewer");
var ReportActionItemBasicMessage_1 = require("./ReportActionItemBasicMessage");
var ReportActionItemContentCreated_1 = require("./ReportActionItemContentCreated");
var ReportActionItemDraft_1 = require("./ReportActionItemDraft");
var ReportActionItemGrouped_1 = require("./ReportActionItemGrouped");
var ReportActionItemMessage_1 = require("./ReportActionItemMessage");
var ReportActionItemMessageEdit_1 = require("./ReportActionItemMessageEdit");
var ReportActionItemSingle_1 = require("./ReportActionItemSingle");
var ReportActionItemThread_1 = require("./ReportActionItemThread");
var TripSummary_1 = require("./TripSummary");
// This is equivalent to returning a negative boolean in normal functions, but we can keep the element return type
// If the child was rendered using RenderHTML and an empty html string, it has an empty prop called html
// If we render an empty component/fragment, this does not apply
var emptyHTML = <RenderHTML_1.default html=""/>;
var isEmptyHTML = function (_a) {
    var html = _a.props.html;
    return typeof html === 'string' && html.length === 0;
};
/**
 * This is a pure version of ReportActionItem, used in ReportActionList and Search result chat list items.
 * Since the search result has a separate Onyx key under the 'snapshot_' prefix, we should not connect this component with Onyx.
 * Instead, pass all Onyx read/write operations as props.
 */
function PureReportActionItem(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var action = _a.action, report = _a.report, policy = _a.policy, transactionThreadReport = _a.transactionThreadReport, linkedReportActionID = _a.linkedReportActionID, displayAsGroup = _a.displayAsGroup, index = _a.index, isMostRecentIOUReportAction = _a.isMostRecentIOUReportAction, parentReportAction = _a.parentReportAction, shouldDisplayNewMarker = _a.shouldDisplayNewMarker, _p = _a.shouldHideThreadDividerLine, shouldHideThreadDividerLine = _p === void 0 ? false : _p, _q = _a.shouldShowSubscriptAvatar, shouldShowSubscriptAvatar = _q === void 0 ? false : _q, _r = _a.onPress, onPress = _r === void 0 ? undefined : _r, _s = _a.isFirstVisibleReportAction, isFirstVisibleReportAction = _s === void 0 ? false : _s, _t = _a.isThreadReportParentAction, isThreadReportParentAction = _t === void 0 ? false : _t, _u = _a.shouldUseThreadDividerLine, shouldUseThreadDividerLine = _u === void 0 ? false : _u, _v = _a.shouldDisplayContextMenu, shouldDisplayContextMenu = _v === void 0 ? true : _v, parentReportActionForTransactionThread = _a.parentReportActionForTransactionThread, draftMessage = _a.draftMessage, iouReport = _a.iouReport, taskReport = _a.taskReport, linkedReport = _a.linkedReport, iouReportOfLinkedReport = _a.iouReportOfLinkedReport, emojiReactions = _a.emojiReactions, linkedTransactionRouteError = _a.linkedTransactionRouteError, isUserValidated = _a.isUserValidated, parentReport = _a.parentReport, personalDetails = _a.personalDetails, blockedFromConcierge = _a.blockedFromConcierge, _w = _a.originalReportID, originalReportID = _w === void 0 ? '-1' : _w, _x = _a.deleteReportActionDraft, deleteReportActionDraft = _x === void 0 ? function () { } : _x, isArchivedRoom = _a.isArchivedRoom, isChronosReport = _a.isChronosReport, _y = _a.toggleEmojiReaction, toggleEmojiReaction = _y === void 0 ? function () { } : _y, _z = _a.createDraftTransactionAndNavigateToParticipantSelector, createDraftTransactionAndNavigateToParticipantSelector = _z === void 0 ? function () { } : _z, _0 = _a.resolveActionableReportMentionWhisper, resolveActionableReportMentionWhisper = _0 === void 0 ? function () { } : _0, _1 = _a.resolveActionableMentionWhisper, resolveActionableMentionWhisper = _1 === void 0 ? function () { } : _1, isClosedExpenseReportWithNoExpenses = _a.isClosedExpenseReportWithNoExpenses, _2 = _a.isCurrentUserTheOnlyParticipant, isCurrentUserTheOnlyParticipant = _2 === void 0 ? function () { return false; } : _2, missingPaymentMethod = _a.missingPaymentMethod, _3 = _a.reimbursementDeQueuedOrCanceledActionMessage, reimbursementDeQueuedOrCanceledActionMessage = _3 === void 0 ? '' : _3, _4 = _a.modifiedExpenseMessage, modifiedExpenseMessage = _4 === void 0 ? '' : _4, _5 = _a.getTransactionsWithReceipts, getTransactionsWithReceipts = _5 === void 0 ? function () { return []; } : _5, _6 = _a.clearError, clearError = _6 === void 0 ? function () { } : _6, _7 = _a.clearAllRelatedReportActionErrors, clearAllRelatedReportActionErrors = _7 === void 0 ? function () { } : _7, _8 = _a.dismissTrackExpenseActionableWhisper, dismissTrackExpenseActionableWhisper = _8 === void 0 ? function () { } : _8, userBillingFundID = _a.userBillingFundID, policies = _a.policies, shouldShowBorder = _a.shouldShowBorder;
    var actionSheetAwareScrollViewContext = (0, react_1.useContext)(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    var _9 = (0, useLocalize_1.default)(), translate = _9.translate, datetimeToCalendarTime = _9.datetimeToCalendarTime;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var reportID = (_b = report === null || report === void 0 ? void 0 : report.reportID) !== null && _b !== void 0 ? _b : action === null || action === void 0 ? void 0 : action.reportID;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _10 = (0, react_1.useState)(function () { return (0, ReportActionContextMenu_1.isActiveReportAction)(action.reportActionID); }), isContextMenuActive = _10[0], setIsContextMenuActive = _10[1];
    var _11 = (0, react_1.useState)(), isEmojiPickerActive = _11[0], setIsEmojiPickerActive = _11[1];
    var _12 = (0, react_1.useState)(), isPaymentMethodPopoverActive = _12[0], setIsPaymentMethodPopoverActive = _12[1];
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var shouldRenderViewBasedOnAction = (0, ReportActionsUtils_1.useTableReportViewActionRenderConditionals)(action);
    var _13 = (0, react_1.useState)(false), isHidden = _13[0], setIsHidden = _13[1];
    var _14 = (0, react_1.useState)(CONST_1.default.MODERATION.MODERATOR_DECISION_APPROVED), moderationDecision = _14[0], setModerationDecision = _14[1];
    var reactionListRef = (0, react_1.useContext)(ReportScreenContext_1.ReactionListContext);
    var updateHiddenAttachments = (0, react_1.useContext)(AttachmentModalContext_1.default).updateHiddenAttachments;
    var composerTextInputRef = (0, react_1.useRef)(null);
    var popoverAnchorRef = (0, react_1.useRef)(null);
    var downloadedPreviews = (0, react_1.useRef)([]);
    var prevDraftMessage = (0, usePrevious_1.default)(draftMessage);
    var isReportActionLinked = linkedReportActionID && action.reportActionID && linkedReportActionID === action.reportActionID;
    var _15 = (0, react_1.useState)(!!isReportActionLinked), isReportActionActive = _15[0], setIsReportActionActive = _15[1];
    var isActionableWhisper = (0, ReportActionsUtils_1.isActionableMentionWhisper)(action) || (0, ReportActionsUtils_1.isActionableTrackExpense)(action) || (0, ReportActionsUtils_1.isActionableReportMentionWhisper)(action);
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var highlightedBackgroundColorIfNeeded = (0, react_1.useMemo)(function () { return (isReportActionLinked ? StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG) : {}); }, [StyleUtils, isReportActionLinked, theme.messageHighlightBG]);
    var reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, 1, undefined, undefined);
    var isDeletedParentAction = (0, ReportActionsUtils_1.isDeletedParentAction)(action);
    // IOUDetails only exists when we are sending money
    var isSendingMoney = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) && ((_c = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _c === void 0 ? void 0 : _c.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY && ((_d = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _d === void 0 ? void 0 : _d.IOUDetails);
    var updateHiddenState = (0, react_1.useCallback)(function (isHiddenValue) {
        var _a, _b;
        setIsHidden(isHiddenValue);
        var message = Array.isArray(action.message) ? (_a = action.message) === null || _a === void 0 ? void 0 : _a.at(-1) : action.message;
        var isAttachment = CONST_1.default.ATTACHMENT_REGEX.test((_b = message === null || message === void 0 ? void 0 : message.html) !== null && _b !== void 0 ? _b : '') || (0, isReportMessageAttachment_1.isReportMessageAttachment)(message);
        if (!isAttachment) {
            return;
        }
        updateHiddenAttachments(action.reportActionID, isHiddenValue);
    }, [action.reportActionID, action.message, updateHiddenAttachments]);
    var _16 = (0, SearchContext_1.useSearchContext)(), isOnSearch = _16.isOnSearch, currentSearchHash = _16.currentSearchHash;
    var _17 = (0, react_1.useState)(false), showConfirmDismissReceiptError = _17[0], setShowConfirmDismissReceiptError = _17[1];
    var dismissError = (0, react_1.useCallback)(function () {
        var _a;
        var transactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) ? (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID : undefined;
        if (transactionID) {
            clearError(transactionID);
        }
        clearAllRelatedReportActionErrors(reportID, action);
    }, [reportID, clearError, clearAllRelatedReportActionErrors, action]);
    var onClose = function () {
        var errors = linkedTransactionRouteError !== null && linkedTransactionRouteError !== void 0 ? linkedTransactionRouteError : (0, ErrorUtils_1.getLatestErrorMessageField)(action);
        var errorEntries = Object.entries(errors !== null && errors !== void 0 ? errors : {});
        var errorMessages = (0, mapValues_1.default)(Object.fromEntries(errorEntries), function (error) { return error; });
        var hasReceiptError = Object.values(errorMessages).some(function (error) { return (0, ErrorUtils_1.isReceiptError)(error); });
        if (hasReceiptError) {
            setShowConfirmDismissReceiptError(true);
        }
        else {
            dismissError();
        }
    };
    (0, react_1.useEffect)(function () { return function () {
        var _a, _b;
        // ReportActionContextMenu, EmojiPicker and PopoverReactionList are global components,
        // we should also hide them when the current component is destroyed
        if ((0, ReportActionContextMenu_1.isActiveReportAction)(action.reportActionID)) {
            (0, ReportActionContextMenu_1.hideContextMenu)();
            (0, ReportActionContextMenu_1.hideDeleteModal)();
        }
        if ((0, EmojiPickerAction_1.isActive)(action.reportActionID)) {
            (0, EmojiPickerAction_1.hideEmojiPicker)(true);
        }
        if ((_a = reactionListRef === null || reactionListRef === void 0 ? void 0 : reactionListRef.current) === null || _a === void 0 ? void 0 : _a.isActiveReportAction(action.reportActionID)) {
            (_b = reactionListRef === null || reactionListRef === void 0 ? void 0 : reactionListRef.current) === null || _b === void 0 ? void 0 : _b.hideReactionList();
        }
    }; }, [action.reportActionID, reactionListRef]);
    (0, react_1.useEffect)(function () {
        // We need to hide EmojiPicker when this is a deleted parent action
        if (!isDeletedParentAction || !(0, EmojiPickerAction_1.isActive)(action.reportActionID)) {
            return;
        }
        (0, EmojiPickerAction_1.hideEmojiPicker)(true);
    }, [isDeletedParentAction, action.reportActionID]);
    (0, react_1.useEffect)(function () {
        if (prevDraftMessage !== undefined || draftMessage === undefined) {
            return;
        }
        (0, focusComposerWithDelay_1.default)(composerTextInputRef.current)(true);
    }, [prevDraftMessage, draftMessage]);
    (0, react_1.useEffect)(function () {
        if (!Permissions_1.default.canUseLinkPreviews()) {
            return;
        }
        var urls = (0, ReportActionsUtils_1.extractLinksFromMessageHtml)(action);
        if ((0, fast_equals_1.deepEqual)(downloadedPreviews.current, urls) || action.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }
        downloadedPreviews.current = urls;
        (0, Report_1.expandURLPreview)(reportID, action.reportActionID);
    }, [action, reportID]);
    (0, react_1.useEffect)(function () {
        if (draftMessage === undefined || !(0, ReportActionsUtils_1.isDeletedAction)(action)) {
            return;
        }
        deleteReportActionDraft(reportID, action);
    }, [draftMessage, action, reportID, deleteReportActionDraft]);
    // Hide the message if it is being moderated for a higher offense, or is hidden by a moderator
    // Removed messages should not be shown anyway and should not need this flow
    var latestDecision = (_g = (_f = (_e = (0, ReportActionsUtils_1.getReportActionMessage)(action)) === null || _e === void 0 ? void 0 : _e.moderationDecision) === null || _f === void 0 ? void 0 : _f.decision) !== null && _g !== void 0 ? _g : '';
    (0, react_1.useEffect)(function () {
        if (action.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
            return;
        }
        // Hide reveal message button and show the message if latestDecision is changed to empty
        if (!latestDecision) {
            setModerationDecision(CONST_1.default.MODERATION.MODERATOR_DECISION_APPROVED);
            setIsHidden(false);
            return;
        }
        setModerationDecision(latestDecision);
        if (![CONST_1.default.MODERATION.MODERATOR_DECISION_APPROVED, CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING].some(function (item) { return item === latestDecision; }) && !(0, ReportActionsUtils_1.isPendingRemove)(action)) {
            setIsHidden(true);
            return;
        }
        setIsHidden(false);
    }, [latestDecision, action]);
    var toggleContextMenuFromActiveReportAction = (0, react_1.useCallback)(function () {
        setIsContextMenuActive((0, ReportActionContextMenu_1.isActiveReportAction)(action.reportActionID));
    }, [action.reportActionID]);
    var handleShowContextMenu = (0, react_1.useCallback)(function (callback) {
        var _a;
        if (!(popoverAnchorRef.current && 'measureInWindow' in popoverAnchorRef.current)) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        (_a = popoverAnchorRef.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (_fx, frameY, _width, height) {
            actionSheetAwareScrollViewContext.transitionActionSheetState({
                type: ActionSheetAwareScrollView.Actions.OPEN_POPOVER,
                payload: {
                    popoverHeight: 0,
                    frameY: frameY,
                    height: height,
                },
            });
            callback();
        });
    }, [actionSheetAwareScrollViewContext]);
    var disabledActions = (0, react_1.useMemo)(function () { return (!(0, ReportUtils_1.canWriteInReport)(report) ? ContextMenuActions_1.RestrictedReadOnlyContextMenuActions : []); }, [report]);
    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param [event] - A press event.
     */
    var showPopover = (0, react_1.useCallback)(function (event) {
        // Block menu on the message being Edited or if the report action item has errors
        if (draftMessage !== undefined || !(0, EmptyObject_1.isEmptyObject)(action.errors) || !shouldDisplayContextMenu) {
            return;
        }
        handleShowContextMenu(function () {
            setIsContextMenuActive(true);
            var selection = SelectionScraper_1.default.getCurrentSelection();
            (0, ReportActionContextMenu_1.showContextMenu)({
                type: CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION,
                event: event,
                selection: selection,
                contextMenuAnchor: popoverAnchorRef.current,
                report: {
                    reportID: reportID,
                    originalReportID: originalReportID,
                    isArchivedRoom: isArchivedRoom,
                    isChronos: isChronosReport,
                },
                reportAction: {
                    reportActionID: action.reportActionID,
                    draftMessage: draftMessage,
                    isThreadReportParentAction: isThreadReportParentAction,
                },
                callbacks: {
                    onShow: toggleContextMenuFromActiveReportAction,
                    onHide: toggleContextMenuFromActiveReportAction,
                    setIsEmojiPickerActive: setIsEmojiPickerActive,
                },
                disabledOptions: disabledActions,
            });
        });
    }, [
        draftMessage,
        action,
        reportID,
        toggleContextMenuFromActiveReportAction,
        originalReportID,
        shouldDisplayContextMenu,
        disabledActions,
        isArchivedRoom,
        isChronosReport,
        handleShowContextMenu,
        isThreadReportParentAction,
    ]);
    var toggleReaction = (0, react_1.useCallback)(function (emoji, ignoreSkinToneOnCompare) {
        toggleEmojiReaction(reportID, action, emoji, emojiReactions, undefined, ignoreSkinToneOnCompare);
    }, [reportID, action, emojiReactions, toggleEmojiReaction]);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        anchor: popoverAnchorRef.current,
        report: report,
        isReportArchived: isReportArchived,
        action: action,
        transactionThreadReport: transactionThreadReport,
        checkIfContextMenuActive: toggleContextMenuFromActiveReportAction,
        onShowContextMenu: handleShowContextMenu,
        isDisabled: false,
        shouldDisplayContextMenu: shouldDisplayContextMenu,
    }); }, [report, action, toggleContextMenuFromActiveReportAction, transactionThreadReport, handleShowContextMenu, shouldDisplayContextMenu, isReportArchived]);
    var attachmentContextValue = (0, react_1.useMemo)(function () {
        if (isOnSearch) {
            return { type: CONST_1.default.ATTACHMENT_TYPE.SEARCH, currentSearchHash: currentSearchHash };
        }
        return { reportID: reportID, type: CONST_1.default.ATTACHMENT_TYPE.REPORT };
    }, [reportID, isOnSearch, currentSearchHash]);
    var mentionReportContextValue = (0, react_1.useMemo)(function () { return ({ currentReportID: report === null || report === void 0 ? void 0 : report.reportID, exactlyMatch: true }); }, [report === null || report === void 0 ? void 0 : report.reportID]);
    var actionableItemButtons = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        if ((0, ReportActionsUtils_1.isActionableAddPaymentCard)(action) && userBillingFundID === undefined && (0, shouldRenderAppPaymentCard_1.default)()) {
            return [
                {
                    text: 'subscription.cardSection.addCardButton',
                    key: "".concat(action.reportActionID, "-actionableAddPaymentCard-submit"),
                    onPress: function () {
                        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
                    },
                    isPrimary: true,
                },
            ];
        }
        if ((0, ReportActionsUtils_1.isConciergeCategoryOptions)(action)) {
            var options = (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _a === void 0 ? void 0 : _a.options;
            if (!options) {
                return [];
            }
            if ((0, ReportActionsUtils_1.isResolvedConciergeCategoryOptions)(action)) {
                return [];
            }
            if (!reportID) {
                return [];
            }
            return options.map(function (option, i) { return ({
                text: "".concat(i + 1, " - ").concat(option),
                key: "".concat(action.reportActionID, "-conciergeCategoryOptions-").concat(option),
                onPress: function () {
                    (0, Report_1.resolveConciergeCategoryOptions)(reportID, originalReportID, action.reportActionID, option);
                },
            }); });
        }
        if (!isActionableWhisper && (!(0, ReportActionsUtils_1.isActionableJoinRequest)(action) || ((_b = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _b === void 0 ? void 0 : _b.choice) !== '')) {
            return [];
        }
        if ((0, ReportActionsUtils_1.isActionableTrackExpense)(action)) {
            var transactionID_1 = (_c = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _c === void 0 ? void 0 : _c.transactionID;
            var options = [
                {
                    text: 'actionableMentionTrackExpense.submit',
                    key: "".concat(action.reportActionID, "-actionableMentionTrackExpense-submit"),
                    onPress: function () {
                        createDraftTransactionAndNavigateToParticipantSelector(transactionID_1, reportID, CONST_1.default.IOU.ACTION.SUBMIT, action.reportActionID);
                    },
                },
            ];
            if (isBetaEnabled(CONST_1.default.BETAS.TRACK_FLOWS)) {
                options.push({
                    text: 'actionableMentionTrackExpense.categorize',
                    key: "".concat(action.reportActionID, "-actionableMentionTrackExpense-categorize"),
                    onPress: function () {
                        createDraftTransactionAndNavigateToParticipantSelector(transactionID_1, reportID, CONST_1.default.IOU.ACTION.CATEGORIZE, action.reportActionID);
                    },
                }, {
                    text: 'actionableMentionTrackExpense.share',
                    key: "".concat(action.reportActionID, "-actionableMentionTrackExpense-share"),
                    onPress: function () {
                        createDraftTransactionAndNavigateToParticipantSelector(transactionID_1, reportID, CONST_1.default.IOU.ACTION.SHARE, action.reportActionID);
                    },
                });
            }
            options.push({
                text: 'actionableMentionTrackExpense.nothing',
                key: "".concat(action.reportActionID, "-actionableMentionTrackExpense-nothing"),
                onPress: function () {
                    dismissTrackExpenseActionableWhisper(reportID, action);
                },
            });
            return options;
        }
        if ((0, ReportActionsUtils_1.isActionableJoinRequest)(action)) {
            return [
                {
                    text: 'actionableMentionJoinWorkspaceOptions.accept',
                    key: "".concat(action.reportActionID, "-actionableMentionJoinWorkspace-").concat(CONST_1.default.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT),
                    onPress: function () { return (0, Member_1.acceptJoinRequest)(reportID, action); },
                    isPrimary: true,
                },
                {
                    text: 'actionableMentionJoinWorkspaceOptions.decline',
                    key: "".concat(action.reportActionID, "-actionableMentionJoinWorkspace-").concat(CONST_1.default.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.DECLINE),
                    onPress: function () { return (0, Member_1.declineJoinRequest)(reportID, action); },
                },
            ];
        }
        if ((0, ReportActionsUtils_1.isActionableReportMentionWhisper)(action)) {
            return [
                {
                    text: 'common.yes',
                    key: "".concat(action.reportActionID, "-actionableReportMentionWhisper-").concat(CONST_1.default.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.CREATE),
                    onPress: function () { return resolveActionableReportMentionWhisper(reportID, action, CONST_1.default.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.CREATE); },
                    isPrimary: true,
                },
                {
                    text: 'common.no',
                    key: "".concat(action.reportActionID, "-actionableReportMentionWhisper-").concat(CONST_1.default.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.NOTHING),
                    onPress: function () { return resolveActionableReportMentionWhisper(reportID, action, CONST_1.default.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.NOTHING); },
                },
            ];
        }
        return [
            {
                text: 'actionableMentionWhisperOptions.invite',
                key: "".concat(action.reportActionID, "-actionableMentionWhisper-").concat(CONST_1.default.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE),
                onPress: function () { return resolveActionableMentionWhisper(reportID, action, CONST_1.default.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE); },
                isPrimary: true,
            },
            {
                text: 'actionableMentionWhisperOptions.nothing',
                key: "".concat(action.reportActionID, "-actionableMentionWhisper-").concat(CONST_1.default.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING),
                onPress: function () { return resolveActionableMentionWhisper(reportID, action, CONST_1.default.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING); },
            },
        ];
    }, [
        action,
        isActionableWhisper,
        reportID,
        userBillingFundID,
        createDraftTransactionAndNavigateToParticipantSelector,
        dismissTrackExpenseActionableWhisper,
        resolveActionableReportMentionWhisper,
        resolveActionableMentionWhisper,
        originalReportID,
        isBetaEnabled,
    ]);
    /**
     * Get the content of ReportActionItem
     * @param hovered whether the ReportActionItem is hovered
     * @param isWhisper whether the report action is a whisper
     * @param hasErrors whether the report action has any errors
     * @returns child component(s)
     */
    var renderItemContent = function (hovered, isWhisper, hasErrors) {
        var _a;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        if (hovered === void 0) { hovered = false; }
        if (isWhisper === void 0) { isWhisper = false; }
        if (hasErrors === void 0) { hasErrors = false; }
        var children;
        var moneyRequestOriginalMessage = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) ? (0, ReportActionsUtils_1.getOriginalMessage)(action) : undefined;
        var moneyRequestActionType = moneyRequestOriginalMessage === null || moneyRequestOriginalMessage === void 0 ? void 0 : moneyRequestOriginalMessage.type;
        // Show the preview for when expense is present
        if ((0, ReportActionsUtils_1.isIOURequestReportAction)(action)) {
            var isSplitInGroupChat = moneyRequestActionType === CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT && (report === null || report === void 0 ? void 0 : report.chatType) === CONST_1.default.REPORT.CHAT_TYPE.GROUP;
            var isSplitScanWithNoAmount = moneyRequestActionType === CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT && (moneyRequestOriginalMessage === null || moneyRequestOriginalMessage === void 0 ? void 0 : moneyRequestOriginalMessage.amount) === 0;
            var shouldShowSplitPreview_1 = isSplitInGroupChat || isSplitScanWithNoAmount;
            var chatReportID_1 = (moneyRequestOriginalMessage === null || moneyRequestOriginalMessage === void 0 ? void 0 : moneyRequestOriginalMessage.IOUReportID) ? report === null || report === void 0 ? void 0 : report.chatReportID : reportID;
            // There is no single iouReport for bill splits, so only 1:1 requests require an iouReportID
            var iouReportID_1 = (_b = moneyRequestOriginalMessage === null || moneyRequestOriginalMessage === void 0 ? void 0 : moneyRequestOriginalMessage.IOUReportID) === null || _b === void 0 ? void 0 : _b.toString();
            children = (<MoneyRequestAction_1.default 
            // If originalMessage.iouReportID is set, this is a 1:1 IOU expense in a DM chat whose reportID is report.chatReportID
            chatReportID={chatReportID_1} requestReportID={iouReportID_1} reportID={reportID} action={action} isMostRecentIOUReportAction={isMostRecentIOUReportAction} isHovered={hovered} contextMenuAnchor={popoverAnchorRef.current} checkIfContextMenuActive={toggleContextMenuFromActiveReportAction} style={displayAsGroup ? [] : [styles.mt2]} isWhisper={isWhisper} shouldDisplayContextMenu={shouldDisplayContextMenu}/>);
            if ((report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.CHAT) {
                if (report.chatType === CONST_1.default.REPORT.CHAT_TYPE.SELF_DM || shouldShowSplitPreview_1) {
                    children = (<react_native_1.View style={[styles.mt1, styles.w100]}>
                            <TransactionPreview_1.default iouReportID={(0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(action)} chatReportID={reportID} reportID={reportID} action={action} shouldDisplayContextMenu={shouldDisplayContextMenu} isBillSplit={(0, ReportActionsUtils_1.isSplitBillAction)(action)} transactionID={shouldShowSplitPreview_1 ? moneyRequestOriginalMessage === null || moneyRequestOriginalMessage === void 0 ? void 0 : moneyRequestOriginalMessage.IOUTransactionID : undefined} containerStyles={[reportPreviewStyles.transactionPreviewStandaloneStyle, styles.mt1]} transactionPreviewWidth={reportPreviewStyles.transactionPreviewStandaloneStyle.width} onPreviewPressed={function () {
                            if (shouldShowSplitPreview_1) {
                                Navigation_1.default.navigate(ROUTES_1.default.SPLIT_BILL_DETAILS.getRoute(chatReportID_1, action.reportActionID, Navigation_1.default.getReportRHPActiveRoute()));
                                return;
                            }
                            if (!action.childReportID) {
                                return;
                            }
                            Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(action.childReportID, undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute()));
                        }} isTrackExpense={(0, ReportActionsUtils_1.isTrackExpenseAction)(action)}/>
                        </react_native_1.View>);
                }
                else {
                    children = emptyHTML;
                }
            }
        }
        else if ((0, ReportActionsUtils_1.isTripPreview)(action)) {
            children = (<TripRoomPreview_1.default action={action} chatReport={linkedReport} iouReport={iouReportOfLinkedReport} isHovered={hovered} contextMenuAnchor={popoverAnchorRef.current} containerStyles={displayAsGroup ? [] : [styles.mt2]} checkIfContextMenuActive={toggleContextMenuFromActiveReportAction} shouldDisplayContextMenu={shouldDisplayContextMenu}/>);
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && isClosedExpenseReportWithNoExpenses) {
            children = <RenderHTML_1.default html={"<deleted-action>".concat(translate('parentReportAction.deletedReport'), "</deleted-action>")}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
            children = (<MoneyRequestReportPreview_1.default iouReportID={(0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(action)} policyID={report === null || report === void 0 ? void 0 : report.policyID} chatReportID={reportID} action={action} contextMenuAnchor={popoverAnchorRef.current} isHovered={hovered} isWhisper={isWhisper} isInvoice={action.childType === CONST_1.default.REPORT.CHAT_TYPE.INVOICE} checkIfContextMenuActive={toggleContextMenuFromActiveReportAction} onPaymentOptionsShow={function () { return setIsPaymentMethodPopoverActive(true); }} onPaymentOptionsHide={function () { return setIsPaymentMethodPopoverActive(false); }} shouldDisplayContextMenu={shouldDisplayContextMenu} shouldShowBorder={shouldShowBorder}/>);
        }
        else if ((0, ReportActionsUtils_1.isTaskAction)(action)) {
            children = <TaskAction_1.default action={action}/>;
        }
        else if ((0, ReportActionsUtils_1.isCreatedTaskReportAction)(action)) {
            children = (<ShowContextMenuContext_1.ShowContextMenuContext.Provider value={contextValue}>
                    <TaskPreview_1.default style={displayAsGroup ? [] : [styles.mt1]} taskReport={taskReport} chatReportID={reportID} action={action} isHovered={hovered} onShowContextMenu={handleShowContextMenu} contextMenuAnchor={popoverAnchorRef.current} checkIfContextMenuActive={toggleContextMenuFromActiveReportAction} policyID={report === null || report === void 0 ? void 0 : report.policyID} shouldDisplayContextMenu={shouldDisplayContextMenu}/>
                </ShowContextMenuContext_1.ShowContextMenuContext.Provider>);
        }
        else if ((0, ReportActionsUtils_1.isReimbursementQueuedAction)(action)) {
            var targetReport_1 = (0, ReportUtils_1.isChatThread)(report) ? parentReport : report;
            var submitterDisplayName = (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_c = targetReport_1 === null || targetReport_1 === void 0 ? void 0 : targetReport_1.ownerAccountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID]));
            var paymentType = (_e = (_d = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _d === void 0 ? void 0 : _d.paymentType) !== null && _e !== void 0 ? _e : '';
            children = (<ReportActionItemBasicMessage_1.default message={translate(paymentType === CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY ? 'iou.waitingOnEnabledWallet' : 'iou.waitingOnBankAccount', { submitterDisplayName: submitterDisplayName })}>
                    <>
                        {missingPaymentMethod === 'bankAccount' && (<Button_1.default success style={[styles.w100, styles.requestPreviewBox]} text={translate('bankAccount.addBankAccount')} onPress={function () { var _a; return (0, BankAccounts_1.openPersonalBankAccountSetupView)((_a = Navigation_1.default.getTopmostReportId()) !== null && _a !== void 0 ? _a : targetReport_1 === null || targetReport_1 === void 0 ? void 0 : targetReport_1.reportID, undefined, undefined, isUserValidated); }} pressOnEnter large/>)}
                        {missingPaymentMethod === 'wallet' && (<KYCWall_1.default onSuccessfulKYC={function () { return Navigation_1.default.navigate(ROUTES_1.default.ENABLE_PAYMENTS); }} enablePaymentsRoute={ROUTES_1.default.ENABLE_PAYMENTS} addBankAccountRoute={ROUTES_1.default.BANK_ACCOUNT_PERSONAL} addDebitCardRoute={ROUTES_1.default.SETTINGS_ADD_DEBIT_CARD} chatReportID={targetReport_1 === null || targetReport_1 === void 0 ? void 0 : targetReport_1.reportID} iouReport={iouReport}>
                                {function (triggerKYCFlow, buttonRef) { return (<Button_1.default ref={buttonRef} success large style={[styles.w100, styles.requestPreviewBox]} text={translate('iou.enableWallet')} onPress={triggerKYCFlow}/>); }}
                            </KYCWall_1.default>)}
                    </>
                </ReportActionItemBasicMessage_1.default>);
        }
        else if ((0, ReportActionsUtils_1.isReimbursementDeQueuedOrCanceledAction)(action)) {
            children = <ReportActionItemBasicMessage_1.default message={reimbursementDeQueuedOrCanceledActionMessage}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) {
            children = <ReportActionItemBasicMessage_1.default message={modifiedExpenseMessage}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED) || (0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) || (0, ReportActionsUtils_1.isMarkAsClosedAction)(action)) {
            var wasSubmittedViaHarvesting = !(0, ReportActionsUtils_1.isMarkAsClosedAction)(action) ? ((_g = (_f = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _f === void 0 ? void 0 : _f.harvesting) !== null && _g !== void 0 ? _g : false) : false;
            if (wasSubmittedViaHarvesting) {
                children = (<ReportActionItemBasicMessage_1.default>
                        <RenderHTML_1.default html={"<comment><muted-text>".concat(translate('iou.automaticallySubmitted'), "</muted-text></comment>")}/>
                    </ReportActionItemBasicMessage_1.default>);
            }
            else {
                children = <ReportActionItemBasicMessage_1.default message={translate('iou.submitted')}/>;
            }
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED)) {
            var wasAutoApproved = (_j = (_h = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _h === void 0 ? void 0 : _h.automaticAction) !== null && _j !== void 0 ? _j : false;
            if (wasAutoApproved) {
                children = (<ReportActionItemBasicMessage_1.default>
                        <RenderHTML_1.default html={"<comment><muted-text>".concat(translate('iou.automaticallyApproved'), "</muted-text></comment>")}/>
                    </ReportActionItemBasicMessage_1.default>);
            }
            else {
                children = <ReportActionItemBasicMessage_1.default message={translate('iou.approvedMessage')}/>;
            }
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.IOU) && ((_k = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _k === void 0 ? void 0 : _k.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY) {
            var wasAutoPaid = (_m = (_l = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _l === void 0 ? void 0 : _l.automaticAction) !== null && _m !== void 0 ? _m : false;
            var paymentType = (_o = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _o === void 0 ? void 0 : _o.paymentType;
            if (paymentType === CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE) {
                children = <ReportActionItemBasicMessage_1.default message={translate('iou.paidElsewhere')}/>;
            }
            else if (wasAutoPaid) {
                children = (<ReportActionItemBasicMessage_1.default>
                        <RenderHTML_1.default html={"<comment><muted-text>".concat(translate('iou.automaticallyPaidWithExpensify'), "</muted-text></comment>")}/>
                    </ReportActionItemBasicMessage_1.default>);
            }
            else {
                children = <ReportActionItemBasicMessage_1.default message={translate('iou.paidWithExpensify')}/>;
            }
        }
        else if ((0, ReportActionsUtils_1.isUnapprovedAction)(action)) {
            children = <ReportActionItemBasicMessage_1.default message={translate('iou.unapproved')}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.FORWARDED)) {
            var wasAutoForwarded = (_q = (_p = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _p === void 0 ? void 0 : _p.automaticAction) !== null && _q !== void 0 ? _q : false;
            if (wasAutoForwarded) {
                children = (<ReportActionItemBasicMessage_1.default>
                        <RenderHTML_1.default html={"<comment><muted-text>".concat(translate('iou.automaticallyForwarded'), "</muted-text></comment>")}/>
                    </ReportActionItemBasicMessage_1.default>);
            }
            else {
                children = <ReportActionItemBasicMessage_1.default message={translate('iou.forwarded')}/>;
            }
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REJECTED) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportUtils_1.getRejectedReportMessage)()}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportUtils_1.getUpgradeWorkspaceMessage)()}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportUtils_1.getDowngradeWorkspaceMessage)()}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.HOLD) {
            children = <ReportActionItemBasicMessage_1.default message={translate('iou.heldExpense')}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.HOLD_COMMENT) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getReportActionText)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.UNHOLD) {
            children = <ReportActionItemBasicMessage_1.default message={translate('iou.unheldExpense')}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.RETRACTED) {
            children = <ReportActionItemBasicMessage_1.default message={translate('iou.retracted')}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REOPENED) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getReopenedMessage)()}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CHANGE_POLICY) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportUtils_1.getPolicyChangeMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportUtils_1.getDeletedTransactionMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION) {
            children = (<ReportActionItemBasicMessage_1.default message="">
                    <RenderHTML_1.default html={"<comment><muted-text>".concat((0, ReportUtils_1.getMovedTransactionMessage)(action), "</muted-text></comment>")}/>
                </ReportActionItemBasicMessage_1.default>);
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
            children = (<ReportActionItemBasicMessage_1.default message="">
                    <RenderHTML_1.default html={"<comment><muted-text>".concat((0, ReportActionsUtils_1.getTravelUpdateMessage)(action, datetimeToCalendarTime), "</muted-text></comment>")}/>
                </ReportActionItemBasicMessage_1.default>);
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION) {
            children = <ReportActionItemBasicMessage_1.default message={translate('iou.unreportedTransaction')}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION) {
            children = <ReportActionItemBasicMessage_1.default message={translate('systemMessage.mergedWithCashTransaction')}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getDismissedViolationMessageText)((0, ReportActionsUtils_1.getOriginalMessage)(action))}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES)) {
            children = <ReportActionItemBasicMessage_1.default message={translate('violations.resolvedDuplicates')}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportUtils_1.getWorkspaceNameUpdatedMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceCurrencyUpdateMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceFrequencyUpdateMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY ||
            action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY ||
            action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY ||
            action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceCategoryUpdateMessage)(action, policy)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME) {
            children = <ReportActionItemBasicMessage_1.default message={(0, PolicyUtils_1.getCleanedTagName)((0, ReportActionsUtils_1.getTagListNameUpdatedMessage)(action))}/>;
        }
        else if ((0, ReportActionsUtils_1.isTagModificationAction)(action.actionName)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, PolicyUtils_1.getCleanedTagName)((0, ReportActionsUtils_1.getWorkspaceTagUpdateMessage)(action))}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceCustomUnitUpdatedMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceCustomUnitRateAddedMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceCustomUnitRateUpdatedMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceCustomUnitRateDeletedMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceReportFieldAddMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceReportFieldUpdateMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceReportFieldDeleteMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getWorkspaceUpdateFieldMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getPolicyChangeLogMaxExpenseAmountNoReceiptMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getPolicyChangeLogMaxExpenseAmountMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getPolicyChangeLogDefaultBillableMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getPolicyChangeLogDefaultTitleEnforcedMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getPolicyChangeLogAddEmployeeMessage)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getPolicyChangeLogUpdateEmployee)(action)}/>;
        }
        else if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getPolicyChangeLogDeleteMemberMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getAddedApprovalRuleMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getDeletedApprovalRuleMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getUpdatedApprovalRuleMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getRemovedFromApprovalChainMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionableJoinRequest)(action)) {
            children = (<react_native_1.View>
                    <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getJoinRequestMessage)(action)}/>
                    {actionableItemButtons.length > 0 && (<ActionableItemButtons_1.default items={actionableItemButtons} shouldUseLocalization layout={(0, ReportActionsUtils_1.isActionableTrackExpense)(action) ? 'vertical' : 'horizontal'}/>)}
                </react_native_1.View>);
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getDemotedFromWorkspaceMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isCardIssuedAction)(action)) {
            children = (<IssueCardMessage_1.default action={action} policyID={report === null || report === void 0 ? void 0 : report.policyID}/>);
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION)) {
            children = <ExportIntegration_1.default action={action}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED)) {
            children = <ReportActionItemBasicMessage_1.default message={translate('receipt.scanFailed')}/>;
        }
        else if ((0, ReportActionsUtils_1.isRenamedAction)(action)) {
            var message = (0, ReportActionsUtils_1.getRenamedAction)(action, (0, ReportUtils_1.isExpenseReport)(report));
            children = <ReportActionItemBasicMessage_1.default message={message}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
            children = (<ReportActionItemBasicMessage_1.default message="">
                    <RenderHTML_1.default html={"<comment><muted-text>".concat((0, ReportActionsUtils_1.getIntegrationSyncFailedMessage)(action, report === null || report === void 0 ? void 0 : report.policyID), "</muted-text></comment>")}/>
                </ReportActionItemBasicMessage_1.default>);
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getAddedConnectionMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getRemovedConnectionMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getUpdatedAuditRateMessage)(action)}/>;
        }
        else if ((0, ReportActionsUtils_1.isActionOfType)(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD)) {
            children = <ReportActionItemBasicMessage_1.default message={(0, ReportActionsUtils_1.getUpdatedManualApprovalThresholdMessage)(action)}/>;
        }
        else {
            var hasBeenFlagged = ![CONST_1.default.MODERATION.MODERATOR_DECISION_APPROVED, CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING].some(function (item) { return item === moderationDecision; }) && !(0, ReportActionsUtils_1.isPendingRemove)(action);
            children = (<MentionReportContext_1.default.Provider value={mentionReportContextValue}>
                    <ShowContextMenuContext_1.ShowContextMenuContext.Provider value={contextValue}>
                        <AttachmentContext_1.AttachmentContext.Provider value={attachmentContextValue}>
                            {draftMessage === undefined ? (<react_native_1.View style={displayAsGroup && hasBeenFlagged ? styles.blockquote : {}}>
                                    <ReportActionItemMessage_1.default reportID={reportID} action={action} displayAsGroup={displayAsGroup} isHidden={isHidden}/>
                                    {hasBeenFlagged && (<Button_1.default small style={[styles.mt2, styles.alignSelfStart]} onPress={function () { return updateHiddenState(!isHidden); }}>
                                            <Text_1.default style={[styles.buttonSmallText, styles.userSelectNone]} dataSet={_a = {}, _a[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _a}>
                                                {isHidden ? translate('moderation.revealMessage') : translate('moderation.hideMessage')}
                                            </Text_1.default>
                                        </Button_1.default>)}
                                    {/**
                These are the actionable buttons that appear at the bottom of a Concierge message
                for example: Invite a user mentioned but not a member of the room
                https://github.com/Expensify/App/issues/32741
            */}
                                    {actionableItemButtons.length > 0 && (<ActionableItemButtons_1.default items={actionableItemButtons} layout={(0, ReportActionsUtils_1.isActionableTrackExpense)(action) || (0, ReportActionsUtils_1.isConciergeCategoryOptions)(action) ? 'vertical' : 'horizontal'} shouldUseLocalization={!(0, ReportActionsUtils_1.isConciergeCategoryOptions)(action)}/>)}
                                </react_native_1.View>) : (<ReportActionItemMessageEdit_1.default action={action} draftMessage={draftMessage} reportID={reportID} policyID={report === null || report === void 0 ? void 0 : report.policyID} index={index} ref={composerTextInputRef} shouldDisableEmojiPicker={((0, ReportUtils_1.chatIncludesConcierge)(report) && (0, User_1.isBlockedFromConcierge)(blockedFromConcierge)) || (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isArchivedRoom)} isGroupPolicyReport={!!(report === null || report === void 0 ? void 0 : report.policyID) && report.policyID !== CONST_1.default.POLICY.ID_FAKE}/>)}
                        </AttachmentContext_1.AttachmentContext.Provider>
                    </ShowContextMenuContext_1.ShowContextMenuContext.Provider>
                </MentionReportContext_1.default.Provider>);
        }
        var numberOfThreadReplies = (_r = action.childVisibleActionCount) !== null && _r !== void 0 ? _r : 0;
        var shouldDisplayThreadReplies = (0, ReportUtils_1.shouldDisplayThreadReplies)(action, isThreadReportParentAction) && !isOnSearch;
        var oldestFourAccountIDs = (_t = (_s = action.childOldestFourAccountIDs) === null || _s === void 0 ? void 0 : _s.split(',').map(function (accountID) { return Number(accountID); }).filter(function (accountID) { return typeof accountID === 'number'; })) !== null && _t !== void 0 ? _t : [];
        var draftMessageRightAlign = draftMessage !== undefined ? styles.chatItemReactionsDraftRight : {};
        var itemContent = (<>
                {children}
                {Permissions_1.default.canUseLinkPreviews() && !isHidden && ((_v = (_u = action.linkMetadata) === null || _u === void 0 ? void 0 : _u.length) !== null && _v !== void 0 ? _v : 0) > 0 && (<react_native_1.View style={draftMessage !== undefined ? styles.chatItemReactionsDraftRight : {}}>
                        <LinkPreviewer_1.default linkMetadata={(_w = action.linkMetadata) === null || _w === void 0 ? void 0 : _w.filter(function (item) { return !(0, EmptyObject_1.isEmptyObject)(item); })}/>
                    </react_native_1.View>)}
                {!(0, ReportActionsUtils_1.isMessageDeleted)(action) && (<react_native_1.View style={draftMessageRightAlign}>
                        <ReportActionItemEmojiReactions_1.default reportAction={action} emojiReactions={isOnSearch ? {} : emojiReactions} shouldBlockReactions={hasErrors} toggleReaction={function (emoji, ignoreSkinToneOnCompare) {
                    if ((0, Session_1.isAnonymousUser)()) {
                        (0, ReportActionContextMenu_1.hideContextMenu)(false);
                        react_native_1.InteractionManager.runAfterInteractions(function () {
                            (0, Session_1.signOutAndRedirectToSignIn)();
                        });
                    }
                    else {
                        toggleReaction(emoji, ignoreSkinToneOnCompare);
                    }
                }} setIsEmojiPickerActive={setIsEmojiPickerActive}/>
                    </react_native_1.View>)}

                {shouldDisplayThreadReplies && (<react_native_1.View style={draftMessageRightAlign}>
                        <ReportActionItemThread_1.default reportAction={action} reportID={reportID} numberOfReplies={numberOfThreadReplies} mostRecentReply={"".concat(action.childLastVisibleActionCreated)} isHovered={hovered || isContextMenuActive} icons={(0, ReportUtils_1.getIconsForParticipants)(oldestFourAccountIDs, personalDetails)} onSecondaryInteraction={showPopover} isActive={isReportActionActive && !isContextMenuActive}/>
                    </react_native_1.View>)}
            </>);
        return isEmptyHTML(children) ? emptyHTML : itemContent;
    };
    /**
     * Get ReportActionItem with a proper wrapper
     * @param hovered whether the ReportActionItem is hovered
     * @param isWhisper whether the ReportActionItem is a whisper
     * @param hasErrors whether the report action has any errors
     * @returns report action item
     */
    var renderReportActionItem = function (hovered, isWhisper, hasErrors) {
        var content = renderItemContent(hovered || isContextMenuActive || isEmojiPickerActive, isWhisper, hasErrors);
        if (isEmptyHTML(content) || (!shouldRenderViewBasedOnAction && !isClosedExpenseReportWithNoExpenses)) {
            return emptyHTML;
        }
        if (draftMessage !== undefined) {
            return <ReportActionItemDraft_1.default>{content}</ReportActionItemDraft_1.default>;
        }
        if (!displayAsGroup) {
            return (<ReportActionItemSingle_1.default action={action} showHeader={draftMessage === undefined} wrapperStyle={__assign(__assign({}, (isOnSearch && styles.p0)), (isWhisper && styles.pt1))} shouldShowSubscriptAvatar={shouldShowSubscriptAvatar} report={report} iouReport={iouReport} isHovered={hovered || isContextMenuActive} isActive={isReportActionActive && !isContextMenuActive} hasBeenFlagged={![CONST_1.default.MODERATION.MODERATOR_DECISION_APPROVED, CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING].some(function (item) { return item === moderationDecision; }) && !(0, ReportActionsUtils_1.isPendingRemove)(action)} policies={policies}>
                    {content}
                </ReportActionItemSingle_1.default>);
        }
        return <ReportActionItemGrouped_1.default wrapperStyle={isWhisper ? styles.pt1 : {}}>{content}</ReportActionItemGrouped_1.default>;
    };
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED) {
        var transactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(parentReportActionForTransactionThread) ? (_h = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportActionForTransactionThread)) === null || _h === void 0 ? void 0 : _h.IOUTransactionID : undefined;
        return (<ReportActionItemContentCreated_1.default contextValue={contextValue} parentReportAction={parentReportAction} parentReport={parentReport} transactionID={transactionID} draftMessage={draftMessage} shouldHideThreadDividerLine={shouldHideThreadDividerLine}/>);
    }
    if ((0, ReportActionsUtils_1.isTripPreview)(action) && isThreadReportParentAction) {
        return <TripSummary_1.default reportID={(_j = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _j === void 0 ? void 0 : _j.linkedReportID}/>;
    }
    if ((0, ReportActionsUtils_1.isChronosOOOListAction)(action)) {
        return (<ChronosOOOListActions_1.default action={action} reportID={reportID}/>);
    }
    // For the `pay` IOU action on non-pay expense flow, we don't want to render anything if `isWaitingOnBankAccount` is true
    // Otherwise, we will see two system messages informing the payee needs to add a bank account or wallet
    if ((0, ReportActionsUtils_1.isMoneyRequestAction)(action) && !!(report === null || report === void 0 ? void 0 : report.isWaitingOnBankAccount) && ((_k = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _k === void 0 ? void 0 : _k.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY && !isSendingMoney) {
        return null;
    }
    // We currently send whispers to all report participants and hide them in the UI for users that shouldn't see them.
    // This is a temporary solution needed for comment-linking.
    // The long term solution will leverage end-to-end encryption and only targeted users will be able to decrypt.
    if ((0, ReportActionsUtils_1.isWhisperActionTargetedToOthers)(action)) {
        return null;
    }
    var hasErrors = !(0, EmptyObject_1.isEmptyObject)(action.errors);
    var whisperedTo = (0, ReportActionsUtils_1.getWhisperedTo)(action);
    var isMultipleParticipant = whisperedTo.length > 1;
    var iouReportID = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) && ((_l = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _l === void 0 ? void 0 : _l.IOUReportID) ? (_o = (_m = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _m === void 0 ? void 0 : _m.IOUReportID) === null || _o === void 0 ? void 0 : _o.toString() : undefined;
    var transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    var isWhisper = whisperedTo.length > 0 && transactionsWithReceipts.length === 0;
    var whisperedToPersonalDetails = isWhisper
        ? Object.values(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}).filter(function (details) { var _a; return whisperedTo.includes((_a = details === null || details === void 0 ? void 0 : details.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID); })
        : [];
    var isWhisperOnlyVisibleByUser = isWhisper && isCurrentUserTheOnlyParticipant(whisperedTo);
    var displayNamesWithTooltips = isWhisper ? (0, ReportUtils_1.getDisplayNamesWithTooltips)(whisperedToPersonalDetails, isMultipleParticipant) : [];
    var renderSearchHeader = function (children) {
        if (!isOnSearch) {
            return children;
        }
        return (<react_native_1.View style={[styles.p4]}>
                <react_native_1.View style={styles.webViewStyles.tagStyles.ol}>
                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, !isWhisper ? styles.mb3 : {}]}>
                        <Text_1.default style={styles.chatItemMessageHeaderPolicy}>{translate('common.in')}&nbsp;</Text_1.default>
                        <TextLink_1.default fontSize={variables_1.default.fontSizeSmall} onPress={function () {
                onPress === null || onPress === void 0 ? void 0 : onPress();
            }} numberOfLines={1}>
                            {(0, ReportUtils_1.getChatListItemReportName)(action, report)}
                        </TextLink_1.default>
                    </react_native_1.View>
                    {children}
                </react_native_1.View>
            </react_native_1.View>);
    };
    return (<PressableWithSecondaryInteraction_1.default ref={popoverAnchorRef} onPress={function () {
            if (draftMessage === undefined) {
                onPress === null || onPress === void 0 ? void 0 : onPress();
            }
            if (!react_native_1.Keyboard.isVisible()) {
                return;
            }
            react_native_1.Keyboard.dismiss();
        }} style={[action.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isDeletedParentAction ? styles.pointerEventsNone : styles.pointerEventsAuto]} onPressIn={function () { return shouldUseNarrowLayout && (0, DeviceCapabilities_1.canUseTouchScreen)() && ControlSelection_1.default.block(); }} onPressOut={function () { return ControlSelection_1.default.unblock(); }} onSecondaryInteraction={showPopover} preventDefaultContextMenu={draftMessage === undefined && !hasErrors} withoutFocusOnSecondaryInteraction accessibilityLabel={translate('accessibilityHints.chatMessage')} accessible>
            <Hoverable_1.default shouldHandleScroll isDisabled={draftMessage !== undefined} shouldFreezeCapture={isPaymentMethodPopoverActive} onHoverIn={function () {
            setIsReportActionActive(false);
        }} onHoverOut={function () {
            setIsReportActionActive(!!isReportActionLinked);
        }}>
                {function (hovered) {
            var _a, _b;
            return (<react_native_1.View style={highlightedBackgroundColorIfNeeded}>
                        {shouldDisplayNewMarker && (!shouldUseThreadDividerLine || !isFirstVisibleReportAction) && <UnreadActionIndicator_1.default reportActionID={action.reportActionID}/>}
                        {shouldDisplayContextMenu && (<MiniReportActionContextMenu_1.default reportID={reportID} reportActionID={action.reportActionID} anchor={popoverAnchorRef} originalReportID={originalReportID} isArchivedRoom={isArchivedRoom} displayAsGroup={displayAsGroup} disabledActions={disabledActions} isVisible={hovered && draftMessage === undefined && !hasErrors} isThreadReportParentAction={isThreadReportParentAction} draftMessage={draftMessage} isChronosReport={isChronosReport} checkIfContextMenuActive={toggleContextMenuFromActiveReportAction} setIsEmojiPickerActive={setIsEmojiPickerActive}/>)}
                        <react_native_1.View style={StyleUtils.getReportActionItemStyle(hovered || isWhisper || isContextMenuActive || !!isEmojiPickerActive || draftMessage !== undefined || isPaymentMethodPopoverActive, draftMessage === undefined && !!onPress)}>
                            <OfflineWithFeedback_1.default onClose={onClose} dismissError={dismissError} 
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            pendingAction={draftMessage !== undefined ? undefined : ((_a = action.pendingAction) !== null && _a !== void 0 ? _a : (action.isOptimisticAction ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD : undefined))} shouldHideOnDelete={!isDeletedParentAction} errors={(linkedTransactionRouteError !== null && linkedTransactionRouteError !== void 0 ? linkedTransactionRouteError : !isOnSearch) ? (0, ErrorUtils_1.getLatestErrorMessageField)(action) : {}} errorRowStyles={[styles.ml10, styles.mr2]} needsOffscreenAlphaCompositing={(0, ReportActionsUtils_1.isMoneyRequestAction)(action)} shouldDisableStrikeThrough>
                                {renderSearchHeader(<>
                                        {isWhisper && (<react_native_1.View style={[styles.flexRow, styles.pl5, styles.pt2, styles.pr3]}>
                                                <react_native_1.View style={[styles.pl6, styles.mr3]}>
                                                    <Icon_1.default fill={theme.icon} src={Expensicons_1.Eye} small/>
                                                </react_native_1.View>
                                                <Text_1.default style={[styles.chatItemMessageHeaderTimestamp]}>
                                                    {translate('reportActionContextMenu.onlyVisible')}
                                                    &nbsp;
                                                </Text_1.default>
                                                <DisplayNames_1.default fullTitle={(_b = (0, ReportUtils_1.getWhisperDisplayNames)(whisperedTo)) !== null && _b !== void 0 ? _b : ''} displayNamesWithTooltips={displayNamesWithTooltips} tooltipEnabled numberOfLines={1} textStyles={[styles.chatItemMessageHeaderTimestamp, styles.flex1]} shouldUseFullTitle={isWhisperOnlyVisibleByUser}/>
                                            </react_native_1.View>)}
                                        {renderReportActionItem(!!hovered || !!isReportActionLinked, isWhisper, hasErrors)}
                                    </>)}
                            </OfflineWithFeedback_1.default>
                        </react_native_1.View>
                    </react_native_1.View>);
        }}
            </Hoverable_1.default>
            <react_native_1.View style={styles.reportActionSystemMessageContainer}>
                <InlineSystemMessage_1.default message={action.error}/>
            </react_native_1.View>
            <ConfirmModal_1.default isVisible={showConfirmDismissReceiptError} onConfirm={function () {
            dismissError();
            setShowConfirmDismissReceiptError(false);
        }} onCancel={function () {
            setShowConfirmDismissReceiptError(false);
        }} title={translate('iou.dismissReceiptError')} prompt={translate('iou.dismissReceiptErrorConfirmation')} confirmText={translate('common.dismiss')} cancelText={translate('common.cancel')} shouldShowCancelButton danger/>
        </PressableWithSecondaryInteraction_1.default>);
}
exports.default = (0, react_1.memo)(PureReportActionItem, function (prevProps, nextProps) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
    var prevParentReportAction = prevProps.parentReportAction;
    var nextParentReportAction = nextProps.parentReportAction;
    return (prevProps.displayAsGroup === nextProps.displayAsGroup &&
        prevProps.isMostRecentIOUReportAction === nextProps.isMostRecentIOUReportAction &&
        prevProps.shouldDisplayNewMarker === nextProps.shouldDisplayNewMarker &&
        (0, fast_equals_1.deepEqual)(prevProps.action, nextProps.action) &&
        (0, fast_equals_1.deepEqual)((_a = prevProps.report) === null || _a === void 0 ? void 0 : _a.pendingFields, (_b = nextProps.report) === null || _b === void 0 ? void 0 : _b.pendingFields) &&
        (0, fast_equals_1.deepEqual)((_c = prevProps.report) === null || _c === void 0 ? void 0 : _c.isDeletedParentAction, (_d = nextProps.report) === null || _d === void 0 ? void 0 : _d.isDeletedParentAction) &&
        (0, fast_equals_1.deepEqual)((_e = prevProps.report) === null || _e === void 0 ? void 0 : _e.errorFields, (_f = nextProps.report) === null || _f === void 0 ? void 0 : _f.errorFields) &&
        ((_g = prevProps.report) === null || _g === void 0 ? void 0 : _g.statusNum) === ((_h = nextProps.report) === null || _h === void 0 ? void 0 : _h.statusNum) &&
        ((_j = prevProps.report) === null || _j === void 0 ? void 0 : _j.stateNum) === ((_k = nextProps.report) === null || _k === void 0 ? void 0 : _k.stateNum) &&
        ((_l = prevProps.report) === null || _l === void 0 ? void 0 : _l.parentReportID) === ((_m = nextProps.report) === null || _m === void 0 ? void 0 : _m.parentReportID) &&
        ((_o = prevProps.report) === null || _o === void 0 ? void 0 : _o.parentReportActionID) === ((_p = nextProps.report) === null || _p === void 0 ? void 0 : _p.parentReportActionID) &&
        // TaskReport's created actions render the TaskView, which updates depending on certain fields in the TaskReport
        (0, ReportUtils_1.isTaskReport)(prevProps.report) === (0, ReportUtils_1.isTaskReport)(nextProps.report) &&
        prevProps.action.actionName === nextProps.action.actionName &&
        ((_q = prevProps.report) === null || _q === void 0 ? void 0 : _q.reportName) === ((_r = nextProps.report) === null || _r === void 0 ? void 0 : _r.reportName) &&
        ((_s = prevProps.report) === null || _s === void 0 ? void 0 : _s.description) === ((_t = nextProps.report) === null || _t === void 0 ? void 0 : _t.description) &&
        (0, ReportUtils_1.isCompletedTaskReport)(prevProps.report) === (0, ReportUtils_1.isCompletedTaskReport)(nextProps.report) &&
        ((_u = prevProps.report) === null || _u === void 0 ? void 0 : _u.managerID) === ((_v = nextProps.report) === null || _v === void 0 ? void 0 : _v.managerID) &&
        prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine &&
        ((_w = prevProps.report) === null || _w === void 0 ? void 0 : _w.total) === ((_x = nextProps.report) === null || _x === void 0 ? void 0 : _x.total) &&
        ((_y = prevProps.report) === null || _y === void 0 ? void 0 : _y.nonReimbursableTotal) === ((_z = nextProps.report) === null || _z === void 0 ? void 0 : _z.nonReimbursableTotal) &&
        ((_0 = prevProps.report) === null || _0 === void 0 ? void 0 : _0.policyAvatar) === ((_1 = nextProps.report) === null || _1 === void 0 ? void 0 : _1.policyAvatar) &&
        prevProps.linkedReportActionID === nextProps.linkedReportActionID &&
        (0, fast_equals_1.deepEqual)((_2 = prevProps.report) === null || _2 === void 0 ? void 0 : _2.fieldList, (_3 = nextProps.report) === null || _3 === void 0 ? void 0 : _3.fieldList) &&
        (0, fast_equals_1.deepEqual)(prevProps.transactionThreadReport, nextProps.transactionThreadReport) &&
        (0, fast_equals_1.deepEqual)(prevProps.reportActions, nextProps.reportActions) &&
        (0, fast_equals_1.deepEqual)(prevParentReportAction, nextParentReportAction) &&
        prevProps.draftMessage === nextProps.draftMessage &&
        ((_4 = prevProps.iouReport) === null || _4 === void 0 ? void 0 : _4.reportID) === ((_5 = nextProps.iouReport) === null || _5 === void 0 ? void 0 : _5.reportID) &&
        (0, fast_equals_1.deepEqual)(prevProps.emojiReactions, nextProps.emojiReactions) &&
        (0, fast_equals_1.deepEqual)(prevProps.linkedTransactionRouteError, nextProps.linkedTransactionRouteError) &&
        prevProps.isUserValidated === nextProps.isUserValidated &&
        ((_6 = prevProps.parentReport) === null || _6 === void 0 ? void 0 : _6.reportID) === ((_7 = nextProps.parentReport) === null || _7 === void 0 ? void 0 : _7.reportID) &&
        (0, fast_equals_1.deepEqual)(prevProps.personalDetails, nextProps.personalDetails) &&
        (0, fast_equals_1.deepEqual)(prevProps.blockedFromConcierge, nextProps.blockedFromConcierge) &&
        prevProps.originalReportID === nextProps.originalReportID &&
        prevProps.isArchivedRoom === nextProps.isArchivedRoom &&
        prevProps.isChronosReport === nextProps.isChronosReport &&
        prevProps.isClosedExpenseReportWithNoExpenses === nextProps.isClosedExpenseReportWithNoExpenses &&
        (0, fast_equals_1.deepEqual)(prevProps.missingPaymentMethod, nextProps.missingPaymentMethod) &&
        prevProps.reimbursementDeQueuedOrCanceledActionMessage === nextProps.reimbursementDeQueuedOrCanceledActionMessage &&
        prevProps.modifiedExpenseMessage === nextProps.modifiedExpenseMessage &&
        prevProps.userBillingFundID === nextProps.userBillingFundID);
});
