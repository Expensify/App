"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ImportSpreadsheet_1 = require("@components/ImportSpreadsheet");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function ImportTagsPage(_a) {
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var backTo = route.params.backTo;
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAGS_IMPORT;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { canBeMissing: true }), spreadsheet = _b[0], spreadsheetMetadata = _b[1];
    if (!spreadsheet && (0, isLoadingOnyxValue_1.default)(spreadsheetMetadata)) {
        return;
    }
    if (hasAccountingConnections) {
        return <NotFoundPage_1.default />;
    }
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} fullPageNotFoundViewProps={{ subtitleKey: (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils_1.goBackFromInvalidPolicy }}>
            <ImportSpreadsheet_1.default backTo={backTo} goTo={(function () {
            if (isQuickSettingsFlow) {
                return ROUTES_1.default.SETTINGS_TAGS_IMPORTED.getRoute(policyID, backTo);
            }
            if (spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.isImportingMultiLevelTags) {
                return ROUTES_1.default.WORKSPACE_MULTI_LEVEL_TAGS_IMPORT_SETTINGS.getRoute(policyID);
            }
            return ROUTES_1.default.WORKSPACE_TAGS_IMPORTED.getRoute(policyID);
        })()}/>
        </AccessOrNotFoundWrapper_1.default>);
}
exports.default = ImportTagsPage;
