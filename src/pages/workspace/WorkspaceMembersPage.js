"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var native_1 = require("@react-navigation/native");
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DecisionModal_1 = require("@components/DecisionModal");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations_1 = require("@components/Icon/Illustrations");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var MessagesRow_1 = require("@components/MessagesRow");
var SearchBar_1 = require("@components/SearchBar");
var TableListItem_1 = require("@components/SelectionList/TableListItem");
var SelectionListWithModal_1 = require("@components/SelectionListWithModal");
var CustomListHeader_1 = require("@components/SelectionListWithModal/CustomListHeader");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useFilteredSelection_1 = require("@hooks/useFilteredSelection");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchBackPress_1 = require("@hooks/useSearchBackPress");
var useSearchResults_1 = require("@hooks/useSearchResults");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var Member_1 = require("@libs/actions/Policy/Member");
var Workflow_1 = require("@libs/actions/Workflow");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var WorkflowUtils_1 = require("@libs/WorkflowUtils");
var Modal_1 = require("@userActions/Modal");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var MemberRightIcon_1 = require("./MemberRightIcon");
var withPolicyAndFullscreenLoading_1 = require("./withPolicyAndFullscreenLoading");
var WorkspacePageWithSections_1 = require("./WorkspacePageWithSections");
/**
 * Inverts an object, equivalent of _.invert
 */
function invertObject(object) {
    var invertedEntries = Object.entries(object).map(function (_a) {
        var key = _a[0], value = _a[1];
        return [value, key];
    });
    return Object.fromEntries(invertedEntries);
}
function WorkspaceMembersPage(_a) {
    var _b, _c;
    var personalDetails = _a.personalDetails, route = _a.route, policy = _a.policy;
    var _d = (0, react_1.useMemo)(function () {
        var _a;
        var emailsToAccountIDs = (0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList, true);
        var details = Object.keys((_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {}).reduce(function (acc, email) {
            var _a;
            var employee = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[email];
            var accountID = emailsToAccountIDs[email];
            if (!employee) {
                return acc;
            }
            acc[accountID] = employee;
            return acc;
        }, {});
        return { policyMemberEmailsToAccountIDs: emailsToAccountIDs, employeeListDetails: details };
    }, [policy === null || policy === void 0 ? void 0 : policy.employeeList]), policyMemberEmailsToAccountIDs = _d.policyMemberEmailsToAccountIDs, employeeListDetails = _d.employeeListDetails;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _e = (0, react_1.useState)(false), removeMembersConfirmModalVisible = _e[0], setRemoveMembersConfirmModalVisible = _e[1];
    var _f = (0, react_1.useState)({}), errors = _f[0], setErrors = _f[1];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var prevIsOffline = (0, usePrevious_1.default)(isOffline);
    var accountIDs = (0, react_1.useMemo)(function () { return Object.values(policyMemberEmailsToAccountIDs !== null && policyMemberEmailsToAccountIDs !== void 0 ? policyMemberEmailsToAccountIDs : {}).map(function (accountID) { return Number(accountID); }); }, [policyMemberEmailsToAccountIDs]);
    var prevAccountIDs = (0, usePrevious_1.default)(accountIDs);
    var textInputRef = (0, react_1.useRef)(null);
    var _g = (0, react_1.useState)(false), isOfflineModalVisible = _g[0], setIsOfflineModalVisible = _g[1];
    var _h = (0, react_1.useState)(false), isDownloadFailureModalVisible = _h[0], setIsDownloadFailureModalVisible = _h[1];
    var isOfflineAndNoMemberDataAvailable = (0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.employeeList) && isOffline;
    var prevPersonalDetails = (0, usePrevious_1.default)(personalDetails);
    var _j = (0, useLocalize_1.default)(), translate = _j.translate, formatPhoneNumber = _j.formatPhoneNumber;
    var _k = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _k.isAccountLocked, showLockedAccountModal = _k.showLockedAccountModal;
    var filterEmployees = (0, react_1.useCallback)(function (employee) {
        var _a;
        if (!(employee === null || employee === void 0 ? void 0 : employee.email)) {
            return false;
        }
        var employeeAccountID = (0, PersonalDetailsUtils_1.getAccountIDsByLogins)([employee.email]).at(0);
        if (!employeeAccountID) {
            return false;
        }
        var isPendingDelete = ((_a = employeeListDetails === null || employeeListDetails === void 0 ? void 0 : employeeListDetails[employeeAccountID]) === null || _a === void 0 ? void 0 : _a.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        return accountIDs.includes(employeeAccountID) && !isPendingDelete;
    }, [accountIDs, employeeListDetails]);
    var _l = (0, useFilteredSelection_1.default)(employeeListDetails, filterEmployees), selectedEmployees = _l[0], setSelectedEmployees = _l[1];
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _m = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _m.shouldUseNarrowLayout, isSmallScreenWidth = _m.isSmallScreenWidth;
    var isPolicyAdmin = (0, PolicyUtils_1.isPolicyAdmin)(policy);
    var isLoading = (0, react_1.useMemo)(function () { return !isOfflineAndNoMemberDataAvailable && (!(0, OptionsListUtils_1.isPersonalDetailsReady)(personalDetails) || (0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.employeeList)); }, [isOfflineAndNoMemberDataAvailable, personalDetails, policy === null || policy === void 0 ? void 0 : policy.employeeList]);
    var invitedEmailsToAccountIDsDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT).concat(route.params.policyID.toString()), { canBeMissing: true })[0];
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var currentUserAccountID = Number(session === null || session === void 0 ? void 0 : session.accountID);
    var selectionListRef = (0, react_1.useRef)(null);
    var isFocused = (0, native_1.useIsFocused)();
    var policyID = route.params.policyID;
    var ownerDetails = (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_b = policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID]) !== null && _c !== void 0 ? _c : {};
    var policyApproverEmail = policy === null || policy === void 0 ? void 0 : policy.approver;
    var approvalWorkflows = (0, react_1.useMemo)(function () {
        var _a, _b;
        return (0, WorkflowUtils_1.convertPolicyEmployeesToApprovalWorkflows)({
            employees: (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {},
            defaultApprover: (_b = policyApproverEmail !== null && policyApproverEmail !== void 0 ? policyApproverEmail : policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _b !== void 0 ? _b : '',
            personalDetails: personalDetails !== null && personalDetails !== void 0 ? personalDetails : {},
        });
    }, [personalDetails, policy === null || policy === void 0 ? void 0 : policy.employeeList, policy === null || policy === void 0 ? void 0 : policy.owner, policyApproverEmail]).approvalWorkflows;
    var canSelectMultiple = isPolicyAdmin && (shouldUseNarrowLayout ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true);
    var confirmModalPrompt = (0, react_1.useMemo)(function () {
        var _a, _b;
        var approverAccountID = selectedEmployees.find(function (selectedEmployee) { return (0, Member_1.isApprover)(policy, selectedEmployee); });
        if (!approverAccountID) {
            return translate('workspace.people.removeMembersPrompt', {
                count: selectedEmployees.length,
                memberName: (0, LocalePhoneNumber_1.formatPhoneNumber)((_b = (_a = (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({ accountIDs: selectedEmployees, currentUserAccountID: currentUserAccountID }).at(0)) === null || _a === void 0 ? void 0 : _a.displayName) !== null && _b !== void 0 ? _b : ''),
            });
        }
        return translate('workspace.people.removeMembersWarningPrompt', {
            memberName: (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: approverAccountID }),
            ownerName: (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: policy === null || policy === void 0 ? void 0 : policy.ownerAccountID }),
        });
    }, [selectedEmployees, translate, policy, currentUserAccountID]);
    /**
     * Get filtered personalDetails list with current employeeList
     */
    var filterPersonalDetails = function (members, details) {
        return Object.keys(members !== null && members !== void 0 ? members : {}).reduce(function (acc, key) {
            var _a;
            var memberAccountIdKey = (_a = policyMemberEmailsToAccountIDs[key]) !== null && _a !== void 0 ? _a : '';
            if (details === null || details === void 0 ? void 0 : details[memberAccountIdKey]) {
                acc[memberAccountIdKey] = details[memberAccountIdKey];
            }
            return acc;
        }, {});
    };
    /**
     * Get members for the current workspace
     */
    var getWorkspaceMembers = (0, react_1.useCallback)(function () {
        (0, Member_1.openWorkspaceMembersPage)(route.params.policyID, Object.keys((0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList)));
    }, [route.params.policyID, policy === null || policy === void 0 ? void 0 : policy.employeeList]);
    /**
     * Check if the current selection includes members that cannot be removed
     */
    var validateSelection = (0, react_1.useCallback)(function () {
        var newErrors = {};
        selectedEmployees.forEach(function (member) {
            if (member !== (policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) && member !== (session === null || session === void 0 ? void 0 : session.accountID)) {
                return;
            }
            newErrors[member] = translate('workspace.people.error.cannotRemove');
        });
        setErrors(newErrors);
    }, [selectedEmployees, policy === null || policy === void 0 ? void 0 : policy.ownerAccountID, session === null || session === void 0 ? void 0 : session.accountID, translate]);
    (0, react_1.useEffect)(function () {
        getWorkspaceMembers();
    }, [getWorkspaceMembers]);
    (0, react_1.useEffect)(function () {
        validateSelection();
    }, [validateSelection]);
    (0, react_1.useEffect)(function () {
        if (removeMembersConfirmModalVisible && !(0, fast_equals_1.deepEqual)(accountIDs, prevAccountIDs)) {
            setRemoveMembersConfirmModalVisible(false);
        }
        setSelectedEmployees(function (prevSelectedEmployees) {
            var _a;
            // Filter all personal details in order to use the elements needed for the current workspace
            var currentPersonalDetails = filterPersonalDetails((_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {}, personalDetails);
            // We need to filter the previous selected employees by the new personal details, since unknown/new user id's change when transitioning from offline to online
            var prevSelectedElements = prevSelectedEmployees.map(function (id) {
                var _a;
                var prevItem = prevPersonalDetails === null || prevPersonalDetails === void 0 ? void 0 : prevPersonalDetails[id];
                var res = Object.values(currentPersonalDetails).find(function (item) { return (prevItem === null || prevItem === void 0 ? void 0 : prevItem.login) === (item === null || item === void 0 ? void 0 : item.login); });
                return (_a = res === null || res === void 0 ? void 0 : res.accountID) !== null && _a !== void 0 ? _a : id;
            });
            var currentSelectedElements = Object.entries((0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList))
                .filter(function (employee) { var _a, _b; return ((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[employee[0]]) === null || _b === void 0 ? void 0 : _b.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; })
                .map(function (employee) { return employee[1]; });
            // This is an equivalent of the lodash intersection function. The reduce method below is used to filter the items that exist in both arrays.
            return [prevSelectedElements, currentSelectedElements].reduce(function (prev, members) { return prev.filter(function (item) { return members.includes(item); }); });
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [policy === null || policy === void 0 ? void 0 : policy.employeeList, policyMemberEmailsToAccountIDs]);
    (0, react_1.useEffect)(function () {
        var isReconnecting = prevIsOffline && !isOffline;
        if (!isReconnecting) {
            return;
        }
        getWorkspaceMembers();
    }, [isOffline, prevIsOffline, getWorkspaceMembers]);
    /**
     * Open the modal to invite a user
     */
    var inviteUser = (0, react_1.useCallback)(function () {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        (0, Member_1.clearInviteDraft)(route.params.policyID);
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INVITE.getRoute(route.params.policyID, Navigation_1.default.getActiveRouteWithoutParams()));
    }, [route.params.policyID, isAccountLocked, showLockedAccountModal]);
    /**
     * Remove selected users from the workspace
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
     */
    var removeUsers = function () {
        if (!(0, EmptyObject_1.isEmptyObject)(errors)) {
            return;
        }
        // Remove the admin from the list
        var accountIDsToRemove = (session === null || session === void 0 ? void 0 : session.accountID) ? selectedEmployees.filter(function (id) { return id !== session.accountID; }) : selectedEmployees;
        // Check if any of the account IDs are approvers
        var hasApprovers = accountIDsToRemove.some(function (accountID) { return (0, Member_1.isApprover)(policy, accountID); });
        if (hasApprovers) {
            var ownerEmail_1 = ownerDetails.login;
            accountIDsToRemove.forEach(function (accountID) {
                var removedApprover = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
                if (!(removedApprover === null || removedApprover === void 0 ? void 0 : removedApprover.login) || !ownerEmail_1) {
                    return;
                }
                var updatedWorkflows = (0, WorkflowUtils_1.updateWorkflowDataOnApproverRemoval)({
                    approvalWorkflows: approvalWorkflows,
                    removedApprover: removedApprover,
                    ownerDetails: ownerDetails,
                });
                updatedWorkflows.forEach(function (workflow) {
                    if (workflow === null || workflow === void 0 ? void 0 : workflow.removeApprovalWorkflow) {
                        var removeApprovalWorkflow = workflow.removeApprovalWorkflow, updatedWorkflow = __rest(workflow, ["removeApprovalWorkflow"]);
                        (0, Workflow_1.removeApprovalWorkflow)(policyID, updatedWorkflow);
                    }
                    else {
                        (0, Workflow_1.updateApprovalWorkflow)(policyID, workflow, [], []);
                    }
                });
            });
        }
        setRemoveMembersConfirmModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedEmployees([]);
            (0, Member_1.removeMembers)(accountIDsToRemove, route.params.policyID);
        });
    };
    /**
     * Show the modal to confirm removal of the selected members
     */
    var askForConfirmationToRemove = function () {
        if (!(0, EmptyObject_1.isEmptyObject)(errors)) {
            return;
        }
        setRemoveMembersConfirmModalVisible(true);
    };
    /**
     * Add or remove all users passed from the selectedEmployees list
     */
    var toggleAllUsers = function (memberList) {
        var enabledAccounts = memberList.filter(function (member) { return !member.isDisabled && !member.isDisabledCheckbox; });
        var someSelected = enabledAccounts.some(function (member) { return selectedEmployees.includes(member.accountID); });
        if (someSelected) {
            setSelectedEmployees([]);
        }
        else {
            var everyAccountId = enabledAccounts.map(function (member) { return member.accountID; });
            setSelectedEmployees(everyAccountId);
        }
        validateSelection();
    };
    /**
     * Add user from the selectedEmployees list
     */
    var addUser = (0, react_1.useCallback)(function (accountID) {
        setSelectedEmployees(function (prevSelected) { return __spreadArray(__spreadArray([], prevSelected, true), [accountID], false); });
        validateSelection();
    }, [validateSelection, setSelectedEmployees]);
    /**
     * Remove user from the selectedEmployees list
     */
    var removeUser = (0, react_1.useCallback)(function (accountID) {
        setSelectedEmployees(function (prevSelected) { return prevSelected.filter(function (id) { return id !== accountID; }); });
        validateSelection();
    }, [validateSelection, setSelectedEmployees]);
    /**
     * Toggle user from the selectedEmployees list
     */
    var toggleUser = (0, react_1.useCallback)(function (accountID, pendingAction) {
        if (accountID === (policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) && accountID !== (session === null || session === void 0 ? void 0 : session.accountID)) {
            return;
        }
        if (pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }
        // Add or remove the user if the checkbox is enabled
        if (selectedEmployees.includes(accountID)) {
            removeUser(accountID);
        }
        else {
            addUser(accountID);
        }
    }, [selectedEmployees, addUser, removeUser, policy === null || policy === void 0 ? void 0 : policy.ownerAccountID, session === null || session === void 0 ? void 0 : session.accountID]);
    /** Opens the member details page */
    var openMemberDetails = (0, react_1.useCallback)(function (item) {
        if (!isPolicyAdmin || !(0, PolicyUtils_1.isPaidGroupPolicy)(policy)) {
            Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(item.accountID, Navigation_1.default.getActiveRoute()));
            return;
        }
        (0, Member_1.clearWorkspaceOwnerChangeFlow)(policyID);
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(route.params.policyID, item.accountID));
    }, [isPolicyAdmin, policy, policyID, route.params.policyID]);
    /**
     * Dismisses the errors on one item
     */
    var dismissError = (0, react_1.useCallback)(function (item) {
        if (item.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            (0, Member_1.clearDeleteMemberError)(route.params.policyID, item.accountID);
        }
        else {
            (0, Member_1.clearAddMemberError)(route.params.policyID, item.accountID);
        }
    }, [route.params.policyID]);
    var policyOwner = policy === null || policy === void 0 ? void 0 : policy.owner;
    var currentUserLogin = currentUserPersonalDetails.login;
    var invitedPrimaryToSecondaryLogins = (0, react_1.useMemo)(function () { var _a; return invertObject((_a = policy === null || policy === void 0 ? void 0 : policy.primaryLoginsInvited) !== null && _a !== void 0 ? _a : {}); }, [policy === null || policy === void 0 ? void 0 : policy.primaryLoginsInvited]);
    var data = (0, react_1.useMemo)(function () {
        var _a;
        var result = [];
        Object.entries((_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {}).forEach(function (_a) {
            var _b, _c, _d, _e, _f, _g;
            var email = _a[0], policyEmployee = _a[1];
            var accountID = Number((_b = policyMemberEmailsToAccountIDs[email]) !== null && _b !== void 0 ? _b : '');
            if ((0, PolicyUtils_1.isDeletedPolicyEmployee)(policyEmployee, isOffline)) {
                return;
            }
            var details = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
            if (!details) {
                Log_1.default.hmmm("[WorkspaceMembersPage] no personal details found for policy member with accountID: ".concat(accountID));
                return;
            }
            // If this policy is owned by Expensify then show all support (expensify.com or team.expensify.com) emails
            // We don't want to show guides as policy members unless the user is a guide. Some customers get confused when they
            // see random people added to their policy, but guides having access to the policies help set them up.
            if ((0, PolicyUtils_1.isExpensifyTeam)((_c = details === null || details === void 0 ? void 0 : details.login) !== null && _c !== void 0 ? _c : details === null || details === void 0 ? void 0 : details.displayName)) {
                if (policyOwner && currentUserLogin && !(0, PolicyUtils_1.isExpensifyTeam)(policyOwner) && !(0, PolicyUtils_1.isExpensifyTeam)(currentUserLogin)) {
                    return;
                }
            }
            var isPendingDeleteOrError = isPolicyAdmin && (policyEmployee.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !(0, EmptyObject_1.isEmptyObject)(policyEmployee.errors));
            result.push({
                keyForList: String(accountID),
                accountID: accountID,
                isDisabledCheckbox: !(isPolicyAdmin && accountID !== (policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) && accountID !== (session === null || session === void 0 ? void 0 : session.accountID)),
                isDisabled: isPendingDeleteOrError,
                isInteractive: !details.isOptimisticPersonalDetail,
                cursorStyle: details.isOptimisticPersonalDetail ? styles.cursorDefault : {},
                text: formatPhoneNumber((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(details)),
                alternateText: formatPhoneNumber((_d = details === null || details === void 0 ? void 0 : details.login) !== null && _d !== void 0 ? _d : ''),
                rightElement: (<MemberRightIcon_1.default role={policyEmployee.role} owner={policy === null || policy === void 0 ? void 0 : policy.owner} login={details.login}/>),
                icons: [
                    {
                        source: (_e = details.avatar) !== null && _e !== void 0 ? _e : Expensicons_1.FallbackAvatar,
                        name: formatPhoneNumber((_f = details === null || details === void 0 ? void 0 : details.login) !== null && _f !== void 0 ? _f : ''),
                        type: CONST_1.default.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: policyEmployee.errors,
                pendingAction: policyEmployee.pendingAction,
                // Note which secondary login was used to invite this primary login
                invitedSecondaryLogin: (details === null || details === void 0 ? void 0 : details.login) ? ((_g = invitedPrimaryToSecondaryLogins[details.login]) !== null && _g !== void 0 ? _g : '') : '',
            });
        });
        return result;
    }, [
        isOffline,
        currentUserLogin,
        formatPhoneNumber,
        invitedPrimaryToSecondaryLogins,
        personalDetails,
        policy === null || policy === void 0 ? void 0 : policy.owner,
        policy === null || policy === void 0 ? void 0 : policy.ownerAccountID,
        policy === null || policy === void 0 ? void 0 : policy.employeeList,
        policyMemberEmailsToAccountIDs,
        policyOwner,
        session === null || session === void 0 ? void 0 : session.accountID,
        styles.cursorDefault,
        isPolicyAdmin,
    ]);
    var filterMember = (0, react_1.useCallback)(function (memberOption, searchQuery) {
        var _a, _b, _c, _d;
        var memberText = StringUtils_1.default.normalize((_b = (_a = memberOption.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '');
        var alternateText = StringUtils_1.default.normalize((_d = (_c = memberOption.alternateText) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : '');
        var normalizedSearchQuery = StringUtils_1.default.normalize(searchQuery);
        return memberText.includes(normalizedSearchQuery) || alternateText.includes(normalizedSearchQuery);
    }, []);
    var sortMembers = (0, react_1.useCallback)(function (memberOptions) { return (0, OptionsListUtils_1.sortAlphabetically)(memberOptions, 'text'); }, []);
    var _o = (0, useSearchResults_1.default)(data, filterMember, sortMembers), inputValue = _o[0], setInputValue = _o[1], filteredData = _o[2];
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (!isFocused) {
            return;
        }
        if ((0, EmptyObject_1.isEmptyObject)(invitedEmailsToAccountIDsDraft) || accountIDs === prevAccountIDs) {
            return;
        }
        var invitedEmails = Object.values(invitedEmailsToAccountIDsDraft).map(String);
        (_b = (_a = selectionListRef.current) === null || _a === void 0 ? void 0 : _a.scrollAndHighlightItem) === null || _b === void 0 ? void 0 : _b.call(_a, invitedEmails);
        (0, Member_1.clearInviteDraft)(route.params.policyID);
    }, [invitedEmailsToAccountIDsDraft, isFocused, accountIDs, prevAccountIDs, route.params.policyID]);
    var headerMessage = (0, react_1.useMemo)(function () {
        if (isOfflineAndNoMemberDataAvailable) {
            return translate('workspace.common.mustBeOnlineToViewMembers');
        }
        return !isLoading && (0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.employeeList) ? translate('workspace.common.memberNotFound') : '';
    }, [isLoading, policy === null || policy === void 0 ? void 0 : policy.employeeList, translate, isOfflineAndNoMemberDataAvailable]);
    var getHeaderContent = function () { return (<react_native_1.View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
            <Text_1.default style={[styles.pl5, styles.mb5, styles.mt3, styles.textSupporting]}>{translate('workspace.people.membersListTitle')}</Text_1.default>
            {!(0, EmptyObject_1.isEmptyObject)(invitedPrimaryToSecondaryLogins) && (<MessagesRow_1.default type="success" 
        // eslint-disable-next-line @typescript-eslint/naming-convention
        messages={{ 0: translate('workspace.people.addedWithPrimary') }} containerStyles={[styles.pb5, styles.ph5]} onClose={function () { return (0, Policy_1.dismissAddedWithPrimaryLoginMessages)(policyID); }}/>)}
        </react_native_1.View>); };
    (0, react_1.useEffect)(function () {
        if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
            return;
        }
        setSelectedEmployees([]);
    }, [setSelectedEmployees, selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled]);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () { return setSelectedEmployees([]); },
        onNavigationCallBack: function () { return Navigation_1.default.goBack(); },
    });
    var getCustomListHeader = function () {
        if (filteredData.length === 0) {
            return null;
        }
        return (<CustomListHeader_1.default canSelectMultiple={canSelectMultiple} leftHeaderText={translate('common.member')} rightHeaderText={translate('common.role')}/>);
    };
    var changeUserRole = function (role) {
        if (!(0, EmptyObject_1.isEmptyObject)(errors)) {
            return;
        }
        var accountIDsToUpdate = selectedEmployees.filter(function (accountID) {
            var _a, _b, _c, _d;
            var email = (_b = (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : '';
            return ((_d = (_c = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _c === void 0 ? void 0 : _c[email]) === null || _d === void 0 ? void 0 : _d.role) !== role;
        });
        setSelectedEmployees([]);
        (0, Member_1.updateWorkspaceMembersRole)(route.params.policyID, accountIDsToUpdate, role);
    };
    var getBulkActionsButtonOptions = function () {
        var options = [
            {
                text: translate('workspace.people.removeMembersTitle', { count: selectedEmployees.length }),
                value: CONST_1.default.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: Expensicons_1.RemoveMembers,
                onSelected: askForConfirmationToRemove,
            },
        ];
        if (!(0, PolicyUtils_1.isPaidGroupPolicy)(policy)) {
            return options;
        }
        var selectedEmployeesRoles = selectedEmployees.map(function (accountID) {
            var _a, _b, _c, _d;
            var email = (_b = (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : '';
            return (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _c === void 0 ? void 0 : _c[email]) === null || _d === void 0 ? void 0 : _d.role;
        });
        var memberOption = {
            text: translate('workspace.people.makeMember'),
            value: CONST_1.default.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_MEMBER,
            icon: Expensicons_1.User,
            onSelected: function () { return changeUserRole(CONST_1.default.POLICY.ROLE.USER); },
        };
        var adminOption = {
            text: translate('workspace.people.makeAdmin'),
            value: CONST_1.default.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
            icon: Expensicons_1.MakeAdmin,
            onSelected: function () { return changeUserRole(CONST_1.default.POLICY.ROLE.ADMIN); },
        };
        var auditorOption = {
            text: translate('workspace.people.makeAuditor'),
            value: CONST_1.default.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_AUDITOR,
            icon: Expensicons_1.UserEye,
            onSelected: function () { return changeUserRole(CONST_1.default.POLICY.ROLE.AUDITOR); },
        };
        var hasAtLeastOneNonAuditorRole = selectedEmployeesRoles.some(function (role) { return role !== CONST_1.default.POLICY.ROLE.AUDITOR; });
        var hasAtLeastOneNonMemberRole = selectedEmployeesRoles.some(function (role) { return role !== CONST_1.default.POLICY.ROLE.USER; });
        var hasAtLeastOneNonAdminRole = selectedEmployeesRoles.some(function (role) { return role !== CONST_1.default.POLICY.ROLE.ADMIN; });
        if (hasAtLeastOneNonMemberRole) {
            options.push(memberOption);
        }
        if (hasAtLeastOneNonAdminRole) {
            options.push(adminOption);
        }
        if (hasAtLeastOneNonAuditorRole) {
            options.push(auditorOption);
        }
        return options;
    };
    var secondaryActions = (0, react_1.useMemo)(function () {
        if (!isPolicyAdmin) {
            return [];
        }
        var menuItems = [
            {
                icon: Expensicons_1.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: function () {
                    if (isAccountLocked) {
                        showLockedAccountModal();
                        return;
                    }
                    if (isOffline) {
                        (0, Modal_1.close)(function () { return setIsOfflineModalVisible(true); });
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBERS_IMPORT.getRoute(policyID));
                },
                value: CONST_1.default.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
            },
            {
                icon: Expensicons_1.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: function () {
                    if (isOffline) {
                        (0, Modal_1.close)(function () { return setIsOfflineModalVisible(true); });
                        return;
                    }
                    (0, Modal_1.close)(function () {
                        (0, Member_1.downloadMembersCSV)(policyID, function () {
                            setIsDownloadFailureModalVisible(true);
                        });
                    });
                },
                value: CONST_1.default.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            },
        ];
        return menuItems;
    }, [policyID, translate, isOffline, isPolicyAdmin, isAccountLocked, showLockedAccountModal]);
    var getHeaderButtons = function () {
        if (!isPolicyAdmin) {
            return null;
        }
        return (shouldUseNarrowLayout ? canSelectMultiple : selectedEmployees.length > 0) ? (<ButtonWithDropdownMenu_1.default shouldAlwaysShowDropdownMenu customText={translate('workspace.common.selected', { count: selectedEmployees.length })} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} onPress={function () { return null; }} options={getBulkActionsButtonOptions()} isSplitButton={false} style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]} isDisabled={!selectedEmployees.length}/>) : (<react_native_1.View style={[styles.flexRow, styles.gap2]}>
                <Button_1.default success onPress={inviteUser} text={translate('workspace.invite.member')} icon={Expensicons_1.Plus} innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]} style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}/>
                <ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={secondaryActions} isSplitButton={false} wrapperStyle={styles.flexGrow0}/>
            </react_native_1.View>);
    };
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && shouldUseNarrowLayout;
    var headerContent = (<>
            {shouldUseNarrowLayout && data.length > 0 && <react_native_1.View style={[styles.pr5]}>{getHeaderContent()}</react_native_1.View>}
            {!shouldUseNarrowLayout && (<>
                    {!!headerMessage && (<react_native_1.View style={[styles.ph5, styles.pb5]}>
                            <Text_1.default style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text_1.default>
                        </react_native_1.View>)}
                    {getHeaderContent()}
                </>)}
            {data.length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default inputValue={inputValue} onChangeText={setInputValue} label={translate('workspace.people.findMember')} shouldShowEmptyState={!filteredData.length}/>)}
        </>);
    return (<WorkspacePageWithSections_1.default headerText={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.members')} route={route} icon={!selectionModeHeader ? Illustrations_1.ReceiptWrangler : undefined} headerContent={!shouldUseNarrowLayout && getHeaderButtons()} testID={WorkspaceMembersPage.displayName} shouldShowLoading={false} shouldUseHeadlineHeader={!selectionModeHeader} shouldShowOfflineIndicatorInWideScreen shouldShowNonAdmin onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedEmployees([]);
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
                return;
            }
            Navigation_1.default.popToSidebar();
        }}>
            {function () { return (<>
                    {shouldUseNarrowLayout && <react_native_1.View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</react_native_1.View>}
                    <ConfirmModal_1.default isVisible={isOfflineModalVisible} onConfirm={function () { return setIsOfflineModalVisible(false); }} title={translate('common.youAppearToBeOffline')} prompt={translate('common.thisFeatureRequiresInternet')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false} onCancel={function () { return setIsOfflineModalVisible(false); }} shouldHandleNavigationBack/>

                    <ConfirmModal_1.default danger title={translate('workspace.people.removeMembersTitle', { count: selectedEmployees.length })} isVisible={removeMembersConfirmModalVisible} onConfirm={removeUsers} onCancel={function () { return setRemoveMembersConfirmModalVisible(false); }} prompt={confirmModalPrompt} confirmText={translate('common.remove')} cancelText={translate('common.cancel')} onModalHide={function () {
                react_native_1.InteractionManager.runAfterInteractions(function () {
                    if (!textInputRef.current) {
                        return;
                    }
                    textInputRef.current.focus();
                });
            }}/>
                    <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsDownloadFailureModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isDownloadFailureModalVisible} onClose={function () { return setIsDownloadFailureModalVisible(false); }}/>
                    <SelectionListWithModal_1.default ref={selectionListRef} canSelectMultiple={canSelectMultiple} sections={[{ data: filteredData, isDisabled: false }]} selectedItems={selectedEmployees.map(String)} ListItem={TableListItem_1.default} shouldUseDefaultRightHandSideCheckmark={false} turnOnSelectionModeOnLongPress={isPolicyAdmin} onTurnOnSelectionMode={function (item) { return item && toggleUser(item === null || item === void 0 ? void 0 : item.accountID); }} shouldUseUserSkeletonView disableKeyboardShortcuts={removeMembersConfirmModalVisible} headerMessage={shouldUseNarrowLayout ? headerMessage : undefined} onSelectRow={openMemberDetails} shouldSingleExecuteRowSelect={!isPolicyAdmin} onCheckboxPress={function (item) { return toggleUser(item.accountID); }} onSelectAll={filteredData.length > 0 ? function () { return toggleAllUsers(filteredData); } : undefined} onDismissError={dismissError} showLoadingPlaceholder={isLoading} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} textInputRef={textInputRef} listHeaderContent={headerContent} shouldShowListEmptyContent={false} customListHeader={getCustomListHeader()} listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]} showScrollIndicator={false} addBottomSafeAreaPadding/>
                </>); }}
        </WorkspacePageWithSections_1.default>);
}
WorkspaceMembersPage.displayName = 'WorkspaceMembersPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceMembersPage);
