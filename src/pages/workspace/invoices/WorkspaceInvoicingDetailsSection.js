"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Section_1 = require("@components/Section");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceInvoicingDetailsSection(_a) {
    var _b, _c;
    var policyID = _a.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var horizontalPadding = (0, react_1.useMemo)(function () { return (shouldUseNarrowLayout ? styles.ph5 : styles.ph8); }, [shouldUseNarrowLayout, styles]);
    return (<Section_1.default title={translate('workspace.invoices.invoicingDetails')} subtitle={translate('workspace.invoices.invoicingDetailsDescription')} containerStyles={[styles.ph0, shouldUseNarrowLayout ? styles.pt5 : styles.pt8]} subtitleStyles={horizontalPadding} titleStyles={[styles.accountSettingsSectionTitle, horizontalPadding]} childrenStyles={styles.pt5} subtitleMuted>
            <MenuItemWithTopDescription_1.default key={translate('workspace.invoices.companyName')} shouldShowRightIcon title={(_b = policy === null || policy === void 0 ? void 0 : policy.invoice) === null || _b === void 0 ? void 0 : _b.companyName} description={translate('workspace.invoices.companyName')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INVOICES_COMPANY_NAME.getRoute(policyID)); }} style={horizontalPadding}/>
            <MenuItemWithTopDescription_1.default key={translate('workspace.invoices.companyWebsite')} shouldShowRightIcon title={(_c = policy === null || policy === void 0 ? void 0 : policy.invoice) === null || _c === void 0 ? void 0 : _c.companyWebsite} description={translate('workspace.invoices.companyWebsite')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INVOICES_COMPANY_WEBSITE.getRoute(policyID)); }} style={horizontalPadding}/>
        </Section_1.default>);
}
WorkspaceInvoicingDetailsSection.displayName = 'WorkspaceInvoicingDetailsSection';
exports.default = WorkspaceInvoicingDetailsSection;
