"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var PolicyUtils = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceAdminRestrictedAction_1 = require("./WorkspaceAdminRestrictedAction");
var WorkspaceOwnerRestrictedAction_1 = require("./WorkspaceOwnerRestrictedAction");
var WorkspaceUserRestrictedAction_1 = require("./WorkspaceUserRestrictedAction");
function WorkspaceRestrictedActionPage(_a) {
    var _b;
    var policyID = _a.route.params.policyID;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION)[0];
    var policy = (0, usePolicy_1.default)(policyID);
    // Workspace Owner
    if (PolicyUtils.isPolicyOwner(policy, (_b = session === null || session === void 0 ? void 0 : session.accountID) !== null && _b !== void 0 ? _b : -1)) {
        return <WorkspaceOwnerRestrictedAction_1.default />;
    }
    // Workspace Admin
    if (PolicyUtils.isPolicyAdmin(policy, session === null || session === void 0 ? void 0 : session.email)) {
        return <WorkspaceAdminRestrictedAction_1.default policyID={policyID}/>;
    }
    // Workspace User
    if (PolicyUtils.isPolicyUser(policy, session === null || session === void 0 ? void 0 : session.email)) {
        return <WorkspaceUserRestrictedAction_1.default policyID={policyID}/>;
    }
    return <NotFoundPage_1.default />;
}
WorkspaceRestrictedActionPage.displayName = 'WorkspaceRestrictedActionPage';
exports.default = WorkspaceRestrictedActionPage;
