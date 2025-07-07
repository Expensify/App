"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MoneyRequestView_1 = require("@components/ReportActionItem/MoneyRequestView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReviewDuplicatesNavigation_1 = require("@hooks/useReviewDuplicatesNavigation");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var IOU = require("@src/libs/actions/IOU");
var ReportActionsUtils = require("@src/libs/ReportActionsUtils");
var ReportUtils = require("@src/libs/ReportUtils");
var TransactionUtils = require("@src/libs/TransactionUtils");
var TransactionUtils_1 = require("@src/libs/TransactionUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function Confirmation() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var route = (0, native_1.useRoute)();
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.REVIEW_DUPLICATES, { canBeMissing: true }), reviewDuplicates = _b[0], reviewDuplicatesResult = _b[1];
    var newTransaction = (0, react_1.useMemo)(function () { return TransactionUtils.buildNewTransactionAfterReviewingDuplicates(reviewDuplicates); }, [reviewDuplicates]);
    var transactionID = TransactionUtils.getTransactionID(route.params.threadReportID);
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var transactionViolations = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID), {
        canBeMissing: false,
    })[0];
    var allDuplicateIDs = (0, react_1.useMemo)(function () { var _a, _b, _c; return (_c = (_b = (_a = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.find(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; })) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.duplicates) !== null && _c !== void 0 ? _c : []; }, [transactionViolations]);
    var allDuplicates = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION), {
        selector: function (allTransactions) { return allDuplicateIDs.map(function (id) { return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id)]; }); },
        canBeMissing: true,
    })[0];
    var compareResult = TransactionUtils.compareDuplicateTransactionFields(transaction, allDuplicates, reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.reportID);
    var goBack = (0, useReviewDuplicatesNavigation_1.default)(Object.keys((_a = compareResult.change) !== null && _a !== void 0 ? _a : {}), 'confirmation', route.params.threadReportID, route.params.backTo).goBack;
    var _c = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(route.params.threadReportID), { canBeMissing: true }), report = _c[0], reportResult = _c[1];
    var iouReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(newTransaction === null || newTransaction === void 0 ? void 0 : newTransaction.reportID), { canBeMissing: true })[0];
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(newTransaction === null || newTransaction === void 0 ? void 0 : newTransaction.reportID), { canBeMissing: true })[0];
    var reportAction = Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}).find(function (action) { var _a; return ReportActionsUtils.isMoneyRequestAction(action) && ((_a = ReportActionsUtils.getOriginalMessage(action)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID) === (reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.transactionID); });
    var duplicates = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION), {
        selector: function (allTransactions) { return reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.duplicates.map(function (id) { return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id)]; }); },
        canBeMissing: true,
    })[0];
    var transactionsMergeParams = (0, react_1.useMemo)(function () { return TransactionUtils.buildMergeDuplicatesParams(reviewDuplicates, duplicates !== null && duplicates !== void 0 ? duplicates : [], newTransaction); }, [duplicates, reviewDuplicates, newTransaction]);
    var isReportOwner = (iouReport === null || iouReport === void 0 ? void 0 : iouReport.ownerAccountID) === (currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID);
    var mergeDuplicates = (0, react_1.useCallback)(function () {
        if (!(reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID)) {
            return;
        }
        IOU.mergeDuplicates(transactionsMergeParams);
        Navigation_1.default.dismissModal();
    }, [reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID, transactionsMergeParams]);
    var resolveDuplicates = (0, react_1.useCallback)(function () {
        IOU.resolveDuplicates(transactionsMergeParams);
        Navigation_1.default.dismissModal();
    }, [transactionsMergeParams]);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        transactionThreadReport: report,
        action: reportAction,
        report: report,
        checkIfContextMenuActive: function () { },
        onShowContextMenu: function () { },
        isReportArchived: false,
        anchor: null,
        isDisabled: false,
    }); }, [report, reportAction]);
    var reportTransactionID = (report === null || report === void 0 ? void 0 : report.reportID) ? (0, TransactionUtils_1.getTransactionID)(report.reportID) : undefined;
    var doesTransactionBelongToReport = (reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.transactionID) === reportTransactionID || (reportTransactionID && (reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.duplicates.includes(reportTransactionID)));
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundPage = (0, EmptyObject_1.isEmptyObject)(report) ||
        !ReportUtils.isValidReport(report) ||
        ReportUtils.isReportNotFound(report) ||
        (reviewDuplicatesResult.status === 'loaded' && (!(newTransaction === null || newTransaction === void 0 ? void 0 : newTransaction.transactionID) || !doesTransactionBelongToReport));
    if ((0, isLoadingOnyxValue_1.default)(reviewDuplicatesResult, reportResult) || !(newTransaction === null || newTransaction === void 0 ? void 0 : newTransaction.transactionID)) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<ScreenWrapper_1.default testID={Confirmation.displayName} shouldShowOfflineIndicator>
            <FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundPage}>
                <react_native_1.View style={[styles.flex1]}>
                    <HeaderWithBackButton_1.default title={translate('iou.reviewDuplicates')} onBackButtonPress={goBack}/>
                    <ScrollView_1.default>
                        <react_native_1.View style={[styles.ph5, styles.pb8]}>
                            <Text_1.default family="EXP_NEW_KANSAS_MEDIUM" fontSize={variables_1.default.fontSizeLarge} style={styles.pb5}>
                                {translate('violations.confirmDetails')}
                            </Text_1.default>
                            <Text_1.default>{translate('violations.confirmDuplicatesInfo')}</Text_1.default>
                        </react_native_1.View>
                        {/* We need that provider here because MoneyRequestView component requires that */}
                        <ShowContextMenuContext_1.ShowContextMenuContext.Provider value={contextValue}>
                            <MoneyRequestView_1.default report={report} shouldShowAnimatedBackground={false} readonly isFromReviewDuplicates updatedTransaction={newTransaction}/>
                        </ShowContextMenuContext_1.ShowContextMenuContext.Provider>
                    </ScrollView_1.default>
                    <FixedFooter_1.default style={styles.mtAuto}>
                        <Button_1.default text={translate('common.confirm')} success onPress={function () {
            if (!isReportOwner) {
                resolveDuplicates();
                return;
            }
            mergeDuplicates();
        }} large/>
                    </FixedFooter_1.default>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
