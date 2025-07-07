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
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useAccordionAnimation_1 = require("@hooks/useAccordionAnimation");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var SageIntacct_1 = require("@userActions/connections/SageIntacct");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var utils_1 = require("./utils");
function SageIntacctReimbursableExpensesPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var styles = (0, useThemeStyles_1.default)();
    var _j = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.intacct) !== null && _c !== void 0 ? _c : {}, intacctData = _j.data, config = _j.config;
    var _k = (_g = (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.intacct) === null || _e === void 0 ? void 0 : _e.config) === null || _f === void 0 ? void 0 : _f.export) !== null && _g !== void 0 ? _g : {}, reimbursable = _k.reimbursable, reimbursableExpenseReportDefaultVendor = _k.reimbursableExpenseReportDefaultVendor;
    var route = (0, native_1.useRoute)();
    var backTo = (_h = route.params) === null || _h === void 0 ? void 0 : _h.backTo;
    var defaultVendorName = (0, utils_1.getDefaultVendorName)(reimbursableExpenseReportDefaultVendor, intacctData === null || intacctData === void 0 ? void 0 : intacctData.vendors);
    var expandedCondition = !(reimbursable !== CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT || !reimbursableExpenseReportDefaultVendor);
    var _l = (0, useAccordionAnimation_1.default)(expandedCondition), isAccordionExpanded = _l.isAccordionExpanded, shouldAnimateAccordionSection = _l.shouldAnimateAccordionSection;
    var renderDefault = function (item) {
        return (<OfflineWithFeedback_1.default key={item.description} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(item.subscribedSettings, config === null || config === void 0 ? void 0 : config.pendingFields)}>
                <MenuItemWithTopDescription_1.default key={item.title} title={item.title} description={item.description} shouldShowRightIcon onPress={item === null || item === void 0 ? void 0 : item.onPress} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(item.subscribedSettings, config === null || config === void 0 ? void 0 : config.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
            </OfflineWithFeedback_1.default>);
    };
    var menuItems = [
        {
            type: 'menuitem',
            title: reimbursable ? translate("workspace.sageIntacct.reimbursableExpenses.values.".concat(reimbursable)) : translate('workspace.sageIntacct.notConfigured'),
            description: translate('workspace.accounting.exportAs'),
            onPress: function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_DESTINATION.getRoute(policyID, Navigation_1.default.getActiveRoute()));
            },
            subscribedSettings: [CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE],
        },
        {
            type: 'toggle',
            title: translate('workspace.sageIntacct.defaultVendor'),
            key: 'Default vendor toggle',
            subtitle: translate('workspace.sageIntacct.defaultVendorDescription', { isReimbursable: true }),
            shouldPlaceSubtitleBelowSwitch: true,
            isActive: !!(config === null || config === void 0 ? void 0 : config.export.reimbursableExpenseReportDefaultVendor),
            switchAccessibilityLabel: translate('workspace.sageIntacct.defaultVendor'),
            onToggle: function (enabled) {
                var _a, _b, _c, _d;
                if (!policyID) {
                    return;
                }
                var vendor = enabled ? (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.vendors) === null || _d === void 0 ? void 0 : _d[0].id : '';
                (0, SageIntacct_1.updateSageIntacctDefaultVendor)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR, vendor !== null && vendor !== void 0 ? vendor : '', config === null || config === void 0 ? void 0 : config.export.reimbursableExpenseReportDefaultVendor);
                isAccordionExpanded.set(enabled);
                shouldAnimateAccordionSection.set(true);
            },
            onCloseError: function () { return (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR); },
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR], config === null || config === void 0 ? void 0 : config.pendingFields),
            errors: (0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR),
            shouldHide: reimbursable !== CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT,
        },
        {
            type: 'accordion',
            children: [
                {
                    type: 'menuitem',
                    title: defaultVendorName && defaultVendorName !== '' ? defaultVendorName : translate('workspace.sageIntacct.notConfigured'),
                    description: translate('workspace.sageIntacct.defaultVendor'),
                    onPress: function () {
                        if (!policyID) {
                            return;
                        }
                        Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.getRoute(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE, Navigation_1.default.getActiveRoute()));
                    },
                    subscribedSettings: [CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR],
                    shouldHide: reimbursable !== CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT || !reimbursableExpenseReportDefaultVendor,
                },
            ],
            shouldHide: false,
            shouldExpand: isAccordionExpanded,
            shouldAnimateSection: shouldAnimateAccordionSection,
        },
    ];
    return (<ConnectionLayout_1.default displayName={SageIntacctReimbursableExpensesPage.displayName} headerTitle="workspace.accounting.exportOutOfPocket" title="workspace.sageIntacct.reimbursableExpenses.description" onBackButtonPress={function () { return Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID))); }} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}>
            {menuItems
            .filter(function (item) { return !item.shouldHide; })
            .map(function (item) {
            switch (item.type) {
                case 'toggle':
                    // eslint-disable-next-line no-case-declarations
                    var type = item.type, shouldHide = item.shouldHide, key = item.key, rest = __rest(item, ["type", "shouldHide", "key"]);
                    return (<ToggleSettingsOptionRow_1.default key={key} 
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest} wrapperStyle={[styles.mv3, styles.ph5]}/>);
                case 'accordion':
                    return (<Accordion_1.default isExpanded={item.shouldExpand} isToggleTriggered={shouldAnimateAccordionSection}>
                                    {item.children.map(function (child) { return renderDefault(child); })}
                                </Accordion_1.default>);
                default:
                    return renderDefault(item);
            }
        })}
        </ConnectionLayout_1.default>);
}
SageIntacctReimbursableExpensesPage.displayName = 'SageIntacctReimbursableExpensesPage';
exports.default = (0, withPolicyConnections_1.default)(SageIntacctReimbursableExpensesPage);
