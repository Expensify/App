"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceTaxesSettingsPage(_a) {
    var policyID = _a.route.params.policyID, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var menuItems = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return [
            {
                title: (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.name,
                description: translate('workspace.taxes.customTaxName'),
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAXES_SETTINGS_CUSTOM_TAX_NAME.getRoute(policyID)); },
                pendingAction: (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.name,
            },
            {
                title: (_g = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.taxes) === null || _e === void 0 ? void 0 : _e[(_f = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _f === void 0 ? void 0 : _f.defaultExternalID]) === null || _g === void 0 ? void 0 : _g.name,
                description: translate('workspace.taxes.workspaceDefault'),
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT.getRoute(policyID)); },
                pendingAction: (_j = (_h = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _h === void 0 ? void 0 : _h.pendingFields) === null || _j === void 0 ? void 0 : _j.defaultExternalID,
            },
            {
                title: (_o = (_l = (_k = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _k === void 0 ? void 0 : _k.taxes) === null || _l === void 0 ? void 0 : _l[(_m = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _m === void 0 ? void 0 : _m.foreignTaxDefault]) === null || _o === void 0 ? void 0 : _o.name,
                description: translate('workspace.taxes.foreignDefault'),
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT.getRoute(policyID)); },
                pendingAction: (_q = (_p = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _p === void 0 ? void 0 : _p.pendingFields) === null || _q === void 0 ? void 0 : _q.foreignTaxDefault,
            },
        ];
    }, [policy === null || policy === void 0 ? void 0 : policy.taxRates, policyID, translate]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceTaxesSettingsPage.displayName} style={styles.defaultModalContainer} enableEdgeToEdgeBottomSafeAreaPadding>
                <ScrollView_1.default contentContainerStyle={styles.flexGrow1} addBottomSafeAreaPadding>
                    <HeaderWithBackButton_1.default title={translate('common.settings')}/>
                    <react_native_1.View style={styles.flex1}>
                        {menuItems.map(function (item) { return (<OfflineWithFeedback_1.default key={item.description} pendingAction={item.pendingAction}>
                                <MenuItemWithTopDescription_1.default shouldShowRightIcon title={item.title} description={item.description} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={item.action}/>
                            </OfflineWithFeedback_1.default>); })}
                    </react_native_1.View>
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceTaxesSettingsPage.displayName = 'WorkspaceTaxesSettingsPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceTaxesSettingsPage);
