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
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var RenderHTML_1 = require("@components/RenderHTML");
var MoneyReportView_1 = require("@components/ReportActionItem/MoneyReportView");
var MoneyRequestView_1 = require("@components/ReportActionItem/MoneyRequestView");
var TaskView_1 = require("@components/ReportActionItem/TaskView");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var SpacerView_1 = require("@components/SpacerView");
var UnreadActionIndicator_1 = require("@components/UnreadActionIndicator");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var AnimatedEmptyStateBackground_1 = require("./AnimatedEmptyStateBackground");
var ReportActionItemCreated_1 = require("./ReportActionItemCreated");
var ReportActionItemSingle_1 = require("./ReportActionItemSingle");
function ReportActionItemContentCreated(_a) {
    var _b;
    var contextValue = _a.contextValue, parentReport = _a.parentReport, parentReportAction = _a.parentReportAction, transactionID = _a.transactionID, draftMessage = _a.draftMessage, shouldHideThreadDividerLine = _a.shouldHideThreadDividerLine;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var report = contextValue.report, action = contextValue.action, transactionThreadReport = contextValue.transactionThreadReport;
    var policy = (0, usePolicy_1.default)((report === null || report === void 0 ? void 0 : report.policyID) === CONST_1.default.POLICY.OWNER_EMAIL_FAKE ? undefined : report === null || report === void 0 ? void 0 : report.policyID);
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var transactionCurrency = (0, TransactionUtils_1.getCurrency)(transaction);
    var renderThreadDivider = (0, react_1.useMemo)(function () {
        return shouldHideThreadDividerLine ? (<UnreadActionIndicator_1.default reportActionID={report === null || report === void 0 ? void 0 : report.reportID} shouldHideThreadDividerLine={shouldHideThreadDividerLine}/>) : (<SpacerView_1.default shouldShow={!shouldHideThreadDividerLine} style={[!shouldHideThreadDividerLine ? styles.reportHorizontalRule : {}]}/>);
    }, [shouldHideThreadDividerLine, report === null || report === void 0 ? void 0 : report.reportID, styles.reportHorizontalRule]);
    var contextMenuValue = (0, react_1.useMemo)(function () { return (__assign(__assign({}, contextValue), { isDisabled: true })); }, [contextValue]);
    if ((0, ReportActionsUtils_1.isTransactionThread)(parentReportAction)) {
        var isReversedTransaction = (0, ReportActionsUtils_1.isReversedTransaction)(parentReportAction);
        if ((0, ReportActionsUtils_1.isMessageDeleted)(parentReportAction) || isReversedTransaction) {
            var message = void 0;
            if (isReversedTransaction) {
                message = 'parentReportAction.reversedTransaction';
            }
            else {
                message = 'parentReportAction.deletedExpense';
            }
            return (<react_native_1.View style={[styles.pRelative]}>
                    <AnimatedEmptyStateBackground_1.default />
                    <OfflineWithFeedback_1.default pendingAction={(_b = parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.pendingAction) !== null && _b !== void 0 ? _b : null}>
                        <ReportActionItemSingle_1.default action={parentReportAction} showHeader report={report}>
                            <RenderHTML_1.default html={"<deleted-action ".concat(CONST_1.default.REVERSED_TRANSACTION_ATTRIBUTE, "=\"").concat(isReversedTransaction, "\">").concat(translate(message), "</deleted-action>")}/>
                        </ReportActionItemSingle_1.default>
                        <react_native_1.View style={styles.threadDividerLine}/>
                    </OfflineWithFeedback_1.default>
                </react_native_1.View>);
        }
        return (<OfflineWithFeedback_1.default pendingAction={action === null || action === void 0 ? void 0 : action.pendingAction}>
                <ShowContextMenuContext_1.ShowContextMenuContext.Provider value={contextMenuValue}>
                    <react_native_1.View>
                        <MoneyRequestView_1.default report={report} shouldShowAnimatedBackground/>
                        {renderThreadDivider}
                    </react_native_1.View>
                </ShowContextMenuContext_1.ShowContextMenuContext.Provider>
            </OfflineWithFeedback_1.default>);
    }
    if ((0, ReportUtils_1.isTaskReport)(report)) {
        if ((0, ReportUtils_1.isCanceledTaskReport)(report, parentReportAction)) {
            return (<react_native_1.View style={[styles.pRelative]}>
                    <AnimatedEmptyStateBackground_1.default />
                    <OfflineWithFeedback_1.default pendingAction={parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.pendingAction}>
                        <ReportActionItemSingle_1.default action={parentReportAction} showHeader={draftMessage === undefined} report={report}>
                            <RenderHTML_1.default html={"<deleted-action>".concat(translate('parentReportAction.deletedTask'), "</deleted-action>")}/>
                        </ReportActionItemSingle_1.default>
                    </OfflineWithFeedback_1.default>
                    <react_native_1.View style={styles.reportHorizontalRule}/>
                </react_native_1.View>);
        }
        return (<react_native_1.View style={[styles.pRelative]}>
                <AnimatedEmptyStateBackground_1.default />
                <react_native_1.View>
                    <TaskView_1.default report={report} parentReport={parentReport} action={action}/>
                    {renderThreadDivider}
                </react_native_1.View>
            </react_native_1.View>);
    }
    if ((0, ReportUtils_1.isExpenseReport)(report) || (0, ReportUtils_1.isIOUReport)(report) || (0, ReportUtils_1.isInvoiceReport)(report)) {
        return (<OfflineWithFeedback_1.default pendingAction={action === null || action === void 0 ? void 0 : action.pendingAction}>
                {!(0, EmptyObject_1.isEmptyObject)(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID) ? (<>
                        <MoneyReportView_1.default report={report} policy={policy} isCombinedReport pendingAction={action === null || action === void 0 ? void 0 : action.pendingAction} shouldShowTotal={transaction ? transactionCurrency !== (report === null || report === void 0 ? void 0 : report.currency) : false} shouldHideThreadDividerLine={false}/>
                        <ShowContextMenuContext_1.ShowContextMenuContext.Provider value={contextMenuValue}>
                            <react_native_1.View>
                                <MoneyRequestView_1.default report={transactionThreadReport} shouldShowAnimatedBackground={false}/>
                                {renderThreadDivider}
                            </react_native_1.View>
                        </ShowContextMenuContext_1.ShowContextMenuContext.Provider>
                    </>) : (<MoneyReportView_1.default report={report} policy={policy} pendingAction={action === null || action === void 0 ? void 0 : action.pendingAction} shouldHideThreadDividerLine={shouldHideThreadDividerLine}/>)}
            </OfflineWithFeedback_1.default>);
    }
    return (<ReportActionItemCreated_1.default reportID={report === null || report === void 0 ? void 0 : report.reportID} policyID={report === null || report === void 0 ? void 0 : report.policyID}/>);
}
ReportActionItemContentCreated.displayName = 'ReportActionItemContentCreated';
exports.default = (0, react_1.memo)(ReportActionItemContentCreated, function (prevProps, nextProps) {
    return (0, fast_equals_1.deepEqual)(prevProps.contextValue, nextProps.contextValue) &&
        (0, fast_equals_1.deepEqual)(prevProps.parentReportAction, nextProps.parentReportAction) &&
        prevProps.transactionID === nextProps.transactionID &&
        prevProps.draftMessage === nextProps.draftMessage &&
        prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine;
});
