"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Xero = require("@libs/actions/connections/Xero");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var variables_1 = require("@styles/variables");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function XeroOrganizationConfigurationPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy, organizationID = _a.route.params.organizationID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var tenants = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getXeroTenants)(policy !== null && policy !== void 0 ? policy : undefined); }, [policy]);
    var xeroConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.xero) === null || _c === void 0 ? void 0 : _c.config;
    var currentXeroOrganization = (0, PolicyUtils_1.findCurrentXeroOrganization)(tenants, xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.tenantID);
    var policyID = (_d = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _d !== void 0 ? _d : '-1';
    var sections = (_h = (_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.xero) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.tenants.map(function (tenant) { return ({
        value: tenant.id,
        text: tenant.name,
        keyForList: tenant.id,
        isSelected: tenant.id === organizationID,
    }); })) !== null && _h !== void 0 ? _h : [];
    var listHeaderComponent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.pb2, styles.ph5]}>
                <Text_1.default style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.organizationDescription')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal]);
    var saveSelection = function (_a) {
        var keyForList = _a.keyForList;
        if (!keyForList) {
            return;
        }
        Xero.updateXeroTenantID(policyID, keyForList, xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.tenantID);
        Navigation_1.default.goBack();
    };
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.xero.noAccountsFound')} subtitle={translate('workspace.xero.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={XeroOrganizationConfigurationPage.displayName} sections={sections.length ? [{ data: sections }] : []} listItem={RadioListItem_1.default} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO} onSelectRow={saveSelection} initiallyFocusedOptionKey={currentXeroOrganization === null || currentXeroOrganization === void 0 ? void 0 : currentXeroOrganization.id} headerContent={listHeaderComponent} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID)); }} title="workspace.xero.organization" listEmptyContent={listEmptyContent} pendingAction={(_j = xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.pendingFields) === null || _j === void 0 ? void 0 : _j.tenantID} errors={ErrorUtils.getLatestErrorField(xeroConfig !== null && xeroConfig !== void 0 ? xeroConfig : {}, CONST_1.default.XERO_CONFIG.TENANT_ID)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return Policy.clearXeroErrorField(policyID, CONST_1.default.XERO_CONFIG.TENANT_ID); }} shouldSingleExecuteRowSelect/>);
}
XeroOrganizationConfigurationPage.displayName = 'PolicyXeroOrganizationConfigurationPage';
exports.default = (0, withPolicy_1.default)(XeroOrganizationConfigurationPage);
