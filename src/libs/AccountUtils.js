"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var isValidateCodeFormSubmitting = function (account) {
    return !!(account === null || account === void 0 ? void 0 : account.isLoading) && account.loadingForm === (account.requiresTwoFactorAuth ? CONST_1.default.FORMS.VALIDATE_TFA_CODE_FORM : CONST_1.default.FORMS.VALIDATE_CODE_FORM);
};
function isDelegateOnlySubmitter(account) {
    var _a, _b, _c, _d;
    var delegateEmail = (_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate;
    var delegateRole = (_d = (_c = (_b = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _b === void 0 ? void 0 : _b.delegates) === null || _c === void 0 ? void 0 : _c.find(function (delegate) { return delegate.email === delegateEmail; })) === null || _d === void 0 ? void 0 : _d.role;
    return delegateRole === CONST_1.default.DELEGATE_ROLE.SUBMITTER;
}
exports.default = { isValidateCodeFormSubmitting: isValidateCodeFormSubmitting, isDelegateOnlySubmitter: isDelegateOnlySubmitter };
