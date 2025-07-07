"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemList_1 = require("@components/MenuItemList");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function ExistingConnectionsPage(_a) {
    var route = _a.route;
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, datetimeToRelative = _b.datetimeToRelative;
    var styles = (0, useThemeStyles_1.default)();
    var policiesConnectedToSageIntacct = (0, Policy_1.getAdminPoliciesConnectedToSageIntacct)();
    var policyID = route.params.policyID;
    var menuItems = policiesConnectedToSageIntacct.map(function (policy) {
        var _a, _b;
        var lastSuccessfulSyncDate = (_b = (_a = policy.connections) === null || _a === void 0 ? void 0 : _a.intacct.lastSync) === null || _b === void 0 ? void 0 : _b.successfulDate;
        var date = lastSuccessfulSyncDate ? datetimeToRelative(lastSuccessfulSyncDate) : undefined;
        return {
            title: policy.name,
            key: policy.id,
            avatarID: policy.id,
            icon: policy.avatarURL ? policy.avatarURL : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policy.name),
            iconType: CONST_1.default.ICON_TYPE_WORKSPACE,
            shouldShowRightIcon: true,
            description: date
                ? translate('workspace.common.lastSyncDate', {
                    connectionName: CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.intacct,
                    formattedDate: date,
                })
                : translate('workspace.accounting.intacct'),
            onPress: function () {
                (0, connections_1.copyExistingPolicyConnection)(policy.id, policyID, CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT);
                Navigation_1.default.dismissModal();
            },
        };
    });
    return (<ScreenWrapper_1.default shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen testID={ExistingConnectionsPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('workspace.common.connectTo', { connectionName: CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT })} shouldShowBackButton onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <ScrollView_1.default style={[styles.flex1]}>
                <Text_1.default style={[styles.mh5, styles.mb4]}>{translate('workspace.common.existingConnectionsDescription', { connectionName: CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT })}</Text_1.default>
                <MenuItem_1.default title={translate('workspace.common.createNewConnection')} icon={Expensicons_1.LinkCopy} iconStyles={{ borderRadius: variables_1.default.componentBorderRadiusNormal }} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID, Navigation_1.default.getActiveRoute())); }}/>
                <Text_1.default style={[styles.sectionTitle, styles.pl5, styles.pr5, styles.pb2, styles.mt3]}>{translate('workspace.common.existingConnections')}</Text_1.default>
                <MenuItemList_1.default menuItems={menuItems} shouldUseSingleExecution/>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
ExistingConnectionsPage.displayName = 'ExistingConnectionsPage';
exports.default = ExistingConnectionsPage;
