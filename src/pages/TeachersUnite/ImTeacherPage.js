"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var LoginUtils = require("@libs/LoginUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ImTeacherUpdateEmailPage_1 = require("./ImTeacherUpdateEmailPage");
var IntroSchoolPrincipalPage_1 = require("./IntroSchoolPrincipalPage");
function ImTeacherPage(props) {
    var _a, _b;
    var isLoggedInEmailPublicDomain = LoginUtils.isEmailPublicDomain((_b = (_a = props.session) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : '');
    return isLoggedInEmailPublicDomain ? <ImTeacherUpdateEmailPage_1.default /> : <IntroSchoolPrincipalPage_1.default />;
}
ImTeacherPage.displayName = 'ImTeacherPage';
exports.default = (0, react_native_onyx_1.withOnyx)({
    session: {
        key: ONYXKEYS_1.default.SESSION,
    },
})(ImTeacherPage);
