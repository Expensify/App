"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function useWorkspaceAccountID(policyID) {
    var _a = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { selector: function (policy) { return policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID; } })[0], workspaceAccountID = _a === void 0 ? CONST_1.default.DEFAULT_NUMBER_ID : _a;
    return workspaceAccountID;
}
exports.default = useWorkspaceAccountID;
