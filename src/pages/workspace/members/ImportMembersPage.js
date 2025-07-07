"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ImportSpreadsheet_1 = require("@components/ImportSpreadsheet");
var PolicyUtils = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ImportMembersPage(_a) {
    var _b;
    var policy = _a.policy;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '';
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} fullPageNotFoundViewProps={{ subtitleKey: (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils.goBackFromInvalidPolicy }}>
            <ImportSpreadsheet_1.default backTo={ROUTES_1.default.WORKSPACE_MEMBERS.getRoute(policyID)} goTo={ROUTES_1.default.WORKSPACE_MEMBERS_IMPORTED.getRoute(policyID)}/>
        </AccessOrNotFoundWrapper_1.default>);
}
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(ImportMembersPage);
