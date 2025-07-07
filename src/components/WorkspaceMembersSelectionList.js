"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useScreenWrapperTransitionStatus_1 = require("@hooks/useScreenWrapperTransitionStatus");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var MemberRightIcon_1 = require("@pages/workspace/MemberRightIcon");
var CONST_1 = require("@src/CONST");
var Expensicons_1 = require("./Icon/Expensicons");
var OnyxProvider_1 = require("./OnyxProvider");
var SelectionList_1 = require("./SelectionList");
var InviteMemberListItem_1 = require("./SelectionList/InviteMemberListItem");
function WorkspaceMembersSelectionList(_a) {
    var policyID = _a.policyID, selectedApprover = _a.selectedApprover, setApprover = _a.setApprover;
    var translate = (0, useLocalize_1.default)().translate;
    var didScreenTransitionEnd = (0, useScreenWrapperTransitionStatus_1.default)().didScreenTransitionEnd;
    var _b = (0, useDebouncedState_1.default)(''), searchTerm = _b[0], debouncedSearchTerm = _b[1], setSearchTerm = _b[2];
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var policy = (0, usePolicy_1.default)(policyID);
    var sections = (0, react_1.useMemo)(function () {
        var approvers = [];
        if (policy === null || policy === void 0 ? void 0 : policy.employeeList) {
            var availableApprovers = Object.values(policy.employeeList)
                .map(function (employee) {
                var _a, _b;
                var email = employee.email;
                if (!email) {
                    return null;
                }
                var policyMemberEmailsToAccountIDs = (0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList);
                var accountID = Number((_a = policyMemberEmailsToAccountIDs[email]) !== null && _a !== void 0 ? _a : '');
                var _c = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) !== null && _b !== void 0 ? _b : {}, avatar = _c.avatar, _d = _c.displayName, displayName = _d === void 0 ? email : _d, login = _c.login;
                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: selectedApprover === email,
                    login: email,
                    icons: [{ source: avatar !== null && avatar !== void 0 ? avatar : Expensicons_1.FallbackAvatar, type: CONST_1.default.ICON_TYPE_AVATAR, name: displayName, id: accountID }],
                    rightElement: (<MemberRightIcon_1.default role={employee.role} owner={policy === null || policy === void 0 ? void 0 : policy.owner} login={login}/>),
                };
            })
                .filter(function (approver) { return !!approver; });
            approvers.push.apply(approvers, availableApprovers);
        }
        var filteredApprovers = (0, tokenizedSearch_1.default)(approvers, (0, OptionsListUtils_1.getSearchValueForPhoneOrEmail)(debouncedSearchTerm), function (approver) { var _a, _b; return [(_a = approver.text) !== null && _a !== void 0 ? _a : '', (_b = approver.login) !== null && _b !== void 0 ? _b : '']; });
        return [
            {
                title: undefined,
                data: (0, OptionsListUtils_1.sortAlphabetically)(filteredApprovers, 'text'),
                shouldShow: true,
            },
        ];
    }, [debouncedSearchTerm, personalDetails, policy === null || policy === void 0 ? void 0 : policy.employeeList, policy === null || policy === void 0 ? void 0 : policy.owner, selectedApprover]);
    var handleOnSelectRow = function (approver) {
        setApprover(approver.login);
    };
    var headerMessage = (0, react_1.useMemo)(function () { var _a; return (searchTerm && !((_a = sections.at(0)) === null || _a === void 0 ? void 0 : _a.data.length) ? translate('common.noResultsFound') : ''); }, [searchTerm, sections, translate]);
    return (<SelectionList_1.default sections={sections} ListItem={InviteMemberListItem_1.default} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} textInputValue={searchTerm} onChangeText={setSearchTerm} headerMessage={headerMessage} onSelectRow={handleOnSelectRow} showScrollIndicator showLoadingPlaceholder={!didScreenTransitionEnd} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} addBottomSafeAreaPadding/>);
}
exports.default = WorkspaceMembersSelectionList;
