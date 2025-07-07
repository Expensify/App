"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var Workflow = require("@userActions/Workflow");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ApprovalWorkflowEditor_1 = require("./ApprovalWorkflowEditor");
function WorkspaceWorkflowsApprovalsCreatePage(_a) {
    var policy = _a.policy, _b = _a.isLoadingReportData, isLoadingReportData = _b === void 0 ? true : _b, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var approvalWorkflow = (0, useOnyx_1.default)(ONYXKEYS_1.default.APPROVAL_WORKFLOW)[0];
    var formRef = (0, react_1.useRef)(null);
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundView = ((0, EmptyObject_1.isEmptyObject)(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy);
    var createApprovalWorkflow = (0, react_1.useCallback)(function () {
        if (!approvalWorkflow) {
            return;
        }
        if (!Workflow.validateApprovalWorkflow(approvalWorkflow)) {
            return;
        }
        Workflow.createApprovalWorkflow(route.params.policyID, approvalWorkflow);
        Navigation_1.default.dismissModal();
    }, [approvalWorkflow, route.params.policyID]);
    var submitButtonContainerStyles = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({ addBottomSafeAreaPadding: true, style: [styles.mb5, styles.mh5] });
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceWorkflowsApprovalsCreatePage.displayName}>
                <FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundView} subtitleKey={(0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized'} onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy} onLinkPress={PolicyUtils.goBackFromInvalidPolicy} addBottomSafeAreaPadding>
                    <HeaderWithBackButton_1.default title={translate('workflowsCreateApprovalsPage.title')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, 0)); }}/>
                    {!!approvalWorkflow && (<>
                            <ApprovalWorkflowEditor_1.default approvalWorkflow={approvalWorkflow} policy={policy} policyID={route.params.policyID} ref={formRef}/>
                            <FormAlertWithSubmitButton_1.default isAlertVisible={!(0, EmptyObject_1.isEmptyObject)(approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.errors)} onSubmit={createApprovalWorkflow} onFixTheErrorsLinkPressed={function () {
                var _a;
                (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ y: 0, animated: true });
            }} buttonText={translate('workflowsCreateApprovalsPage.submitButton')} containerStyles={submitButtonContainerStyles} enabledWhenOffline/>
                        </>)}
                    {!approvalWorkflow && <FullscreenLoadingIndicator_1.default />}
                </FullPageNotFoundView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceWorkflowsApprovalsCreatePage.displayName = 'WorkspaceWorkflowsApprovalsCreatePage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceWorkflowsApprovalsCreatePage);
