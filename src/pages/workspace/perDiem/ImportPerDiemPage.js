"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ImportSpreadsheet_1 = require("@components/ImportSpreadsheet");
var usePolicy_1 = require("@hooks/usePolicy");
var PolicyUtils = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ImportPerDiemPage(_a) {
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} fullPageNotFoundViewProps={{ subtitleKey: (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils.goBackFromInvalidPolicy }}>
            <ImportSpreadsheet_1.default backTo={ROUTES_1.default.WORKSPACE_PER_DIEM.getRoute(policyID)} goTo={ROUTES_1.default.WORKSPACE_PER_DIEM_IMPORTED.getRoute(policyID)}/>
        </AccessOrNotFoundWrapper_1.default>);
}
exports.default = ImportPerDiemPage;
