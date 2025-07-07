"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Illustrations = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var WorkspacePageWithSections_1 = require("@pages/workspace/WorkspacePageWithSections");
var CONST_1 = require("@src/CONST");
var WorkspaceInvoiceBalanceSection_1 = require("./WorkspaceInvoiceBalanceSection");
var WorkspaceInvoiceVBASection_1 = require("./WorkspaceInvoiceVBASection");
var WorkspaceInvoicingDetailsSection_1 = require("./WorkspaceInvoicingDetailsSection");
function WorkspaceInvoicesPage(_a) {
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED}>
            <WorkspacePageWithSections_1.default shouldUseScrollView headerText={translate('workspace.common.invoices')} shouldShowOfflineIndicatorInWideScreen shouldSkipVBBACall={false} route={route} icon={Illustrations.InvoiceBlue} addBottomSafeAreaPadding>
                {function (_hasVBA, policyID) { return (<react_native_1.View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        {!!policyID && <WorkspaceInvoiceBalanceSection_1.default policyID={policyID}/>}
                        {!!policyID && <WorkspaceInvoiceVBASection_1.default policyID={policyID}/>}
                        {!!policyID && <WorkspaceInvoicingDetailsSection_1.default policyID={policyID}/>}
                    </react_native_1.View>); }}
            </WorkspacePageWithSections_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceInvoicesPage.displayName = 'WorkspaceInvoicesPage';
exports.default = WorkspaceInvoicesPage;
