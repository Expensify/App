"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils = require("@libs/PolicyUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils = require("@libs/ReportUtils");
var IOU = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepSendFrom(_a) {
    var route = _a.route, transaction = _a.transaction;
    var translate = (0, useLocalize_1.default)().translate;
    var _b = route.params, transactionID = _b.transactionID, backTo = _b.backTo;
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; } })[0];
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY)[0];
    var selectedWorkspace = (0, react_1.useMemo)(function () { var _a; return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _a === void 0 ? void 0 : _a.find(function (participant) { return participant.isSender; }); }, [transaction]);
    var workspaceOptions = (0, react_1.useMemo)(function () {
        var availableWorkspaces = PolicyUtils.getActiveAdminWorkspaces(allPolicies, currentUserLogin).filter(function (policy) { return PolicyUtils.canSendInvoiceFromWorkspace(policy.id); });
        return availableWorkspaces
            .sort(function (policy1, policy2) { return (0, PolicyUtils_1.sortWorkspacesBySelected)({ policyID: policy1.id, name: policy1.name }, { policyID: policy2.id, name: policy2.name }, selectedWorkspace === null || selectedWorkspace === void 0 ? void 0 : selectedWorkspace.policyID); })
            .map(function (policy) { return ({
            text: policy.name,
            value: policy.id,
            keyForList: policy.id,
            icons: [
                {
                    id: policy.id,
                    source: (policy === null || policy === void 0 ? void 0 : policy.avatarURL) ? policy.avatarURL : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                    fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                    name: policy.name,
                    type: CONST_1.default.ICON_TYPE_WORKSPACE,
                },
            ],
            isSelected: (selectedWorkspace === null || selectedWorkspace === void 0 ? void 0 : selectedWorkspace.policyID) === policy.id,
        }); });
    }, [allPolicies, currentUserLogin, selectedWorkspace]);
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var selectWorkspace = function (item) {
        var _a;
        var newParticipants = ((_a = transaction === null || transaction === void 0 ? void 0 : transaction.participants) !== null && _a !== void 0 ? _a : []).filter(function (participant) { return participant.accountID; });
        newParticipants.push({
            policyID: item.value,
            isSender: true,
            selected: false,
        });
        IOU.setMoneyRequestParticipants(transactionID, newParticipants);
        navigateBack();
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('workspace.invoices.sendFrom')} onBackButtonPress={navigateBack} shouldShowWrapper testID={IOURequestStepSendFrom.displayName} includeSafeAreaPaddingBottom>
            <SelectionList_1.default sections={[{ data: workspaceOptions, title: translate('common.workspaces') }]} onSelectRow={selectWorkspace} shouldSingleExecuteRowSelect ListItem={UserListItem_1.default} initiallyFocusedOptionKey={selectedWorkspace === null || selectedWorkspace === void 0 ? void 0 : selectedWorkspace.policyID}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepSendFrom.displayName = 'IOURequestStepSendFrom';
exports.default = (0, withWritableReportOrNotFound_1.default)((0, withFullTransactionOrNotFound_1.default)(IOURequestStepSendFrom));
