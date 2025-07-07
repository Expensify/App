"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var useOnyx_1 = require("./useOnyx");
function useSubscriptionPlan() {
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY)[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION)[0];
    // Filter workspaces in which user is the owner and the type is either corporate (control) or team (collect)
    var ownerPolicies = (0, react_1.useMemo)(function () { var _a; return (0, PolicyUtils_1.getOwnedPaidPolicies)(policies, (_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : -1); }, [policies, session === null || session === void 0 ? void 0 : session.accountID]);
    if ((0, EmptyObject_1.isEmptyObject)(ownerPolicies)) {
        return null;
    }
    // Check if user has corporate (control) workspace
    var hasControlWorkspace = ownerPolicies.some(function (policy) { return (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.CORPORATE; });
    // Corporate (control) workspace is supposed to be the higher priority
    return hasControlWorkspace ? CONST_1.default.POLICY.TYPE.CORPORATE : CONST_1.default.POLICY.TYPE.TEAM;
}
exports.default = useSubscriptionPlan;
