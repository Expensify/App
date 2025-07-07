"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemList_1 = require("@components/MenuItemList");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteExistingConnectionsPage(_a) {
    var route = _a.route;
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, datetimeToRelative = _b.datetimeToRelative;
    var styles = (0, useThemeStyles_1.default)();
    var policiesConnectedToSageNetSuite = (0, Policy_1.getAdminPoliciesConnectedToNetSuite)();
    var policyID = route.params.policyID;
    var menuItems = policiesConnectedToSageNetSuite.map(function (policy) {
        var _a;
        var lastSuccessfulSyncDate = (_a = policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite.lastSyncDate;
        var date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            avatarID: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policy.name),
            iconType: CONST_1.default.ICON_TYPE_WORKSPACE,
            description: date
                ? translate('workspace.common.lastSyncDate', {
                    connectionName: CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.netsuite,
                    formattedDate: date,
                })
                : translate('workspace.accounting.netsuite'),
            onPress: function () {
                (0, connections_1.copyExistingPolicyConnection)(policy.id, policyID, CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE);
                Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_ACCOUNTING.getRoute(policyID));
            },
        };
    });
    return (<ConnectionLayout_1.default displayName={NetSuiteExistingConnectionsPage.displayName} headerTitle="workspace.common.existingConnections" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.flex1]} titleStyle={styles.ph5} shouldLoadForEmptyConnection connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_ACCOUNTING.getRoute(policyID)); }}>
            <react_native_1.View style={[styles.flex1]}>
                <MenuItemList_1.default menuItems={menuItems} shouldUseSingleExecution/>
            </react_native_1.View>
        </ConnectionLayout_1.default>);
}
NetSuiteExistingConnectionsPage.displayName = 'NetSuiteExistingConnectionsPage';
exports.default = NetSuiteExistingConnectionsPage;
