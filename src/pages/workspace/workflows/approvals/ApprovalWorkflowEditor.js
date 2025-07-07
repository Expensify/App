"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function ApprovalWorkflowEditor(_a, ref) {
    var _b, _c, _d, _e;
    var approvalWorkflow = _a.approvalWorkflow, removeApprovalWorkflow = _a.removeApprovalWorkflow, policy = _a.policy, policyID = _a.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var _f = (0, useLocalize_1.default)(), translate = _f.translate, toLocaleOrdinal = _f.toLocaleOrdinal;
    var approverCount = approvalWorkflow.approvers.length;
    var approverDescription = (0, react_1.useCallback)(function (index) { return (approverCount > 1 ? "".concat(toLocaleOrdinal(index + 1, true), " ").concat(translate('workflowsPage.approver').toLowerCase()) : "".concat(translate('workflowsPage.approver'))); }, [approverCount, toLocaleOrdinal, translate]);
    var getApprovalPendingAction = (0, react_1.useCallback)(function (index) {
        var _a, _b, _c;
        var pendingAction;
        if (index === 0) {
            (_a = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.members) === null || _a === void 0 ? void 0 : _a.forEach(function (member) {
                var _a;
                pendingAction = pendingAction !== null && pendingAction !== void 0 ? pendingAction : (_a = member.pendingFields) === null || _a === void 0 ? void 0 : _a.submitsTo;
            });
            return pendingAction;
        }
        var previousApprover = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.approvers.at(index - 1);
        var previousMember = (_b = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.members) === null || _b === void 0 ? void 0 : _b.find(function (member) { return (member === null || member === void 0 ? void 0 : member.email) === (previousApprover === null || previousApprover === void 0 ? void 0 : previousApprover.email); });
        return (_c = previousMember === null || previousMember === void 0 ? void 0 : previousMember.pendingFields) === null || _c === void 0 ? void 0 : _c.forwardsTo;
    }, [approvalWorkflow]);
    var members = (0, react_1.useMemo)(function () {
        if (approvalWorkflow.isDefault) {
            return translate('workspace.common.everyone');
        }
        return (0, OptionsListUtils_1.sortAlphabetically)(approvalWorkflow.members, 'displayName')
            .map(function (m) { return m.displayName; })
            .join(', ');
    }, [approvalWorkflow.isDefault, approvalWorkflow.members, translate]);
    var approverErrorMessage = (0, react_1.useCallback)(function (approver, approverIndex) {
        var _a;
        var previousApprover = approvalWorkflow.approvers.slice(0, approverIndex).filter(Boolean).at(-1);
        var error = (_a = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.errors) === null || _a === void 0 ? void 0 : _a["approver-".concat(approverIndex)];
        if (!error) {
            return;
        }
        if (error === 'workflowsPage.approverCircularReference') {
            if (!previousApprover || !approver) {
                return;
            }
            return translate('workflowsPage.approverCircularReference', {
                name1: approver.displayName,
                name2: previousApprover.displayName,
            });
        }
        return translate(error);
    }, [approvalWorkflow.approvers, approvalWorkflow.errors, translate]);
    var editMembers = (0, react_1.useCallback)(function () {
        var backTo = approvalWorkflow.action === CONST_1.default.APPROVAL_WORKFLOW.ACTION.CREATE ? ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID) : undefined;
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(policyID, backTo));
    }, [approvalWorkflow.action, policyID]);
    var editApprover = (0, react_1.useCallback)(function (approverIndex) {
        var backTo = approvalWorkflow.action === CONST_1.default.APPROVAL_WORKFLOW.ACTION.CREATE ? ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID) : undefined;
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverIndex, backTo));
    }, [approvalWorkflow.action, policyID]);
    // User should be allowed to add additional approver only if they upgraded to Control Plan, otherwise redirected to the Upgrade Page
    var addAdditionalApprover = (0, react_1.useCallback)(function () {
        if (!(0, PolicyUtils_1.isControlPolicy)(policy) && approverCount > 0) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias, Navigation_1.default.getActiveRoute()));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverCount, ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID)));
    }, [approverCount, policy, policyID]);
    return (<ScrollView_1.default style={[styles.flex1]} ref={ref} addBottomSafeAreaPadding>
            <react_native_1.View style={[styles.mh5]}>
                {approvalWorkflow.action === CONST_1.default.APPROVAL_WORKFLOW.ACTION.CREATE && (<Text_1.default style={[styles.textHeadlineH1, styles.mv3]}>{translate('workflowsCreateApprovalsPage.header')}</Text_1.default>)}

                <MenuItemWithTopDescription_1.default title={members} titleStyle={styles.textNormalThemeText} numberOfLinesTitle={4} description={translate('workflowsExpensesFromPage.title')} descriptionTextStyle={!!members && styles.textLabelSupportingNormal} onPress={editMembers} wrapperStyle={[styles.sectionMenuItemTopDescription]} errorText={((_b = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.errors) === null || _b === void 0 ? void 0 : _b.members) ? translate(approvalWorkflow.errors.members) : undefined} brickRoadIndicator={((_c = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.errors) === null || _c === void 0 ? void 0 : _c.members) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} shouldShowRightIcon={!approvalWorkflow.isDefault} interactive={!approvalWorkflow.isDefault}/>

                {approvalWorkflow.approvers.map(function (approver, approverIndex) {
            var errorText = approverErrorMessage(approver, approverIndex);
            var hintText = !errorText && approvalWorkflow.usedApproverEmails.some(function (approverEmail) { return approverEmail === (approver === null || approver === void 0 ? void 0 : approver.email); })
                ? translate('workflowsPage.approverInMultipleWorkflows')
                : undefined;
            return (<OfflineWithFeedback_1.default 
            // eslint-disable-next-line react/no-array-index-key
            key={"approver-".concat(approver === null || approver === void 0 ? void 0 : approver.email, "-").concat(approverIndex)} pendingAction={getApprovalPendingAction(approverIndex)}>
                            <MenuItemWithTopDescription_1.default title={approver === null || approver === void 0 ? void 0 : approver.displayName} titleStyle={styles.textNormalThemeText} wrapperStyle={styles.sectionMenuItemTopDescription} description={approverDescription(approverIndex)} descriptionTextStyle={!!(approver === null || approver === void 0 ? void 0 : approver.displayName) && styles.textLabelSupportingNormal} onPress={function () { return editApprover(approverIndex); }} shouldShowRightIcon hintText={hintText} shouldRenderHintAsHTML brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText} shouldRenderErrorAsHTML/>
                        </OfflineWithFeedback_1.default>);
        })}

                <MenuItemWithTopDescription_1.default description={approverCount > 0 ? translate('workflowsCreateApprovalsPage.additionalApprover') : translate('workflowsPage.approver')} onPress={addAdditionalApprover} shouldShowRightIcon wrapperStyle={styles.sectionMenuItemTopDescription} errorText={((_d = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.errors) === null || _d === void 0 ? void 0 : _d.additionalApprover) ? translate(approvalWorkflow.errors.additionalApprover) : undefined} brickRoadIndicator={((_e = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.errors) === null || _e === void 0 ? void 0 : _e.additionalApprover) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>

                {!!removeApprovalWorkflow && !approvalWorkflow.isDefault && (<MenuItem_1.default wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt6]} icon={Expensicons.Trashcan} title={translate('common.delete')} onPress={removeApprovalWorkflow}/>)}
            </react_native_1.View>
        </ScrollView_1.default>);
}
ApprovalWorkflowEditor.displayName = 'ApprovalWorkflowEditor';
exports.default = (0, react_1.forwardRef)(ApprovalWorkflowEditor);
