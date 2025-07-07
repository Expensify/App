"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var TextCommentFragment_1 = require("./comment/TextCommentFragment");
var ReportActionItemFragment_1 = require("./ReportActionItemFragment");
function ReportActionItemMessage(_a) {
    var action = _a.action, displayAsGroup = _a.displayAsGroup, reportID = _a.reportID, style = _a.style, _b = _a.isHidden, isHidden = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: true })[0];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat((0, ReportActionsUtils_1.getLinkedTransactionID)(action)), { canBeMissing: true })[0];
    var fragments = (0, ReportActionsUtils_1.getReportActionMessageFragments)(action);
    var isIOUReport = (0, ReportActionsUtils_1.isMoneyRequestAction)(action);
    if ((0, ReportActionsUtils_1.isMemberChangeAction)(action)) {
        var fragment = (0, ReportActionsUtils_1.getMemberChangeMessageFragment)(action, ReportUtils_1.getReportName);
        return (<react_native_1.View style={[styles.chatItemMessage, style]}>
                <TextCommentFragment_1.default fragment={fragment} displayAsGroup={displayAsGroup} style={style} source="" styleAsDeleted={false}/>
            </react_native_1.View>);
    }
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
        var fragment = (0, ReportActionsUtils_1.getUpdateRoomDescriptionFragment)(action);
        return (<react_native_1.View style={[styles.chatItemMessage, style]}>
                <TextCommentFragment_1.default fragment={fragment} displayAsGroup={displayAsGroup} style={style} source="" styleAsDeleted={false}/>
            </react_native_1.View>);
    }
    var iouMessage;
    if (isIOUReport) {
        var originalMessage = action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? (0, ReportActionsUtils_1.getOriginalMessage)(action) : null;
        var iouReportID = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUReportID;
        if (iouReportID) {
            iouMessage = (0, ReportUtils_1.getIOUReportActionDisplayMessage)(action, transaction);
        }
    }
    var isApprovedOrSubmittedReportAction = (0, ReportActionsUtils_1.isApprovedOrSubmittedReportAction)(action);
    var isHoldReportAction = [CONST_1.default.REPORT.ACTIONS.TYPE.HOLD, CONST_1.default.REPORT.ACTIONS.TYPE.UNHOLD].some(function (type) { return type === action.actionName; });
    /**
     * Get the ReportActionItemFragments
     * @param shouldWrapInText determines whether the fragments are wrapped in a Text component
     * @returns report action item fragments
     */
    var renderReportActionItemFragments = function (shouldWrapInText) {
        var reportActionItemFragments = fragments.map(function (fragment, index) {
            var _a, _b, _c, _d;
            return (<ReportActionItemFragment_1.default 
            /* eslint-disable-next-line react/no-array-index-key */
            key={"actionFragment-".concat(action.reportActionID, "-").concat(index)} reportActionID={action.reportActionID} fragment={fragment} iouMessage={iouMessage} isThreadParentMessage={(0, ReportActionsUtils_1.isThreadParentMessage)(action, reportID)} pendingAction={action.pendingAction} actionName={action.actionName} source={(0, ReportActionsUtils_1.isAddCommentAction)(action) ? (_a = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _a === void 0 ? void 0 : _a.source : ''} accountID={(_b = action.actorAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID} style={style} displayAsGroup={displayAsGroup} isApprovedOrSubmittedReportAction={isApprovedOrSubmittedReportAction} isHoldReportAction={isHoldReportAction} 
            // Since system messages from Old Dot begin with the person who performed the action,
            // the first fragment will contain the person's display name and their email. We'll use this
            // to decide if the fragment should be from left to right for RTL display names e.g. Arabic for proper
            // formatting.
            isFragmentContainingDisplayName={index === 0} moderationDecision={(_d = (_c = (0, ReportActionsUtils_1.getReportActionMessage)(action)) === null || _c === void 0 ? void 0 : _c.moderationDecision) === null || _d === void 0 ? void 0 : _d.decision}/>);
        });
        // Approving or submitting reports in oldDot results in system messages made up of multiple fragments of `TEXT` type
        // which we need to wrap in `<Text>` to prevent them rendering on separate lines.
        return shouldWrapInText ? <Text_1.default style={styles.ltr}>{reportActionItemFragments}</Text_1.default> : reportActionItemFragments;
    };
    var openWorkspaceInvoicesPage = function () {
        var policyID = report === null || report === void 0 ? void 0 : report.policyID;
        if (!policyID) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INVOICES.getRoute(policyID));
    };
    var shouldShowAddBankAccountButton = action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.IOU && (0, ReportUtils_1.hasMissingInvoiceBankAccount)(reportID) && !(0, ReportUtils_1.isSettled)(reportID);
    return (<react_native_1.View style={[styles.chatItemMessage, style]}>
            {!isHidden ? (<>
                    {renderReportActionItemFragments(isApprovedOrSubmittedReportAction)}
                    {shouldShowAddBankAccountButton && (<Button_1.default style={[styles.mt2, styles.alignSelfStart]} success text={translate('workspace.invoices.paymentMethods.addBankAccount')} onPress={openWorkspaceInvoicesPage}/>)}
                </>) : (<Text_1.default style={[styles.textLabelSupporting, styles.lh20]}>{translate('moderation.flaggedContent')}</Text_1.default>)}
        </react_native_1.View>);
}
ReportActionItemMessage.displayName = 'ReportActionItemMessage';
exports.default = ReportActionItemMessage;
