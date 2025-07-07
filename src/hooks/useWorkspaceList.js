"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function useWorkspaceList(_a) {
    var policies = _a.policies, currentUserLogin = _a.currentUserLogin, selectedPolicyID = _a.selectedPolicyID, searchTerm = _a.searchTerm, shouldShowPendingDeletePolicy = _a.shouldShowPendingDeletePolicy, additionalFilter = _a.additionalFilter;
    var usersWorkspaces = (0, react_1.useMemo)(function () {
        if (!policies || (0, EmptyObject_1.isEmptyObject)(policies)) {
            return [];
        }
        return Object.values(policies)
            .filter(function (policy) {
            return !!policy &&
                (0, PolicyUtils_1.shouldShowPolicy)(policy, shouldShowPendingDeletePolicy, currentUserLogin) &&
                !(policy === null || policy === void 0 ? void 0 : policy.isJoinRequestPending) &&
                (additionalFilter ? additionalFilter(policy) : true);
        })
            .map(function (policy) {
            var _a;
            return ({
                text: (_a = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _a !== void 0 ? _a : '',
                policyID: policy === null || policy === void 0 ? void 0 : policy.id,
                icons: [
                    {
                        source: (policy === null || policy === void 0 ? void 0 : policy.avatarURL) ? policy.avatarURL : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policy === null || policy === void 0 ? void 0 : policy.name),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policy === null || policy === void 0 ? void 0 : policy.name,
                        type: CONST_1.default.ICON_TYPE_WORKSPACE,
                        id: policy === null || policy === void 0 ? void 0 : policy.id,
                    },
                ],
                keyForList: policy === null || policy === void 0 ? void 0 : policy.id,
                isPolicyAdmin: (0, PolicyUtils_1.isPolicyAdmin)(policy),
                isSelected: selectedPolicyID === (policy === null || policy === void 0 ? void 0 : policy.id),
            });
        });
    }, [policies, shouldShowPendingDeletePolicy, currentUserLogin, additionalFilter, selectedPolicyID]);
    var filteredAndSortedUserWorkspaces = (0, react_1.useMemo)(function () {
        return (0, tokenizedSearch_1.default)(usersWorkspaces, searchTerm, function (policy) { return [policy.text]; }).sort(function (policy1, policy2) {
            return (0, PolicyUtils_1.sortWorkspacesBySelected)({ policyID: policy1.policyID, name: policy1.text }, { policyID: policy2.policyID, name: policy2.text }, selectedPolicyID);
        });
    }, [searchTerm, usersWorkspaces, selectedPolicyID]);
    var sections = (0, react_1.useMemo)(function () {
        var options = [
            {
                data: filteredAndSortedUserWorkspaces,
                shouldShow: true,
                indexOffset: 1,
            },
        ];
        return options;
    }, [filteredAndSortedUserWorkspaces]);
    var shouldShowNoResultsFoundMessage = filteredAndSortedUserWorkspaces.length === 0 && usersWorkspaces.length;
    var shouldShowSearchInput = usersWorkspaces.length >= CONST_1.default.STANDARD_LIST_ITEM_LIMIT;
    return {
        sections: sections,
        shouldShowNoResultsFoundMessage: shouldShowNoResultsFoundMessage,
        shouldShowSearchInput: shouldShowSearchInput,
    };
}
exports.default = useWorkspaceList;
