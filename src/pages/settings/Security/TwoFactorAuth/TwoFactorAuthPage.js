"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var CopyCodesPage_1 = require("./CopyCodesPage");
var EnabledPage_1 = require("./EnabledPage");
function TwoFactorAuthPage(props) {
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    if (account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth) {
        return <EnabledPage_1.default />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <CopyCodesPage_1.default {...props}/>;
}
exports.default = TwoFactorAuthPage;
