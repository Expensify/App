"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ThirdPartySignInPage_1 = require("@pages/signin/ThirdPartySignInPage");
var CONST_1 = require("@src/CONST");
function AppleSignInDesktopPage() {
    return <ThirdPartySignInPage_1.default signInProvider={CONST_1.default.SIGN_IN_METHOD.APPLE}/>;
}
exports.default = AppleSignInDesktopPage;
