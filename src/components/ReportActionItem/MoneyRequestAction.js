"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var RenderHTML_1 = require("@components/RenderHTML");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var TransactionPreview_1 = require("./TransactionPreview");
function MoneyRequestAction(_a) {
    var action = _a.action, chatReportID = _a.chatReportID, requestReportID = _a.requestReportID, reportID = _a.reportID, isMostRecentIOUReportAction = _a.isMostRecentIOUReportAction, contextMenuAnchor = _a.contextMenuAnchor, _b = _a.checkIfContextMenuActive, checkIfContextMenuActive = _b === void 0 ? function () { } : _b, _c = _a.isHovered, isHovered = _c === void 0 ? false : _c, style = _a.style, _d = _a.isWhisper, isWhisper = _d === void 0 ? false : _d, _e = _a.shouldDisplayContextMenu, shouldDisplayContextMenu = _e === void 0 ? true : _e;
    var chatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReportID), { canBeMissing: true })[0];
    var iouReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(requestReportID), { canBeMissing: true })[0];
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReportID), { canEvict: false, canBeMissing: true })[0];
    var StyleUtils = (0, useStyleUtils_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var route = (0, native_1.useRoute)();
    var isReviewDuplicateTransactionPage = route.name === SCREENS_1.default.TRANSACTION_DUPLICATE.REVIEW;
    var isSplitBillAction = (0, ReportActionsUtils_1.isSplitBillAction)(action);
    var isTrackExpenseAction = (0, ReportActionsUtils_1.isTrackExpenseAction)(action);
    var containerStyles = (0, react_1.useMemo)(function () { return [styles.cursorPointer, isHovered ? styles.reportPreviewBoxHoverBorder : undefined, style]; }, [isHovered, style, styles.cursorPointer, styles.reportPreviewBoxHoverBorder]);
    var reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, 1, undefined, undefined);
    var onMoneyRequestPreviewPressed = function () {
        var _a, _b;
        if ((_a = ReportActionContextMenu_1.contextMenuRef.current) === null || _a === void 0 ? void 0 : _a.isContextMenuOpening) {
            return;
        }
        if (isSplitBillAction) {
            Navigation_1.default.navigate(ROUTES_1.default.SPLIT_BILL_DETAILS.getRoute(chatReportID, action.reportActionID, Navigation_1.default.getReportRHPActiveRoute()));
            return;
        }
        // In case the childReportID is not present it probably means the transaction thread was not created yet,
        // so we need to send the parentReportActionID and the transactionID to the route so we can call OpenReport correctly
        var transactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) ? (_b = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID : CONST_1.default.DEFAULT_NUMBER_ID;
        if (!(action === null || action === void 0 ? void 0 : action.childReportID) && transactionID && action.reportActionID) {
            var optimisticReportID = (0, ReportUtils_1.generateReportID)();
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(optimisticReportID, undefined, undefined, action.reportActionID, transactionID, Navigation_1.default.getActiveRoute()));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(action === null || action === void 0 ? void 0 : action.childReportID, undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute()));
    };
    var shouldShowPendingConversionMessage = false;
    var isDeletedParentAction = (0, ReportActionsUtils_1.isDeletedParentAction)(action);
    var isReversedTransaction = (0, ReportActionsUtils_1.isReversedTransaction)(action);
    if (!(0, EmptyObject_1.isEmptyObject)(iouReport) &&
        !(0, EmptyObject_1.isEmptyObject)(reportActions) &&
        (chatReport === null || chatReport === void 0 ? void 0 : chatReport.iouReportID) &&
        isMostRecentIOUReportAction &&
        action.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
        isOffline) {
        shouldShowPendingConversionMessage = (0, IOUUtils_1.isIOUReportPendingCurrencyConversion)(iouReport);
    }
    if (isDeletedParentAction || isReversedTransaction) {
        var message = void 0;
        if (isReversedTransaction) {
            message = 'parentReportAction.reversedTransaction';
        }
        else {
            message = 'parentReportAction.deletedExpense';
        }
        return <RenderHTML_1.default html={"<deleted-action ".concat(CONST_1.default.REVERSED_TRANSACTION_ATTRIBUTE, "=\"").concat(isReversedTransaction, "\">").concat(translate(message), "</deleted-action>")}/>;
    }
    if ((0, isEmpty_1.default)(iouReport) && !(isSplitBillAction || isTrackExpenseAction)) {
        return null;
    }
    return (<TransactionPreview_1.default iouReportID={requestReportID} chatReportID={chatReportID} reportID={reportID} action={action} transactionPreviewWidth={reportPreviewStyles.transactionPreviewStandaloneStyle.width} isBillSplit={isSplitBillAction} isTrackExpense={isTrackExpenseAction} contextMenuAnchor={contextMenuAnchor} checkIfContextMenuActive={checkIfContextMenuActive} shouldShowPendingConversionMessage={shouldShowPendingConversionMessage} onPreviewPressed={onMoneyRequestPreviewPressed} containerStyles={[reportPreviewStyles.transactionPreviewStandaloneStyle, isReviewDuplicateTransactionPage ? [containerStyles, styles.borderNone] : styles.mt2]} isHovered={isHovered} isWhisper={isWhisper} shouldDisplayContextMenu={shouldDisplayContextMenu}/>);
}
MoneyRequestAction.displayName = 'MoneyRequestAction';
exports.default = MoneyRequestAction;
