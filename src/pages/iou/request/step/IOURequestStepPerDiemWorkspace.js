"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepPerDiemWorkspace(_a) {
    var _b = _a.route.params, transactionID = _b.transactionID, action = _b.action, iouType = _b.iouType, transaction = _a.transaction;
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, useCurrentUserPersonalDetails_1.default)(), currentUserLogin = _c.login, accountID = _c.accountID;
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY)[0];
    var selectedWorkspace = (0, react_1.useMemo)(function () { var _a; return (_a = transaction === null || transaction === void 0 ? void 0 : transaction.participants) === null || _a === void 0 ? void 0 : _a[0]; }, [transaction]);
    var workspaceOptions = (0, react_1.useMemo)(function () {
        var availableWorkspaces = (0, PolicyUtils_1.getActivePolicies)(allPolicies, currentUserLogin).filter(function (policy) { return (0, PolicyUtils_1.canSubmitPerDiemExpenseFromWorkspace)(policy); });
        return availableWorkspaces
            .sort(function (policy1, policy2) { return (0, PolicyUtils_1.sortWorkspacesBySelected)({ policyID: policy1.id, name: policy1.name }, { policyID: policy2.id, name: policy2.name }, selectedWorkspace === null || selectedWorkspace === void 0 ? void 0 : selectedWorkspace.policyID); })
            .map(function (policy) { return ({
            text: policy.name,
            value: policy.id,
            keyForList: policy.id,
            icons: [
                {
                    id: policy.id,
                    source: (policy === null || policy === void 0 ? void 0 : policy.avatarURL) ? policy.avatarURL : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policy.name),
                    fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                    name: policy.name,
                    type: CONST_1.default.ICON_TYPE_WORKSPACE,
                },
            ],
            isSelected: (selectedWorkspace === null || selectedWorkspace === void 0 ? void 0 : selectedWorkspace.policyID) === policy.id,
        }); });
    }, [allPolicies, currentUserLogin, selectedWorkspace]);
    var selectWorkspace = function (item) {
        var _a, _b, _c;
        var policyExpenseReportID = (_a = (0, ReportUtils_1.getPolicyExpenseChat)(accountID, item.value)) === null || _a === void 0 ? void 0 : _a.reportID;
        if (!policyExpenseReportID) {
            return;
        }
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line deprecation/deprecation
        var selectedPolicy = (0, PolicyUtils_1.getPolicy)(item.value, allPolicies);
        var perDiemUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(selectedPolicy);
        (0, IOU_1.setMoneyRequestParticipants)(transactionID, [
            {
                selected: true,
                accountID: 0,
                isPolicyExpenseChat: true,
                reportID: policyExpenseReportID,
                policyID: item.value,
            },
        ]);
        (0, IOU_1.setCustomUnitID)(transactionID, (_b = perDiemUnit === null || perDiemUnit === void 0 ? void 0 : perDiemUnit.customUnitID) !== null && _b !== void 0 ? _b : CONST_1.default.CUSTOM_UNITS.FAKE_P2P_ID);
        (0, IOU_1.setMoneyRequestCategory)(transactionID, (_c = perDiemUnit === null || perDiemUnit === void 0 ? void 0 : perDiemUnit.defaultCategory) !== null && _c !== void 0 ? _c : '');
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, iouType, transactionID, policyExpenseReportID));
    };
    return (<SelectionList_1.default key={selectedWorkspace === null || selectedWorkspace === void 0 ? void 0 : selectedWorkspace.policyID} sections={[{ data: workspaceOptions, title: translate('common.workspaces') }]} onSelectRow={selectWorkspace} shouldSingleExecuteRowSelect ListItem={UserListItem_1.default} initiallyFocusedOptionKey={selectedWorkspace === null || selectedWorkspace === void 0 ? void 0 : selectedWorkspace.policyID}/>);
}
IOURequestStepPerDiemWorkspace.displayName = 'IOURequestStepPerDiemWorkspace';
exports.default = (0, withWritableReportOrNotFound_1.default)((0, withFullTransactionOrNotFound_1.default)(IOURequestStepPerDiemWorkspace));
