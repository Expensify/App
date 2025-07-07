"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var IOU_1 = require("@libs/actions/IOU");
var Report_1 = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReceiptUtils_1 = require("@libs/ReceiptUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var AttachmentModalContainer_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContainer");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function TransactionReceiptModalContent(_a) {
    var _b, _c, _d;
    var navigation = _a.navigation, route = _a.route;
    var _e = route.params, _f = _e.reportID, reportID = _f === void 0 ? '' : _f, _g = _e.transactionID, transactionID = _g === void 0 ? '' : _g, iouAction = _e.iouAction, iouType = _e.iouType, readonlyProp = _e.readonly, isFromReviewDuplicatesProp = _e.isFromReviewDuplicates;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: true })[0];
    var transactionMain = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var transactionDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: true })[0];
    var _h = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID), { canBeMissing: true })[0], reportMetadata = _h === void 0 ? { isLoadingInitialReportActions: true } : _h;
    var isDraftTransaction = !!iouAction;
    var transaction = isDraftTransaction ? transactionDraft : transactionMain;
    var receiptURIs = (0, ReceiptUtils_1.getThumbnailAndImageURIs)(transaction);
    var isLocalFile = receiptURIs.isLocalFile;
    var readonly = !!readonlyProp;
    var isFromReviewDuplicates = !!isFromReviewDuplicatesProp;
    var imageSource = isDraftTransaction ? (_b = transactionDraft === null || transactionDraft === void 0 ? void 0 : transactionDraft.receipt) === null || _b === void 0 ? void 0 : _b.source : (0, tryResolveUrlFromApiRoot_1.default)((_c = receiptURIs.image) !== null && _c !== void 0 ? _c : '');
    var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(report === null || report === void 0 ? void 0 : report.parentReportID, report === null || report === void 0 ? void 0 : report.parentReportActionID);
    var canEditReceipt = (0, ReportUtils_1.canEditFieldOfMoneyRequest)(parentReportAction, CONST_1.default.EDIT_REQUEST_FIELD.RECEIPT);
    var canDeleteReceipt = (0, ReportUtils_1.canEditFieldOfMoneyRequest)(parentReportAction, CONST_1.default.EDIT_REQUEST_FIELD.RECEIPT, true);
    var isEReceipt = transaction && !(0, TransactionUtils_1.hasReceiptSource)(transaction) && (0, TransactionUtils_1.hasEReceipt)(transaction);
    var isTrackExpenseActionValue = (0, ReportActionsUtils_1.isTrackExpenseAction)(parentReportAction);
    var _j = (0, react_1.useState)(false), isDeleteReceiptConfirmModalVisible = _j[0], setIsDeleteReceiptConfirmModalVisible = _j[1];
    (0, react_1.useEffect)(function () {
        if ((!!report && !!transaction) || isDraftTransaction) {
            return;
        }
        (0, Report_1.openReport)(reportID);
        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var receiptPath = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _d === void 0 ? void 0 : _d.source;
    (0, react_1.useEffect)(function () {
        var _a;
        if (!isDraftTransaction || !iouType || !transaction) {
            return;
        }
        var requestType = (0, TransactionUtils_1.getRequestType)(transaction);
        var receiptFilename = transaction === null || transaction === void 0 ? void 0 : transaction.filename;
        var receiptType = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.type;
        (0, IOU_1.navigateToStartStepIfScanFileCannotBeRead)(receiptFilename, receiptPath, function () { }, requestType, iouType, transactionID, reportID, receiptType, function () {
            return Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_STEP_SCAN.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID, ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(iouAction, iouType, transactionID, reportID)));
        });
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receiptPath]);
    var moneyRequestReportID = (0, ReportUtils_1.isMoneyRequestReport)(report) ? report === null || report === void 0 ? void 0 : report.reportID : report === null || report === void 0 ? void 0 : report.parentReportID;
    var isTrackExpenseReportValue = (0, ReportUtils_1.isTrackExpenseReport)(report);
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundPage = isTrackExpenseReportValue || isDraftTransaction || (transaction === null || transaction === void 0 ? void 0 : transaction.reportID) === CONST_1.default.REPORT.SPLIT_REPORT_ID || isFromReviewDuplicates
        ? !transaction
        : moneyRequestReportID !== (transaction === null || transaction === void 0 ? void 0 : transaction.reportID);
    var contentProps = (0, react_1.useMemo)(function () {
        var _a, _b;
        return ({
            source: imageSource,
            isAuthTokenRequired: !isLocalFile && !isDraftTransaction,
            report: report,
            isReceiptAttachment: true,
            isDeleteReceiptConfirmModalVisible: isDeleteReceiptConfirmModalVisible,
            canEditReceipt: ((canEditReceipt && !readonly) || isDraftTransaction) && !((_a = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _a === void 0 ? void 0 : _a.isTestDriveReceipt),
            canDeleteReceipt: canDeleteReceipt && !readonly && !isDraftTransaction && !((_b = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _b === void 0 ? void 0 : _b.isTestDriveReceipt),
            allowDownload: !isEReceipt,
            isTrackExpenseAction: isTrackExpenseActionValue,
            originalFileName: isDraftTransaction ? transaction === null || transaction === void 0 ? void 0 : transaction.filename : receiptURIs === null || receiptURIs === void 0 ? void 0 : receiptURIs.filename,
            isLoading: !transaction && (reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions),
            iouAction: iouAction,
            iouType: iouType,
            draftTransactionID: isDraftTransaction ? transactionID : undefined,
            shouldShowNotFoundPage: shouldShowNotFoundPage,
            onRequestDeleteReceipt: function () { return setIsDeleteReceiptConfirmModalVisible === null || setIsDeleteReceiptConfirmModalVisible === void 0 ? void 0 : setIsDeleteReceiptConfirmModalVisible(true); },
            onDeleteReceipt: function () { return setIsDeleteReceiptConfirmModalVisible === null || setIsDeleteReceiptConfirmModalVisible === void 0 ? void 0 : setIsDeleteReceiptConfirmModalVisible(false); },
        });
    }, [
        canDeleteReceipt,
        canEditReceipt,
        imageSource,
        iouAction,
        iouType,
        isDeleteReceiptConfirmModalVisible,
        isDraftTransaction,
        isEReceipt,
        isLocalFile,
        isTrackExpenseActionValue,
        readonly,
        receiptURIs === null || receiptURIs === void 0 ? void 0 : receiptURIs.filename,
        report,
        reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions,
        shouldShowNotFoundPage,
        transaction,
        transactionID,
    ]);
    return (<AttachmentModalContainer_1.default navigation={navigation} contentProps={contentProps}/>);
}
TransactionReceiptModalContent.displayName = 'TransactionReceiptModalContent';
exports.default = TransactionReceiptModalContent;
