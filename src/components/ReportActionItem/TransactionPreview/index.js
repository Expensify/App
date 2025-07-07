"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var ControlSelection_1 = require("@libs/ControlSelection");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionPreviewUtils_1 = require("@libs/TransactionPreviewUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var PaymentMethods_1 = require("@userActions/PaymentMethods");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var TransactionPreviewContent_1 = require("./TransactionPreviewContent");
function TransactionPreview(props) {
    var _a, _b, _c;
    var translate = (0, useLocalize_1.default)().translate;
    var action = props.action, chatReportID = props.chatReportID, reportID = props.reportID, contextMenuAnchor = props.contextMenuAnchor, _d = props.checkIfContextMenuActive, checkIfContextMenuActive = _d === void 0 ? function () { } : _d, shouldDisplayContextMenu = props.shouldDisplayContextMenu, iouReportID = props.iouReportID, transactionIDFromProps = props.transactionID, onPreviewPressed = props.onPreviewPressed, reportPreviewAction = props.reportPreviewAction, contextAction = props.contextAction;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReportID), { canBeMissing: true })[0];
    var route = (0, native_1.useRoute)();
    var isMoneyRequestAction = (0, ReportActionsUtils_1.isMoneyRequestAction)(action);
    var transactionID = transactionIDFromProps !== null && transactionIDFromProps !== void 0 ? transactionIDFromProps : (isMoneyRequestAction ? (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID : null);
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var violations = (0, useTransactionViolations_1.default)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var chatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReportID), { canBeMissing: true })[0];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: true })[0];
    // Get transaction violations for given transaction id from onyx, find duplicated transactions violations and get duplicates
    var allDuplicateIDs = (0, react_1.useMemo)(function () { var _a, _b, _c; return (_c = (_b = (_a = violations === null || violations === void 0 ? void 0 : violations.find(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; })) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.duplicates) !== null && _c !== void 0 ? _c : []; }, [violations]);
    var allDuplicates = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION), {
        selector: function (allTransactions) { return allDuplicateIDs.map(function (id) { return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id)]; }); },
        canBeMissing: true,
    })[0];
    var duplicates = (0, react_1.useMemo)(function () { return (0, TransactionUtils_1.removeSettledAndApprovedTransactions)(allDuplicates !== null && allDuplicates !== void 0 ? allDuplicates : []); }, [allDuplicates]);
    var sessionAccountID = session === null || session === void 0 ? void 0 : session.accountID;
    var areThereDuplicates = allDuplicateIDs.length > 0 && duplicates.length > 0 && allDuplicateIDs.length === duplicates.length;
    var transactionDetails = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.getTransactionDetails)(transaction); }, [transaction]);
    var _e = transactionDetails !== null && transactionDetails !== void 0 ? transactionDetails : {}, requestAmount = _e.amount, requestCurrency = _e.currency;
    var showContextMenu = function (event) {
        if (!shouldDisplayContextMenu) {
            return;
        }
        (0, ShowContextMenuContext_1.showContextMenuForReport)(event, contextMenuAnchor, contextAction ? chatReportID : reportID, contextAction !== null && contextAction !== void 0 ? contextAction : action, checkIfContextMenuActive);
    };
    var offlineWithFeedbackOnClose = (0, react_1.useCallback)(function () {
        (0, PaymentMethods_1.clearWalletTermsError)();
        (0, Report_1.clearIOUError)(chatReportID);
    }, [chatReportID]);
    var navigateToReviewFields = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate((0, TransactionPreviewUtils_1.getReviewNavigationRoute)(route, transaction, duplicates));
    }, [route, transaction, duplicates]);
    var transactionPreview = transaction;
    var _f = (0, TransactionUtils_1.getOriginalTransactionWithSplitInfo)(transaction), originalTransaction = _f.originalTransaction, isBillSplit = _f.isBillSplit;
    if (isBillSplit) {
        transactionPreview = originalTransaction;
    }
    // See description of `transactionRawAmount` prop for more context
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var transactionRawAmount = (_b = ((transaction === null || transaction === void 0 ? void 0 : transaction.modifiedAmount) || (transaction === null || transaction === void 0 ? void 0 : transaction.amount))) !== null && _b !== void 0 ? _b : 0;
    var iouAction = isBillSplit && originalTransaction ? ((_c = (0, ReportActionsUtils_1.getIOUActionForReportID)(chatReportID, originalTransaction.transactionID)) !== null && _c !== void 0 ? _c : action) : action;
    var shouldDisableOnPress = isBillSplit && (0, EmptyObject_1.isEmptyObject)(transaction);
    var isTransactionMadeWithCard = (0, TransactionUtils_1.isCardTransaction)(transaction);
    var showCashOrCardTranslation = isTransactionMadeWithCard ? 'iou.card' : 'iou.cash';
    var isReviewDuplicateTransactionPage = route.name === SCREENS_1.default.TRANSACTION_DUPLICATE.REVIEW;
    if (onPreviewPressed) {
        return (<PressableWithoutFeedback_1.default onPress={shouldDisableOnPress ? undefined : props.onPreviewPressed} onPressIn={function () { return (0, DeviceCapabilities_1.canUseTouchScreen)() && ControlSelection_1.default.block(); }} onPressOut={function () { return ControlSelection_1.default.unblock(); }} onLongPress={showContextMenu} shouldUseHapticsOnLongPress accessibilityLabel={isBillSplit ? translate('iou.split') : translate(showCashOrCardTranslation)} accessibilityHint={(0, CurrencyUtils_1.convertToDisplayString)(requestAmount, requestCurrency)}>
                <TransactionPreviewContent_1.default 
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        {...props} action={iouAction} isBillSplit={isBillSplit} chatReport={chatReport} personalDetails={personalDetails} transaction={transactionPreview} transactionRawAmount={transactionRawAmount} report={report} violations={violations} offlineWithFeedbackOnClose={offlineWithFeedbackOnClose} navigateToReviewFields={navigateToReviewFields} areThereDuplicates={areThereDuplicates} sessionAccountID={sessionAccountID} walletTermsErrors={walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.errors} routeName={route.name} isReviewDuplicateTransactionPage={isReviewDuplicateTransactionPage}/>
            </PressableWithoutFeedback_1.default>);
    }
    return (<TransactionPreviewContent_1.default 
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    {...props} action={iouAction} isBillSplit={isBillSplit} chatReport={chatReport} personalDetails={personalDetails} transaction={originalTransaction} transactionRawAmount={transactionRawAmount} report={report} violations={violations} offlineWithFeedbackOnClose={offlineWithFeedbackOnClose} navigateToReviewFields={navigateToReviewFields} areThereDuplicates={areThereDuplicates} sessionAccountID={sessionAccountID} walletTermsErrors={walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.errors} routeName={route.name} reportPreviewAction={reportPreviewAction} isReviewDuplicateTransactionPage={isReviewDuplicateTransactionPage}/>);
}
TransactionPreview.displayName = 'TransactionPreview';
exports.default = TransactionPreview;
