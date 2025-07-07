"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var AccountUtils_1 = require("@libs/AccountUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var callOrReturn_1 = require("@src/types/utils/callOrReturn");
var FullPageNotFoundView_1 = require("./BlockingViews/FullPageNotFoundView");
var DENIED_ACCESS_VARIANTS = (_a = {},
    // To Restrict All Delegates From Accessing The Page.
    _a[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE] = function (account) { return isDelegate(account); },
    // To Restrict Only Limited Access Delegates From Accessing The Page.
    _a[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.SUBMITTER] = function (account) { return isSubmitter(account); },
    _a);
function isDelegate(account) {
    var _a;
    var isActingAsDelegate = !!((_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate);
    return isActingAsDelegate;
}
function isSubmitter(account) {
    var isDelegateOnlySubmitter = AccountUtils_1.default.isDelegateOnlySubmitter(account);
    return isDelegateOnlySubmitter;
}
function DelegateNoAccessWrapper(_a) {
    var _b = _a.accessDeniedVariants, accessDeniedVariants = _b === void 0 ? [] : _b, shouldForceFullScreen = _a.shouldForceFullScreen, onBackButtonPress = _a.onBackButtonPress, props = __rest(_a, ["accessDeniedVariants", "shouldForceFullScreen", "onBackButtonPress"]);
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    var isPageAccessDenied = accessDeniedVariants.reduce(function (acc, variant) {
        var accessDeniedFunction = DENIED_ACCESS_VARIANTS[variant];
        return acc || accessDeniedFunction(account);
    }, false);
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    if (isPageAccessDenied) {
        return (<FullPageNotFoundView_1.default shouldShow shouldForceFullScreen={shouldForceFullScreen} onBackButtonPress={function () {
                if (onBackButtonPress) {
                    onBackButtonPress();
                    return;
                }
                if (shouldUseNarrowLayout) {
                    Navigation_1.default.dismissModal();
                    return;
                }
                Navigation_1.default.goBack();
            }} titleKey="delegate.notAllowed" subtitleKey="delegate.noAccessMessage" shouldShowLink={false}/>);
    }
    return (0, callOrReturn_1.default)(props.children);
}
exports.default = DelegateNoAccessWrapper;
