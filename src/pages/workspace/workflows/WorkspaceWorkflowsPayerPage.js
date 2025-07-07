"use strict";
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
var Badge_1 = require("@components/Badge");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function WorkspaceWorkflowsPayerPage(_a) {
    var _b, _c, _d;
    var route = _a.route, policy = _a.policy, personalDetails = _a.personalDetails, _e = _a.isLoadingReportData, isLoadingReportData = _e === void 0 ? true : _e;
    var translate = (0, useLocalize_1.default)().translate;
    var policyName = (_b = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _b !== void 0 ? _b : '';
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _f = (0, react_1.useState)(''), searchTerm = _f[0], setSearchTerm = _f[1];
    var isDeletedPolicyEmployee = (0, react_1.useCallback)(function (policyEmployee) { return !isOffline && policyEmployee.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && (0, EmptyObject_1.isEmptyObject)(policyEmployee.errors); }, [isOffline]);
    var _g = (0, react_1.useMemo)(function () {
        var _a;
        var policyAdminDetails = [];
        var authorizedPayerDetails = [];
        var policyMemberEmailsToAccountIDs = (0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList);
        Object.entries((_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {}).forEach(function (_a) {
            var _b, _c, _d, _e, _f, _g, _h;
            var email = _a[0], policyEmployee = _a[1];
            var accountID = (_b = policyMemberEmailsToAccountIDs === null || policyMemberEmailsToAccountIDs === void 0 ? void 0 : policyMemberEmailsToAccountIDs[email]) !== null && _b !== void 0 ? _b : '';
            var details = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
            if (!details) {
                Log_1.default.hmmm("[WorkspaceMembersPage] no personal details found for policy member with accountID: ".concat(accountID));
                return;
            }
            var isOwner = (policy === null || policy === void 0 ? void 0 : policy.owner) === (details === null || details === void 0 ? void 0 : details.login);
            var isAdmin = policyEmployee.role === CONST_1.default.POLICY.ROLE.ADMIN;
            var shouldSkipMember = isDeletedPolicyEmployee(policyEmployee) || (0, PolicyUtils_1.isExpensifyTeam)(details === null || details === void 0 ? void 0 : details.login) || (!isOwner && !isAdmin);
            if (shouldSkipMember) {
                return;
            }
            var roleBadge = <Badge_1.default text={isOwner ? translate('common.owner') : translate('common.admin')}/>;
            var isAuthorizedPayer = ((_c = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _c === void 0 ? void 0 : _c.reimburser) === (details === null || details === void 0 ? void 0 : details.login);
            var formattedMember = {
                keyForList: String(accountID),
                accountID: accountID,
                isSelected: isAuthorizedPayer,
                isDisabled: policyEmployee.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !(0, EmptyObject_1.isEmptyObject)(policyEmployee.errors),
                text: (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(details)),
                alternateText: (0, LocalePhoneNumber_1.formatPhoneNumber)((_d = details === null || details === void 0 ? void 0 : details.login) !== null && _d !== void 0 ? _d : ''),
                rightElement: roleBadge,
                icons: [
                    {
                        source: (_e = details.avatar) !== null && _e !== void 0 ? _e : Expensicons_1.FallbackAvatar,
                        name: (0, LocalePhoneNumber_1.formatPhoneNumber)((_f = details === null || details === void 0 ? void 0 : details.login) !== null && _f !== void 0 ? _f : ''),
                        type: CONST_1.default.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: policyEmployee.errors,
                pendingAction: ((_g = policyEmployee.pendingAction) !== null && _g !== void 0 ? _g : isAuthorizedPayer) ? (_h = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _h === void 0 ? void 0 : _h.reimburser : null,
            };
            if (isAuthorizedPayer) {
                authorizedPayerDetails.push(formattedMember);
            }
            else {
                policyAdminDetails.push(formattedMember);
            }
        });
        return [policyAdminDetails, authorizedPayerDetails];
    }, [personalDetails, policy === null || policy === void 0 ? void 0 : policy.employeeList, translate, (_c = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _c === void 0 ? void 0 : _c.reimburser, isDeletedPolicyEmployee, policy === null || policy === void 0 ? void 0 : policy.owner, (_d = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _d === void 0 ? void 0 : _d.reimburser]), formattedPolicyAdmins = _g[0], formattedAuthorizedPayer = _g[1];
    var sections = (0, react_1.useMemo)(function () {
        var sectionsArray = [];
        if (searchTerm !== '') {
            var searchValue = (0, OptionsListUtils_1.getSearchValueForPhoneOrEmail)(searchTerm);
            var filteredOptions = (0, tokenizedSearch_1.default)(__spreadArray(__spreadArray([], formattedPolicyAdmins, true), formattedAuthorizedPayer, true), searchValue, function (option) { var _a, _b; return [(_a = option.text) !== null && _a !== void 0 ? _a : '', (_b = option.login) !== null && _b !== void 0 ? _b : '']; });
            return [
                {
                    title: undefined,
                    data: filteredOptions,
                    shouldShow: true,
                },
            ];
        }
        sectionsArray.push({
            data: formattedAuthorizedPayer,
            shouldShow: true,
        });
        sectionsArray.push({
            title: translate('workflowsPayerPage.admins'),
            data: formattedPolicyAdmins,
            shouldShow: true,
        });
        return sectionsArray;
    }, [formattedPolicyAdmins, formattedAuthorizedPayer, translate, searchTerm]);
    var headerMessage = (0, react_1.useMemo)(function () { var _a; return (searchTerm && !((_a = sections.at(0)) === null || _a === void 0 ? void 0 : _a.data.length) ? translate('common.noResultsFound') : ''); }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [translate, sections]);
    var setPolicyAuthorizedPayer = function (member) {
        var _a, _b, _c;
        var authorizedPayerEmail = (_b = (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[member.accountID]) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : '';
        if (((_c = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _c === void 0 ? void 0 : _c.reimburser) === authorizedPayerEmail || (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) !== CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES) {
            Navigation_1.default.goBack();
            return;
        }
        (0, Policy_1.setWorkspacePayer)(policy === null || policy === void 0 ? void 0 : policy.id, authorizedPayerEmail);
        Navigation_1.default.goBack();
    };
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundPage = (0, react_1.useMemo)(function () { return ((0, EmptyObject_1.isEmptyObject)(policy) && !isLoadingReportData) || (0, PolicyUtils_1.isPendingDeletePolicy)(policy) || (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) !== CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES; }, [policy, isLoadingReportData]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={route.params.policyID}>
            <FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundPage} subtitleKey={(0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized'} onBackButtonPress={PolicyUtils_1.goBackFromInvalidPolicy} onLinkPress={PolicyUtils_1.goBackFromInvalidPolicy}>
                <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceWorkflowsPayerPage.displayName}>
                    <HeaderWithBackButton_1.default title={translate('workflowsPayerPage.title')} subtitle={policyName} onBackButtonPress={Navigation_1.default.goBack}/>
                    <SelectionList_1.default sections={sections} textInputLabel={translate('selectionList.findMember')} textInputValue={searchTerm} onChangeText={setSearchTerm} headerMessage={headerMessage} ListItem={UserListItem_1.default} onSelectRow={setPolicyAuthorizedPayer} shouldSingleExecuteRowSelect showScrollIndicator addBottomSafeAreaPadding/>
                </ScreenWrapper_1.default>
            </FullPageNotFoundView_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceWorkflowsPayerPage.displayName = 'WorkspaceWorkflowsPayerPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceWorkflowsPayerPage);
