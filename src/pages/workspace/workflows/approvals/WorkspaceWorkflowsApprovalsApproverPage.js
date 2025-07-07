"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var InviteMemberListItem_1 = require("@components/SelectionList/InviteMemberListItem");
var Text_1 = require("@components/Text");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Workflow_1 = require("@libs/actions/Workflow");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var MemberRightIcon_1 = require("@pages/workspace/MemberRightIcon");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function WorkspaceWorkflowsApprovalsApproverPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy, personalDetails = _a.personalDetails, _h = _a.isLoadingReportData, isLoadingReportData = _h === void 0 ? true : _h, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _j = (0, useDebouncedState_1.default)(''), searchTerm = _j[0], debouncedSearchTerm = _j[1], setSearchTerm = _j[2];
    var _k = (0, useOnyx_1.default)(ONYXKEYS_1.default.APPROVAL_WORKFLOW, { canBeMissing: true }), approvalWorkflow = _k[0], approvalWorkflowMetadata = _k[1];
    var isApprovalWorkflowLoading = (0, isLoadingOnyxValue_1.default)(approvalWorkflowMetadata);
    var _l = (0, react_1.useState)(undefined), selectedApproverEmail = _l[0], setSelectedApproverEmail = _l[1];
    var _m = (0, react_1.useState)([]), allApprovers = _m[0], setAllApprovers = _m[1];
    var shouldShowTextInput = (allApprovers === null || allApprovers === void 0 ? void 0 : allApprovers.length) >= CONST_1.default.STANDARD_LIST_ITEM_LIMIT;
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundView = ((0, EmptyObject_1.isEmptyObject)(policy) && !isLoadingReportData) || !(0, PolicyUtils_1.isPolicyAdmin)(policy) || (0, PolicyUtils_1.isPendingDeletePolicy)(policy);
    var approverIndex = (_b = Number(route.params.approverIndex)) !== null && _b !== void 0 ? _b : 0;
    var isInitialCreationFlow = (approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.action) === CONST_1.default.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    var defaultApprover = (_c = policy === null || policy === void 0 ? void 0 : policy.approver) !== null && _c !== void 0 ? _c : policy === null || policy === void 0 ? void 0 : policy.owner;
    var firstApprover = (_f = (_e = (_d = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.approvers) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.email) !== null && _f !== void 0 ? _f : '';
    var rhpRoutes = (0, native_1.useNavigationState)(function (state) { return state.routes; });
    (0, react_1.useEffect)(function () {
        var currentApprover = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.approvers[approverIndex];
        if (!currentApprover) {
            return;
        }
        setSelectedApproverEmail(currentApprover.email);
    }, [approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.approvers, approverIndex]);
    var employeeList = policy === null || policy === void 0 ? void 0 : policy.employeeList;
    var approversFromWorkflow = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.approvers;
    var isDefault = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.isDefault;
    var membersEmail = (0, react_1.useMemo)(function () { return approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.members.map(function (member) { return member.email; }); }, [approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.members]);
    var sections = (0, react_1.useMemo)(function () {
        var approvers = [];
        if (isApprovalWorkflowLoading) {
            return [];
        }
        if (employeeList) {
            var availableApprovers = Object.values(employeeList)
                .map(function (employee) {
                var _a, _b;
                var email = employee.email;
                if (!email) {
                    return null;
                }
                if ((policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval) && (membersEmail === null || membersEmail === void 0 ? void 0 : membersEmail.includes(email))) {
                    return null;
                }
                // Do not allow the same email to be added twice
                var isEmailAlreadyInApprovers = approversFromWorkflow === null || approversFromWorkflow === void 0 ? void 0 : approversFromWorkflow.some(function (approver, index) { return (approver === null || approver === void 0 ? void 0 : approver.email) === email && index !== approverIndex; });
                if (isEmailAlreadyInApprovers && selectedApproverEmail !== email) {
                    return null;
                }
                // Do not allow the default approver to be added as the first approver
                if (!isDefault && approverIndex === 0 && defaultApprover === email) {
                    return null;
                }
                var policyMemberEmailsToAccountIDs = (0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(employeeList);
                var accountID = Number((_a = policyMemberEmailsToAccountIDs[email]) !== null && _a !== void 0 ? _a : '');
                var _c = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) !== null && _b !== void 0 ? _b : {}, avatar = _c.avatar, _d = _c.displayName, displayName = _d === void 0 ? email : _d, login = _c.login;
                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: selectedApproverEmail === email,
                    login: email,
                    icons: [{ source: avatar !== null && avatar !== void 0 ? avatar : Expensicons_1.FallbackAvatar, type: CONST_1.default.ICON_TYPE_AVATAR, name: displayName, id: accountID }],
                    rightElement: (<MemberRightIcon_1.default role={employee.role} owner={policy === null || policy === void 0 ? void 0 : policy.owner} login={login}/>),
                };
            })
                .filter(function (approver) { return !!approver; });
            approvers.push.apply(approvers, availableApprovers);
            // eslint-disable-next-line react-compiler/react-compiler
            setAllApprovers(approvers);
        }
        var filteredApprovers = debouncedSearchTerm !== '' ? (0, tokenizedSearch_1.default)(approvers, (0, OptionsListUtils_1.getSearchValueForPhoneOrEmail)(debouncedSearchTerm), function (option) { var _a, _b; return [(_a = option.text) !== null && _a !== void 0 ? _a : '', (_b = option.login) !== null && _b !== void 0 ? _b : '']; }) : approvers;
        var data = (0, OptionsListUtils_1.sortAlphabetically)(filteredApprovers, 'text');
        return [
            {
                title: undefined,
                data: data,
                shouldShow: true,
            },
        ];
    }, [
        isApprovalWorkflowLoading,
        approversFromWorkflow,
        isDefault,
        approverIndex,
        debouncedSearchTerm,
        defaultApprover,
        personalDetails,
        employeeList,
        selectedApproverEmail,
        membersEmail,
        policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval,
        policy === null || policy === void 0 ? void 0 : policy.owner,
    ]);
    var shouldShowListEmptyContent = !debouncedSearchTerm && !!approvalWorkflow && !((_g = sections.at(0)) === null || _g === void 0 ? void 0 : _g.data.length) && !isApprovalWorkflowLoading;
    var goBack = (0, react_1.useCallback)(function () {
        var backTo;
        if (isInitialCreationFlow) {
            backTo = ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID);
            (0, Workflow_1.clearApprovalWorkflowApprovers)();
        }
        else if ((approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.action) === CONST_1.default.APPROVAL_WORKFLOW.ACTION.EDIT) {
            backTo = rhpRoutes.length > 1 ? undefined : ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover);
        }
        else {
            backTo = ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID);
        }
        Navigation_1.default.goBack(backTo);
    }, [isInitialCreationFlow, approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.action, route.params.policyID, rhpRoutes.length, firstApprover]);
    var nextStep = (0, react_1.useCallback)(function () {
        var _a, _b;
        if (selectedApproverEmail) {
            var policyMemberEmailsToAccountIDs = (0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(employeeList);
            var accountID = Number((_a = policyMemberEmailsToAccountIDs[selectedApproverEmail]) !== null && _a !== void 0 ? _a : '');
            var _c = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) !== null && _b !== void 0 ? _b : {}, avatar = _c.avatar, _d = _c.displayName, displayName = _d === void 0 ? selectedApproverEmail : _d;
            (0, Workflow_1.setApprovalWorkflowApprover)({
                email: selectedApproverEmail,
                avatar: avatar,
                displayName: displayName,
            }, approverIndex, route.params.policyID);
        }
        else {
            (0, Workflow_1.clearApprovalWorkflowApprover)(approverIndex);
        }
        if (isInitialCreationFlow) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID));
        }
        else {
            goBack();
        }
    }, [selectedApproverEmail, employeeList, personalDetails, approverIndex, route.params.policyID, isInitialCreationFlow, goBack]);
    var button = (0, react_1.useMemo)(function () {
        var buttonText = isInitialCreationFlow ? translate('common.next') : translate('common.save');
        if (shouldShowListEmptyContent) {
            buttonText = translate('common.buttonConfirm');
        }
        return (<FormAlertWithSubmitButton_1.default isDisabled={!shouldShowListEmptyContent && !selectedApproverEmail && isInitialCreationFlow} buttonText={buttonText} onSubmit={nextStep} containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]} enabledWhenOffline shouldBlendOpacity/>);
    }, [isInitialCreationFlow, nextStep, selectedApproverEmail, shouldShowListEmptyContent, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate]);
    var toggleApprover = (0, react_1.useCallback)(function (approver) {
        return (0, debounce_1.default)(function () {
            if (selectedApproverEmail === approver.login) {
                setSelectedApproverEmail(undefined);
                return;
            }
            setSelectedApproverEmail(approver.login);
        }, 200)();
    }, [selectedApproverEmail]);
    var headerMessage = (0, react_1.useMemo)(function () { var _a, _b; return (searchTerm && !((_b = (_a = sections.at(0)) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.length) ? translate('common.noResultsFound') : ''); }, [searchTerm, sections, translate]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TurtleInShell} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workflowsPage.emptyContent.title')} subtitle={translate('workflowsPage.emptyContent.approverSubtitle')} subtitleStyle={styles.textSupporting} containerStyle={styles.pb10} contentFitImage="contain"/>); }, [translate, styles.textSupporting, styles.pb10]);
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceWorkflowsApprovalsApproverPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
                <FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundView} subtitleKey={(0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized'} onBackButtonPress={PolicyUtils_1.goBackFromInvalidPolicy} onLinkPress={PolicyUtils_1.goBackFromInvalidPolicy} addBottomSafeAreaPadding>
                    <HeaderWithBackButton_1.default title={translate('workflowsPage.approver')} onBackButtonPress={goBack}/>
                    {(approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.action) === CONST_1.default.APPROVAL_WORKFLOW.ACTION.CREATE && !shouldShowListEmptyContent && (<Text_1.default style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsApproverPage.header')}</Text_1.default>)}
                    <SelectionList_1.default sections={sections} ListItem={InviteMemberListItem_1.default} textInputLabel={shouldShowListEmptyContent ? undefined : translate('selectionList.findMember')} textInputValue={searchTerm} onChangeText={setSearchTerm} headerMessage={headerMessage} onSelectRow={toggleApprover} showScrollIndicator shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} footerContent={button} listEmptyContent={listEmptyContent} shouldShowListEmptyContent={shouldShowListEmptyContent} initiallyFocusedOptionKey={selectedApproverEmail} shouldUpdateFocusedIndex shouldShowTextInput={shouldShowTextInput} addBottomSafeAreaPadding/>
                </FullPageNotFoundView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceWorkflowsApprovalsApproverPage.displayName = 'WorkspaceWorkflowsApprovalsApproverPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceWorkflowsApprovalsApproverPage);
