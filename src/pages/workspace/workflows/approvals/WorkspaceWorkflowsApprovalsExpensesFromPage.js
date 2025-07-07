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
var useDeepCompareRef_1 = require("@hooks/useDeepCompareRef");
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
function WorkspaceWorkflowsApprovalsExpensesFromPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy, _e = _a.isLoadingReportData, isLoadingReportData = _e === void 0 ? true : _e, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _f = (0, useDebouncedState_1.default)(''), searchTerm = _f[0], debouncedSearchTerm = _f[1], setSearchTerm = _f[2];
    var _g = (0, useOnyx_1.default)(ONYXKEYS_1.default.APPROVAL_WORKFLOW, { canBeMissing: true }), approvalWorkflow = _g[0], approvalWorkflowResults = _g[1];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var isLoadingApprovalWorkflow = (0, isLoadingOnyxValue_1.default)(approvalWorkflowResults);
    var _h = (0, react_1.useState)([]), selectedMembers = _h[0], setSelectedMembers = _h[1];
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundView = ((0, EmptyObject_1.isEmptyObject)(policy) && !isLoadingReportData) || !(0, PolicyUtils_1.isPolicyAdmin)(policy) || (0, PolicyUtils_1.isPendingDeletePolicy)(policy);
    var isInitialCreationFlow = (approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.action) === CONST_1.default.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    var shouldShowListEmptyContent = !isLoadingApprovalWorkflow && approvalWorkflow && approvalWorkflow.availableMembers.length === 0;
    var firstApprover = (_d = (_c = (_b = approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.approvers) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.email) !== null && _d !== void 0 ? _d : '';
    var personalDetailLogins = (0, useDeepCompareRef_1.default)(Object.fromEntries(Object.entries(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}).map(function (_a) {
        var id = _a[0], details = _a[1];
        return [id, details === null || details === void 0 ? void 0 : details.login];
    })));
    (0, react_1.useEffect)(function () {
        if (!(approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.members)) {
            return;
        }
        setSelectedMembers(approvalWorkflow.members.map(function (member) {
            var _a, _b, _c, _d;
            var policyMemberEmailsToAccountIDs = (0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList);
            var accountID = Number((_a = policyMemberEmailsToAccountIDs[member.email]) !== null && _a !== void 0 ? _a : '');
            var login = personalDetailLogins === null || personalDetailLogins === void 0 ? void 0 : personalDetailLogins[accountID];
            return {
                text: member.displayName,
                alternateText: member.email,
                keyForList: member.email,
                isSelected: true,
                login: member.email,
                icons: [{ source: (_b = member.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar, type: CONST_1.default.ICON_TYPE_AVATAR, name: member.displayName, id: accountID }],
                rightElement: (<MemberRightIcon_1.default role={(_d = (_c = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _c === void 0 ? void 0 : _c[member.email]) === null || _d === void 0 ? void 0 : _d.role} owner={policy === null || policy === void 0 ? void 0 : policy.owner} login={login}/>),
            };
        }));
    }, [approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.members, policy === null || policy === void 0 ? void 0 : policy.employeeList, policy === null || policy === void 0 ? void 0 : policy.owner, personalDetailLogins, translate]);
    var approversEmail = (0, react_1.useMemo)(function () { return approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.approvers.map(function (member) { return member === null || member === void 0 ? void 0 : member.email; }); }, [approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.approvers]);
    var sections = (0, react_1.useMemo)(function () {
        var members = __spreadArray([], selectedMembers, true);
        if (approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.availableMembers) {
            var availableMembers = approvalWorkflow.availableMembers
                .map(function (member) {
                var _a, _b, _c, _d;
                var policyMemberEmailsToAccountIDs = (0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList);
                var accountID = Number((_a = policyMemberEmailsToAccountIDs[member.email]) !== null && _a !== void 0 ? _a : '');
                var login = personalDetailLogins === null || personalDetailLogins === void 0 ? void 0 : personalDetailLogins[accountID];
                return {
                    text: member.displayName,
                    alternateText: member.email,
                    keyForList: member.email,
                    isSelected: false,
                    login: member.email,
                    icons: [{ source: (_b = member.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar, type: CONST_1.default.ICON_TYPE_AVATAR, name: member.displayName, id: accountID }],
                    rightElement: (<MemberRightIcon_1.default role={(_d = (_c = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _c === void 0 ? void 0 : _c[member.email]) === null || _d === void 0 ? void 0 : _d.role} owner={policy === null || policy === void 0 ? void 0 : policy.owner} login={login}/>),
                };
            })
                .filter(function (member) { return (!(policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval) || !(approversEmail === null || approversEmail === void 0 ? void 0 : approversEmail.includes(member.login))) && !selectedMembers.some(function (selectedOption) { return selectedOption.login === member.login; }); });
            members.push.apply(members, availableMembers);
        }
        var filteredMembers = debouncedSearchTerm !== '' ? (0, tokenizedSearch_1.default)(members, (0, OptionsListUtils_1.getSearchValueForPhoneOrEmail)(debouncedSearchTerm), function (option) { var _a, _b; return [(_a = option.text) !== null && _a !== void 0 ? _a : '', (_b = option.login) !== null && _b !== void 0 ? _b : '']; }) : members;
        return [
            {
                title: undefined,
                data: (0, OptionsListUtils_1.sortAlphabetically)(filteredMembers, 'text'),
                shouldShow: true,
            },
        ];
    }, [approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.availableMembers, debouncedSearchTerm, policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval, policy === null || policy === void 0 ? void 0 : policy.employeeList, policy === null || policy === void 0 ? void 0 : policy.owner, selectedMembers, approversEmail, personalDetailLogins]);
    var goBack = (0, react_1.useCallback)(function () {
        var backTo;
        if ((approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.action) === CONST_1.default.APPROVAL_WORKFLOW.ACTION.EDIT) {
            backTo = ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover);
        }
        else if (!isInitialCreationFlow) {
            backTo = ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID);
        }
        Navigation_1.default.goBack(backTo);
    }, [isInitialCreationFlow, route.params.policyID, firstApprover, approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.action]);
    var nextStep = (0, react_1.useCallback)(function () {
        var members = selectedMembers.map(function (member) { var _a, _b; return ({ displayName: member.text, avatar: (_b = (_a = member.icons) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.source, email: member.login }); });
        (0, Workflow_1.setApprovalWorkflowMembers)(members);
        if (isInitialCreationFlow) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, 0));
        }
        else {
            goBack();
        }
    }, [route.params.policyID, selectedMembers, isInitialCreationFlow, goBack]);
    var button = (0, react_1.useMemo)(function () {
        var buttonText = isInitialCreationFlow ? translate('common.next') : translate('common.save');
        if (shouldShowListEmptyContent) {
            buttonText = translate('common.buttonConfirm');
        }
        return (<FormAlertWithSubmitButton_1.default isDisabled={!shouldShowListEmptyContent && !selectedMembers.length} buttonText={buttonText} onSubmit={shouldShowListEmptyContent ? function () { return Navigation_1.default.goBack(); } : nextStep} containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]} enabledWhenOffline/>);
    }, [isInitialCreationFlow, nextStep, selectedMembers.length, shouldShowListEmptyContent, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate]);
    var toggleMember = function (member) {
        var isAlreadySelected = selectedMembers.some(function (selectedOption) { return selectedOption.login === member.login; });
        setSelectedMembers(isAlreadySelected ? selectedMembers.filter(function (selectedOption) { return selectedOption.login !== member.login; }) : __spreadArray(__spreadArray([], selectedMembers, true), [__assign(__assign({}, member), { isSelected: true })], false));
    };
    var headerMessage = (0, react_1.useMemo)(function () { var _a, _b; return (searchTerm && !((_b = (_a = sections.at(0)) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.length) ? translate('common.noResultsFound') : ''); }, [searchTerm, sections, translate]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TurtleInShell} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workflowsPage.emptyContent.title')} subtitle={translate('workflowsPage.emptyContent.expensesFromSubtitle')} subtitleStyle={styles.textSupporting} containerStyle={styles.pb10} contentFitImage="contain"/>); }, [translate, styles.textSupporting, styles.pb10]);
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceWorkflowsApprovalsExpensesFromPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
                <FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundView} subtitleKey={(0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized'} onBackButtonPress={PolicyUtils_1.goBackFromInvalidPolicy} onLinkPress={PolicyUtils_1.goBackFromInvalidPolicy} addBottomSafeAreaPadding>
                    <HeaderWithBackButton_1.default title={translate('workflowsExpensesFromPage.title')} onBackButtonPress={goBack}/>

                    {(approvalWorkflow === null || approvalWorkflow === void 0 ? void 0 : approvalWorkflow.action) === CONST_1.default.APPROVAL_WORKFLOW.ACTION.CREATE && !shouldShowListEmptyContent && (<Text_1.default style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsExpensesFromPage.header')}</Text_1.default>)}
                    <SelectionList_1.default canSelectMultiple sections={sections} ListItem={InviteMemberListItem_1.default} textInputLabel={shouldShowListEmptyContent ? undefined : translate('selectionList.findMember')} textInputValue={searchTerm} onChangeText={setSearchTerm} headerMessage={headerMessage} onSelectRow={toggleMember} showScrollIndicator shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} footerContent={button} listEmptyContent={listEmptyContent} shouldShowListEmptyContent={shouldShowListEmptyContent} showLoadingPlaceholder={isLoadingApprovalWorkflow} addBottomSafeAreaPadding/>
                </FullPageNotFoundView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceWorkflowsApprovalsExpensesFromPage.displayName = 'WorkspaceWorkflowsApprovalsExpensesFromPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceWorkflowsApprovalsExpensesFromPage);
