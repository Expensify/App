"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ImportSpreadsheet_1 = require("@components/ImportSpreadsheet");
var usePolicy_1 = require("@hooks/usePolicy");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ImportCategoriesPage(_a) {
    var route = _a.route;
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var policy = (0, usePolicy_1.default)(policyID);
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORT;
    if (hasAccountingConnections) {
        return <NotFoundPage_1.default />;
    }
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} fullPageNotFoundViewProps={{ subtitleKey: (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils_1.goBackFromInvalidPolicy }}>
            <ImportSpreadsheet_1.default backTo={backTo} goTo={isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_CATEGORIES_IMPORTED.getRoute(policyID, backTo) : ROUTES_1.default.WORKSPACE_CATEGORIES_IMPORTED.getRoute(policyID)}/>
        </AccessOrNotFoundWrapper_1.default>);
}
exports.default = ImportCategoriesPage;
