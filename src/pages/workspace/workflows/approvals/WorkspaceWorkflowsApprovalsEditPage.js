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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var WorkflowUtils_1 = require("@libs/WorkflowUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var Workflow_1 = require("@userActions/Workflow");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ApprovalWorkflowEditor_1 = require("./ApprovalWorkflowEditor");
function WorkspaceWorkflowsApprovalsEditPage(_a) {
    var policy = _a.policy, _b = _a.isLoadingReportData, isLoadingReportData = _b === void 0 ? true : _b, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST)[0];
    var approvalWorkflow = (0, useOnyx_1.default)(ONYXKEYS_1.default.APPROVAL_WORKFLOW)[0];
    var _c = (0, react_1.useState)(), initialApprovalWorkflow = _c[0], setInitialApprovalWorkflow = _c[1];
    var _d = (0, react_1.useState)(false), isDeleteModalVisible = _d[0], setIsDeleteModalVisible = _d[1];
    var formRef = (0, react_1.useRef)(null);
    var updateApprovalWorkflowCallback = (0, react_1.useCallback)(function () {
        if (!approvalWorkflow || !initialApprovalWorkflow) {
            return;
        }
        if (!(0, Workflow_1.validateApprovalWorkflow)(approvalWorkflow)) {
            return;
        }
        // We need to remove members and approvers that are no longer in the updated workflow
        var membersToRemove = initialApprovalWorkflow.members.filter(function (initialMember) { return !approvalWorkflow.members.some(function (member) { return member.email === initialMember.email; }); });
        var approversToRemove = initialApprovalWorkflow.approvers.filter(function (initialApprover) { return !approvalWorkflow.approvers.some(function (approver) { return approver.email === initialApprover.email; }); });
        Navigation_1.default.dismissModal();
        react_native_1.InteractionManager.runAfterInteractions(function () {
            (0, Workflow_1.updateApprovalWorkflow)(route.params.policyID, approvalWorkflow, membersToRemove, approversToRemove);
        });
    }, [approvalWorkflow, initialApprovalWorkflow, route.params.policyID]);
    var removeApprovalWorkflowCallback = (0, react_1.useCallback)(function () {
        if (!initialApprovalWorkflow) {
            return;
        }
        setIsDeleteModalVisible(false);
        Navigation_1.default.dismissModal();
        react_native_1.InteractionManager.runAfterInteractions(function () {
            // Remove the approval workflow using the initial data as it could be already edited
            (0, Workflow_1.removeApprovalWorkflow)(route.params.policyID, initialApprovalWorkflow);
        });
    }, [initialApprovalWorkflow, route.params.policyID]);
    var _e = (0, react_1.useMemo)(function () {
        var _a, _b;
        if (!policy || !personalDetails) {
            return {};
        }
        var defaultApprover = (_a = policy === null || policy === void 0 ? void 0 : policy.approver) !== null && _a !== void 0 ? _a : policy.owner;
        var firstApprover = route.params.firstApproverEmail;
        var result = (0, WorkflowUtils_1.convertPolicyEmployeesToApprovalWorkflows)({
            employees: (_b = policy.employeeList) !== null && _b !== void 0 ? _b : {},
            defaultApprover: defaultApprover,
            personalDetails: personalDetails,
            firstApprover: firstApprover,
        });
        return {
            defaultWorkflowMembers: result.availableMembers,
            usedApproverEmails: result.usedApproverEmails,
            currentApprovalWorkflow: result.approvalWorkflows.find(function (workflow) { var _a; return ((_a = workflow.approvers.at(0)) === null || _a === void 0 ? void 0 : _a.email) === firstApprover; }),
        };
    }, [personalDetails, policy, route.params.firstApproverEmail]), currentApprovalWorkflow = _e.currentApprovalWorkflow, defaultWorkflowMembers = _e.defaultWorkflowMembers, usedApproverEmails = _e.usedApproverEmails;
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundView = ((0, EmptyObject_1.isEmptyObject)(policy) && !isLoadingReportData) || !(0, PolicyUtils_1.isPolicyAdmin)(policy) || (0, PolicyUtils_1.isPendingDeletePolicy)(policy) || !currentApprovalWorkflow;
    // Set the initial approval workflow when the page is loaded
    (0, react_1.useEffect)(function () {
        if (initialApprovalWorkflow) {
            return;
        }
        if (!currentApprovalWorkflow) {
            return (0, Workflow_1.clearApprovalWorkflow)();
        }
        (0, Workflow_1.setApprovalWorkflow)(__assign(__assign({}, currentApprovalWorkflow), { availableMembers: __spreadArray(__spreadArray([], currentApprovalWorkflow.members, true), defaultWorkflowMembers, true), usedApproverEmails: usedApproverEmails, action: CONST_1.default.APPROVAL_WORKFLOW.ACTION.EDIT, errors: null }));
        setInitialApprovalWorkflow(currentApprovalWorkflow);
    }, [currentApprovalWorkflow, defaultWorkflowMembers, initialApprovalWorkflow, usedApproverEmails]);
    var submitButtonContainerStyles = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({ addBottomSafeAreaPadding: true, style: [styles.mb5, styles.mh5] });
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceWorkflowsApprovalsEditPage.displayName}>
                <FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundView} subtitleKey={(0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized'} onBackButtonPress={PolicyUtils_1.goBackFromInvalidPolicy} onLinkPress={PolicyUtils_1.goBackFromInvalidPolicy} addBottomSafeAreaPadding>
                    <HeaderWithBackButton_1.default title={translate('workflowsEditApprovalsPage.title')} onBackButtonPress={Navigation_1.default.goBack}/>
                    {!!approvalWorkflow && (<>
                            <ApprovalWorkflowEditor_1.default approvalWorkflow={approvalWorkflow} removeApprovalWorkflow={function () { return setIsDeleteModalVisible(true); }} policy={policy} policyID={route.params.policyID} ref={formRef}/>
                            <FormAlertWithSubmitButton_1.default isAlertVisible={!(0, EmptyObject_1.isEmptyObject)(approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.errors)} onSubmit={updateApprovalWorkflowCallback} onFixTheErrorsLinkPressed={function () {
                var _a;
                (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ y: 0, animated: true });
            }} buttonText={translate('common.save')} containerStyles={submitButtonContainerStyles} enabledWhenOffline/>
                        </>)}
                    {!initialApprovalWorkflow && <FullscreenLoadingIndicator_1.default />}
                </FullPageNotFoundView_1.default>
                <ConfirmModal_1.default title={translate('workflowsEditApprovalsPage.deleteTitle')} isVisible={isDeleteModalVisible} onConfirm={removeApprovalWorkflowCallback} onCancel={function () { return setIsDeleteModalVisible(false); }} prompt={translate('workflowsEditApprovalsPage.deletePrompt')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceWorkflowsApprovalsEditPage.displayName = 'WorkspaceWorkflowsApprovalsEditPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceWorkflowsApprovalsEditPage);
