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
var react_1 = require("react");
var react_native_1 = require("react-native");
var ActionSheetAwareScrollView = require("@components/ActionSheetAwareScrollView");
var ContextMenuItem_1 = require("@components/ContextMenuItem");
var FocusTrapForModal_1 = require("@components/FocusTrap/FocusTrapForModal");
var useArrowKeyFocusManager_1 = require("@hooks/useArrowKeyFocusManager");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePaginatedReportActions_1 = require("@hooks/usePaginatedReportActions");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useRestoreInputFocus_1 = require("@hooks/useRestoreInputFocus");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var CardMessageUtils_1 = require("@libs/CardMessageUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var shouldEnableContextMenuEnterShortcut_1 = require("@libs/shouldEnableContextMenuEnterShortcut");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ContextMenuActions_1 = require("./ContextMenuActions");
var ReportActionContextMenu_1 = require("./ReportActionContextMenu");
function BaseReportActionContextMenu(_a) {
    var _b;
    var _c = _a.type, type = _c === void 0 ? CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION : _c, anchor = _a.anchor, contentRef = _a.contentRef, _d = _a.isChronosReport, isChronosReport = _d === void 0 ? false : _d, _e = _a.isArchivedRoom, isArchivedRoom = _e === void 0 ? false : _e, _f = _a.isMini, isMini = _f === void 0 ? false : _f, _g = _a.isVisible, isVisible = _g === void 0 ? false : _g, _h = _a.isPinnedChat, isPinnedChat = _h === void 0 ? false : _h, _j = _a.isUnreadChat, isUnreadChat = _j === void 0 ? false : _j, _k = _a.isThreadReportParentAction, isThreadReportParentAction = _k === void 0 ? false : _k, _l = _a.selection, selection = _l === void 0 ? '' : _l, _m = _a.draftMessage, draftMessage = _m === void 0 ? '' : _m, reportActionID = _a.reportActionID, reportID = _a.reportID, originalReportID = _a.originalReportID, checkIfContextMenuActive = _a.checkIfContextMenuActive, _o = _a.disabledActions, disabledActions = _o === void 0 ? [] : _o, setIsEmojiPickerActive = _a.setIsEmojiPickerActive;
    var actionSheetAwareScrollViewContext = (0, react_1.useContext)(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _p = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _p.shouldUseNarrowLayout, isSmallScreenWidth = _p.isSmallScreenWidth;
    var menuItemRefs = (0, react_1.useRef)({});
    var _q = (0, react_1.useState)(false), shouldKeepOpen = _q[0], setShouldKeepOpen = _q[1];
    var wrapperStyle = StyleUtils.getReportActionContextMenuStyles(isMini, shouldUseNarrowLayout);
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isProduction = (0, useEnvironment_1.default)().isProduction;
    var threeDotRef = (0, react_1.useRef)(null);
    var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: true })[0];
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(originalReportID), {
        canBeMissing: true,
        canEvict: false,
    })[0];
    var transactionID = (0, ReportActionsUtils_1.getLinkedTransactionID)(reportActionID, reportID);
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: true })[0];
    var originalReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(originalReportID), { canBeMissing: true })[0];
    var isOriginalReportArchived = (0, useReportIsArchived_1.default)(originalReportID);
    var policyID = report === null || report === void 0 ? void 0 : report.policyID;
    var reportAction = (0, react_1.useMemo)(function () {
        if ((0, EmptyObject_1.isEmptyObject)(reportActions) || reportActionID === '0' || reportActionID === '-1' || !reportActionID) {
            return;
        }
        return reportActions[reportActionID];
    }, [reportActions, reportActionID]);
    var sourceID = (0, ReportUtils_1.getSourceIDFromReportAction)(reportAction);
    var download = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.DOWNLOAD).concat(sourceID), { canBeMissing: true })[0];
    var childReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID), { canBeMissing: true })[0];
    var childChatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(childReport === null || childReport === void 0 ? void 0 : childReport.chatReportID), { canBeMissing: true })[0];
    var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(childReport === null || childReport === void 0 ? void 0 : childReport.parentReportID, childReport === null || childReport === void 0 ? void 0 : childReport.parentReportActionID);
    var paginatedReportActions = (0, usePaginatedReportActions_1.default)(childReport === null || childReport === void 0 ? void 0 : childReport.reportID).reportActions;
    var transactionThreadReportID = (0, react_1.useMemo)(function () { return (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(childReport, childChatReport, paginatedReportActions !== null && paginatedReportActions !== void 0 ? paginatedReportActions : [], isOffline); }, [paginatedReportActions, isOffline, childReport, childChatReport]);
    var transactionThreadReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID), { canBeMissing: true })[0];
    var isMoneyRequestReport = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isMoneyRequestReport)(childReport); }, [childReport]);
    var isInvoiceReport = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isInvoiceReport)(childReport); }, [childReport]);
    var requestParentReportAction = (0, react_1.useMemo)(function () {
        if (isMoneyRequestReport || isInvoiceReport) {
            if (!paginatedReportActions || !(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportActionID)) {
                return undefined;
            }
            return paginatedReportActions.find(function (action) { return action.reportActionID === transactionThreadReport.parentReportActionID; });
        }
        return parentReportAction;
    }, [parentReportAction, isMoneyRequestReport, isInvoiceReport, paginatedReportActions, transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportActionID]);
    var moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
    var isChildReportArchived = (0, useReportIsArchived_1.default)(childReport === null || childReport === void 0 ? void 0 : childReport.reportID);
    var isParentReportArchived = (0, useReportIsArchived_1.default)(childReport === null || childReport === void 0 ? void 0 : childReport.parentReportID);
    var parentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(childReport === null || childReport === void 0 ? void 0 : childReport.parentReportID), { canBeMissing: true })[0];
    var iouTransactionID = (_b = (0, ReportActionsUtils_1.getOriginalMessage)(moneyRequestAction !== null && moneyRequestAction !== void 0 ? moneyRequestAction : reportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID;
    var iouTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(iouTransactionID), { canBeMissing: true })[0];
    var isMoneyRequest = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isMoneyRequest)(childReport); }, [childReport]);
    var isTrackExpenseReport = (0, ReportUtils_1.isTrackExpenseReport)(childReport);
    var isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    var isMoneyRequestOrReport = isMoneyRequestReport || isSingleTransactionView;
    var areHoldRequirementsMet = !isInvoiceReport &&
        isMoneyRequestOrReport &&
        !(0, ReportUtils_1.isArchivedNonExpenseReport)(transactionThreadReportID ? childReport : parentReport, transactionThreadReportID ? isChildReportArchived : isParentReportArchived);
    var shouldEnableArrowNavigation = !isMini && (isVisible || shouldKeepOpen);
    var filteredContextMenuActions = ContextMenuActions_1.default.filter(function (contextAction) {
        return !disabledActions.includes(contextAction) &&
            contextAction.shouldShow({
                type: type,
                reportAction: reportAction,
                isArchivedRoom: isArchivedRoom,
                betas: betas,
                menuTarget: anchor,
                isChronosReport: isChronosReport,
                reportID: reportID,
                isPinnedChat: isPinnedChat,
                isUnreadChat: isUnreadChat,
                isThreadReportParentAction: isThreadReportParentAction,
                isOffline: !!isOffline,
                isMini: isMini,
                isProduction: isProduction,
                moneyRequestAction: moneyRequestAction,
                areHoldRequirementsMet: areHoldRequirementsMet,
                account: account,
                iouTransaction: iouTransaction,
            });
    });
    if (isMini) {
        var menuAction = filteredContextMenuActions.at(-1);
        var otherActions = filteredContextMenuActions.slice(0, -1);
        if (otherActions.length > CONST_1.default.MINI_CONTEXT_MENU_MAX_ITEMS && menuAction) {
            filteredContextMenuActions = otherActions.slice(0, CONST_1.default.MINI_CONTEXT_MENU_MAX_ITEMS - 1);
            filteredContextMenuActions.push(menuAction);
        }
        else {
            filteredContextMenuActions = otherActions;
        }
    }
    // Context menu actions that are not rendered as menu items are excluded from arrow navigation
    var nonMenuItemActionIndexes = filteredContextMenuActions.map(function (contextAction, index) {
        return 'renderContent' in contextAction && typeof contextAction.renderContent === 'function' ? index : undefined;
    });
    var disabledIndexes = nonMenuItemActionIndexes.filter(function (index) { return index !== undefined; });
    var _r = (0, useArrowKeyFocusManager_1.default)({
        initialFocusedIndex: -1,
        disabledIndexes: disabledIndexes,
        maxIndex: filteredContextMenuActions.length - 1,
        isActive: shouldEnableArrowNavigation,
    }), focusedIndex = _r[0], setFocusedIndex = _r[1];
    /**
     * Checks if user is anonymous. If true and the action doesn't accept for anonymous user, hides the context menu and
     * shows the sign in modal. Else, executes the callback.
     */
    var interceptAnonymousUser = function (callback, isAnonymousAction) {
        if (isAnonymousAction === void 0) { isAnonymousAction = false; }
        if ((0, Session_1.isAnonymousUser)() && !isAnonymousAction) {
            (0, ReportActionContextMenu_1.hideContextMenu)(false);
            react_native_1.InteractionManager.runAfterInteractions(function () {
                (0, Session_1.signOutAndRedirectToSignIn)();
            });
        }
        else {
            callback();
        }
    };
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ENTER, function (event) {
        var _a, _b;
        if (!menuItemRefs.current[focusedIndex]) {
            return;
        }
        // Ensures the event does not cause side-effects beyond the context menu, e.g. when an outside element is focused
        if (event) {
            event.stopPropagation();
        }
        (_b = (_a = menuItemRefs.current[focusedIndex]) === null || _a === void 0 ? void 0 : _a.triggerPressAndUpdateSuccess) === null || _b === void 0 ? void 0 : _b.call(_a);
        setFocusedIndex(-1);
    }, { isActive: shouldEnableArrowNavigation && shouldEnableContextMenuEnterShortcut_1.default, shouldPreventDefault: false });
    (0, useRestoreInputFocus_1.default)(isVisible);
    var openOverflowMenu = function (event, anchorRef) {
        (0, ReportActionContextMenu_1.showContextMenu)({
            type: CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event: event,
            selection: selection,
            contextMenuAnchor: anchorRef === null || anchorRef === void 0 ? void 0 : anchorRef.current,
            report: {
                reportID: reportID,
                originalReportID: originalReportID,
                isArchivedRoom: (0, ReportUtils_1.isArchivedNonExpenseReport)(originalReport, isOriginalReportArchived),
                isChronos: (0, ReportUtils_1.chatIncludesChronosWithID)(originalReportID),
            },
            reportAction: {
                reportActionID: reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID,
                draftMessage: draftMessage,
                isThreadReportParentAction: isThreadReportParentAction,
            },
            callbacks: {
                onShow: checkIfContextMenuActive,
                onHide: function () {
                    checkIfContextMenuActive === null || checkIfContextMenuActive === void 0 ? void 0 : checkIfContextMenuActive();
                    setShouldKeepOpen(false);
                },
            },
            disabledOptions: filteredContextMenuActions,
            shouldCloseOnTarget: true,
            isOverflowMenu: true,
        });
    };
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    var card = (0, CardMessageUtils_1.getExpensifyCardFromReportAction)({ reportAction: (reportAction !== null && reportAction !== void 0 ? reportAction : null), policyID: policyID });
    return ((isVisible || shouldKeepOpen || !isMini) && (<FocusTrapForModal_1.default active={!isMini && !isSmallScreenWidth}>
                <react_native_1.View ref={contentRef} style={wrapperStyle}>
                    {filteredContextMenuActions.map(function (contextAction, index) {
            var _a, _b;
            var closePopup = !isMini;
            var payload = {
                // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                reportAction: (reportAction !== null && reportAction !== void 0 ? reportAction : null),
                reportID: reportID,
                report: report,
                draftMessage: draftMessage,
                selection: selection,
                close: function () { return setShouldKeepOpen(false); },
                transitionActionSheetState: actionSheetAwareScrollViewContext.transitionActionSheetState,
                openContextMenu: function () { return setShouldKeepOpen(true); },
                interceptAnonymousUser: interceptAnonymousUser,
                openOverflowMenu: openOverflowMenu,
                setIsEmojiPickerActive: setIsEmojiPickerActive,
                moneyRequestAction: moneyRequestAction,
                card: card,
            };
            if ('renderContent' in contextAction) {
                return contextAction.renderContent(closePopup, payload);
            }
            var textTranslateKey = contextAction.textTranslateKey;
            var isKeyInActionUpdateKeys = textTranslateKey === 'reportActionContextMenu.editAction' ||
                textTranslateKey === 'reportActionContextMenu.deleteAction' ||
                textTranslateKey === 'reportActionContextMenu.deleteConfirmation';
            var text = textTranslateKey && (isKeyInActionUpdateKeys ? translate(textTranslateKey, { action: moneyRequestAction !== null && moneyRequestAction !== void 0 ? moneyRequestAction : reportAction }) : translate(textTranslateKey));
            var transactionPayload = textTranslateKey === 'reportActionContextMenu.copyToClipboard' && transaction && { transaction: transaction };
            var isMenuAction = textTranslateKey === 'reportActionContextMenu.menu';
            return (<ContextMenuItem_1.default ref={function (ref) {
                    menuItemRefs.current[index] = ref;
                }} buttonRef={isMenuAction ? threeDotRef : { current: null }} icon={contextAction.icon} text={text !== null && text !== void 0 ? text : ''} successIcon={contextAction.successIcon} successText={contextAction.successTextTranslateKey ? translate(contextAction.successTextTranslateKey) : undefined} isMini={isMini} key={contextAction.textTranslateKey} onPress={function (event) {
                    return interceptAnonymousUser(function () { var _a; return (_a = contextAction.onPress) === null || _a === void 0 ? void 0 : _a.call(contextAction, closePopup, __assign(__assign(__assign(__assign({}, payload), transactionPayload), { event: event }), (isMenuAction ? { anchorRef: threeDotRef } : {}))); }, contextAction.isAnonymousAction);
                }} description={(_b = (_a = contextAction.getDescription) === null || _a === void 0 ? void 0 : _a.call(contextAction, selection)) !== null && _b !== void 0 ? _b : ''} isAnonymousAction={contextAction.isAnonymousAction} isFocused={focusedIndex === index} shouldPreventDefaultFocusOnPress={contextAction.shouldPreventDefaultFocusOnPress} onFocus={function () { return setFocusedIndex(index); }} onBlur={function () { return (index === filteredContextMenuActions.length - 1 || index === 1) && setFocusedIndex(-1); }} disabled={(contextAction === null || contextAction === void 0 ? void 0 : contextAction.shouldDisable) ? contextAction === null || contextAction === void 0 ? void 0 : contextAction.shouldDisable(download) : false} shouldShowLoadingSpinnerIcon={(contextAction === null || contextAction === void 0 ? void 0 : contextAction.shouldDisable) ? contextAction === null || contextAction === void 0 ? void 0 : contextAction.shouldDisable(download) : false}/>);
        })}
                </react_native_1.View>
            </FocusTrapForModal_1.default>));
}
exports.default = (0, react_1.memo)(BaseReportActionContextMenu, fast_equals_1.deepEqual);
