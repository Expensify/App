"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var OnyxProvider_1 = require("@components/OnyxProvider");
function useCurrentUserPersonalDetails() {
    var _a;
    var session = (0, OnyxProvider_1.useSession)();
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var accountID = (_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : -1;
    var accountPersonalDetails = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
    var currentUserPersonalDetails = (0, react_1.useMemo)(function () { return (__assign(__assign({}, accountPersonalDetails), { accountID: accountID })); }, [accountPersonalDetails, accountID]);
    return currentUserPersonalDetails;
}
exports.default = useCurrentUserPersonalDetails;
