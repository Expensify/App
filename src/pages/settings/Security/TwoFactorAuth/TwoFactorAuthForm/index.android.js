"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseTwoFactorAuthForm_1 = require("./BaseTwoFactorAuthForm");
function TwoFactorAuthForm(_a) {
    var innerRef = _a.innerRef, validateInsteadOfDisable = _a.validateInsteadOfDisable;
    return (<BaseTwoFactorAuthForm_1.default ref={innerRef} autoComplete="sms-otp" validateInsteadOfDisable={validateInsteadOfDisable}/>);
}
TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';
exports.default = TwoFactorAuthForm;
