"use strict";
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
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var goBackFromExportConnection_1 = require("@navigation/helpers/goBackFromExportConnection");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Link_1 = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopExportPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var policyOwner = (_b = policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _b !== void 0 ? _b : '';
    var qbdConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksDesktop) === null || _d === void 0 ? void 0 : _d.config;
    var errorFields = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.errorFields;
    var route = (0, native_1.useRoute)();
    var backTo = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.backTo;
    var shouldShowVendorMenuItems = (0, react_1.useMemo)(function () { var _a; return ((_a = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _a === void 0 ? void 0 : _a.nonReimbursable) === CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL; }, [(_f = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _f === void 0 ? void 0 : _f.nonReimbursable]);
    var shouldGoBackToSpecificRoute = (0, react_1.useMemo)(function () { var _a; return ((_a = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _a === void 0 ? void 0 : _a.nonReimbursable) === CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK || shouldShowVendorMenuItems; }, [(_g = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _g === void 0 ? void 0 : _g.nonReimbursable, shouldShowVendorMenuItems]);
    var goBack = (0, react_1.useCallback)(function () {
        return (0, goBackFromExportConnection_1.default)(shouldGoBackToSpecificRoute, backTo);
    }, [backTo, shouldGoBackToSpecificRoute]);
    var menuItems = [
        {
            description: translate('workspace.accounting.preferredExporter'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            // We use the logical OR (||) here instead of ?? because `exporter` could be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            title: ((_h = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _h === void 0 ? void 0 : _h.exporter) || policyOwner,
            subscribedSettings: [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER],
        },
        {
            description: translate('workspace.qbd.date'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            title: ((_j = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _j === void 0 ? void 0 : _j.exportDate) ? translate("workspace.qbd.exportDate.values.".concat(qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export.exportDate, ".label")) : undefined,
            subscribedSettings: [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE],
        },
        {
            description: translate('workspace.accounting.exportOutOfPocket'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            title: (qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export.reimbursable) ? translate("workspace.qbd.accounts.".concat(qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export.reimbursable)) : undefined,
            subscribedSettings: [
                CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE,
                CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT,
                CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED,
            ],
        },
        {
            description: translate('workspace.accounting.exportCompanyCard'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            brickRoadIndicator: ((_k = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.errorFields) === null || _k === void 0 ? void 0 : _k.exportCompanyCard) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: ((_l = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _l === void 0 ? void 0 : _l.nonReimbursable) ? translate("workspace.qbd.accounts.".concat((_m = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _m === void 0 ? void 0 : _m.nonReimbursable)) : undefined,
            subscribedSettings: __spreadArray(__spreadArray([
                CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE,
                CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT
            ], (shouldShowVendorMenuItems ? [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR] : []), true), (shouldShowVendorMenuItems && (qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.shouldAutoCreateVendor) ? [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] : []), true),
        },
        {
            description: translate('workspace.qbd.exportExpensifyCard'),
            title: translate("workspace.qbd.accounts.".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD)),
            shouldShowRightIcon: false,
            interactive: false,
        },
    ];
    return (<ConnectionLayout_1.default displayName={QuickbooksDesktopExportPage.displayName} headerTitle="workspace.accounting.export" title="workspace.qbd.exportDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} onBackButtonPress={goBack}>
            {menuItems.map(function (menuItem) {
            var _a, _b;
            return (<OfflineWithFeedback_1.default key={menuItem.description} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(menuItem === null || menuItem === void 0 ? void 0 : menuItem.subscribedSettings, qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={menuItem.title} interactive={(_a = menuItem === null || menuItem === void 0 ? void 0 : menuItem.interactive) !== null && _a !== void 0 ? _a : true} description={menuItem.description} shouldShowRightIcon={(_b = menuItem === null || menuItem === void 0 ? void 0 : menuItem.shouldShowRightIcon) !== null && _b !== void 0 ? _b : true} onPress={menuItem === null || menuItem === void 0 ? void 0 : menuItem.onPress} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(menuItem === null || menuItem === void 0 ? void 0 : menuItem.subscribedSettings, errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>);
        })}
            <Text_1.default style={[styles.mutedNormalTextLabel, styles.ph5, styles.pb5, styles.mt2]}>
                <Text_1.default style={[styles.mutedNormalTextLabel]}>{translate('workspace.qbd.deepDiveExpensifyCard')}</Text_1.default>
                <TextLink_1.default onPress={function () { return (0, Link_1.openExternalLink)(CONST_1.default.DEEP_DIVE_EXPENSIFY_CARD); }} style={[styles.mutedNormalTextLabel, styles.link]}>
                    {" ".concat(translate('workspace.qbd.deepDiveExpensifyCardIntegration'))}
                </TextLink_1.default>
            </Text_1.default>
        </ConnectionLayout_1.default>);
}
QuickbooksDesktopExportPage.displayName = 'QuickbooksDesktopExportPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopExportPage);
