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
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var ImageBehaviorContextProvider_1 = require("@components/Image/ImageBehaviorContextProvider");
var MoneyRequestConfirmationList_1 = require("@components/MoneyRequestConfirmationList");
var MoneyRequestHeaderStatusBar_1 = require("@components/MoneyRequestHeaderStatusBar");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var IOU_1 = require("@libs/actions/IOU");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Parser_1 = require("@libs/Parser");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var withReportAndReportActionOrNotFound_1 = require("@pages/home/report/withReportAndReportActionOrNotFound");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function SplitBillDetailsPage(_a) {
    var _b, _c, _d, _e, _f;
    var route = _a.route, report = _a.report, reportAction = _a.reportAction;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var originalMessage = reportAction && (0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) ? (0, ReportActionsUtils_1.getOriginalMessage)(reportAction) : undefined;
    var IOUTransactionID = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUTransactionID;
    var participantAccountIDs = (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.participantAccountIDs) !== null && _b !== void 0 ? _b : [];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(IOUTransactionID), { canBeMissing: true })[0];
    var draftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(IOUTransactionID), { canBeMissing: true })[0];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    // In case this is workspace split expense, we manually add the workspace as the second participant of the split expense
    // because we don't save any accountID in the report action's originalMessage other than the payee's accountID
    var participants;
    if ((0, ReportUtils_1.isPolicyExpenseChat)(report)) {
        participants = [
            (0, OptionsListUtils_1.getParticipantsOption)({ accountID: participantAccountIDs.at(0), selected: true, reportID: '' }, personalDetails),
            (0, OptionsListUtils_1.getPolicyExpenseReportOption)(__assign(__assign({}, report), { selected: true, reportID: reportID })),
        ];
    }
    else {
        participants = participantAccountIDs.map(function (accountID) { return (0, OptionsListUtils_1.getParticipantsOption)({ accountID: accountID, selected: true, reportID: '' }, personalDetails); });
    }
    var actorAccountID = (_c = reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID;
    var payeePersonalDetails = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[actorAccountID];
    var participantsExcludingPayee = participants.filter(function (participant) { return participant.accountID !== (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID); });
    var hasSmartScanFailed = (0, TransactionUtils_1.hasReceipt)(transaction) && ((_d = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _d === void 0 ? void 0 : _d.state) === CONST_1.default.IOU.RECEIPT_STATE.SCAN_FAILED;
    var isEditingSplitBill = (session === null || session === void 0 ? void 0 : session.accountID) === actorAccountID && (0, TransactionUtils_1.areRequiredFieldsEmpty)(transaction);
    var isDistanceRequest = (0, TransactionUtils_1.isDistanceRequest)(transaction);
    var _g = (0, react_1.useState)(false), isConfirmed = _g[0], setIsConfirmed = _g[1];
    var _h = (_e = (0, ReportUtils_1.getTransactionDetails)(isEditingSplitBill && draftTransaction ? draftTransaction : transaction)) !== null && _e !== void 0 ? _e : {}, splitAmount = _h.amount, splitCurrency = _h.currency, splitComment = _h.comment, splitMerchant = _h.merchant, splitCreated = _h.created, splitCategory = _h.category, splitBillable = _h.billable;
    var onConfirm = (0, react_1.useCallback)(function () {
        var _a;
        setIsConfirmed(true);
        (0, IOU_1.completeSplitBill)(reportID, reportAction, draftTransaction, (_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID, session === null || session === void 0 ? void 0 : session.email);
    }, [reportID, reportAction, draftTransaction, session === null || session === void 0 ? void 0 : session.accountID, session === null || session === void 0 ? void 0 : session.email]);
    return (<ScreenWrapper_1.default testID={SplitBillDetailsPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!reportID || (0, EmptyObject_1.isEmptyObject)(reportAction) || (0, EmptyObject_1.isEmptyObject)(transaction)}>
                <HeaderWithBackButton_1.default title={translate('common.details')} onBackButtonPress={function () { return Navigation_1.default.goBack(route.params.backTo); }}/>
                <react_native_1.View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    {(0, TransactionUtils_1.isScanning)(transaction) && (<react_native_1.View style={[styles.ph5, styles.pb3, styles.borderBottom]}>
                            <MoneyRequestHeaderStatusBar_1.default icon={<Icon_1.default src={Expensicons.ReceiptScan} height={variables_1.default.iconSizeSmall} width={variables_1.default.iconSizeSmall} fill={theme.icon}/>} description={translate('iou.receiptScanInProgressDescription')} shouldStyleFlexGrow={false}/>
                        </react_native_1.View>)}
                    <ImageBehaviorContextProvider_1.ImageBehaviorContextProvider shouldSetAspectRatioInStyle={!isDistanceRequest}>
                        {!!participants.length && (<MoneyRequestConfirmationList_1.default payeePersonalDetails={payeePersonalDetails} selectedParticipants={participantsExcludingPayee} iouAmount={splitAmount !== null && splitAmount !== void 0 ? splitAmount : 0} iouCurrencyCode={splitCurrency} iouComment={Parser_1.default.htmlToMarkdown(splitComment !== null && splitComment !== void 0 ? splitComment : '')} iouCreated={splitCreated} shouldDisplayReceipt iouMerchant={splitMerchant} iouCategory={splitCategory} iouIsBillable={splitBillable} iouType={CONST_1.default.IOU.TYPE.SPLIT} isReadOnly={!isEditingSplitBill} shouldShowSmartScanFields receiptPath={(_f = transaction === null || transaction === void 0 ? void 0 : transaction.receipt) === null || _f === void 0 ? void 0 : _f.source} receiptFilename={transaction === null || transaction === void 0 ? void 0 : transaction.filename} isDistanceRequest={isDistanceRequest} isEditingSplitBill={isEditingSplitBill} hasSmartScanFailed={hasSmartScanFailed} reportID={reportID} reportActionID={reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID} transaction={isEditingSplitBill && draftTransaction ? draftTransaction : transaction} onConfirm={onConfirm} isPolicyExpenseChat={(0, ReportUtils_1.isPolicyExpenseChat)(report)} policyID={(0, ReportUtils_1.isPolicyExpenseChat)(report) ? report === null || report === void 0 ? void 0 : report.policyID : undefined} action={isEditingSplitBill ? CONST_1.default.IOU.ACTION.EDIT : CONST_1.default.IOU.ACTION.CREATE} onToggleBillable={function (billable) {
                (0, IOU_1.setDraftSplitTransaction)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, { billable: billable });
            }} isConfirmed={isConfirmed}/>)}
                    </ImageBehaviorContextProvider_1.ImageBehaviorContextProvider>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';
exports.default = (0, withReportAndReportActionOrNotFound_1.default)(SplitBillDetailsPage);
