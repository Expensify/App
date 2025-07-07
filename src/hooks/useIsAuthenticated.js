"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function useIsAuthenticated() {
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION)[0];
    var isAuthenticated = (0, react_1.useMemo)(function () { var _a; return !!((_a = session === null || session === void 0 ? void 0 : session.authToken) !== null && _a !== void 0 ? _a : null); }, [session]);
    return isAuthenticated;
}
exports.default = useIsAuthenticated;
