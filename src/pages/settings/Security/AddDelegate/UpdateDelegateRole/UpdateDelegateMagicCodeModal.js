"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ValidateCodeActionModal_1 = require("@components/ValidateCodeActionModal");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var Delegate_1 = require("@libs/actions/Delegate");
var User_1 = require("@libs/actions/User");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function UpdateDelegateMagicCodeModal(_a) {
    var _b, _c, _d, _e, _f, _g;
    var login = _a.login, role = _a.role, isValidateCodeActionModalVisible = _a.isValidateCodeActionModalVisible, onClose = _a.onClose;
    var translate = (0, useLocalize_1.default)().translate;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var validateCodeAction = (0, useOnyx_1.default)(ONYXKEYS_1.default.VALIDATE_ACTION_CODE, { canBeMissing: true })[0];
    var currentDelegate = (_c = (_b = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _b === void 0 ? void 0 : _b.delegates) === null || _c === void 0 ? void 0 : _c.find(function (d) { return d.email === login; });
    var updateDelegateErrors = (_f = (_e = (_d = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _d === void 0 ? void 0 : _d.errorFields) === null || _e === void 0 ? void 0 : _e.updateDelegateRole) === null || _f === void 0 ? void 0 : _f[login];
    (0, react_1.useEffect)(function () {
        var _a;
        if ((currentDelegate === null || currentDelegate === void 0 ? void 0 : currentDelegate.role) !== role || !!((_a = currentDelegate.pendingFields) === null || _a === void 0 ? void 0 : _a.role) || !!updateDelegateErrors) {
            return;
        }
        // Dismiss modal on successful magic code verification
        Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY);
    }, [login, currentDelegate, role, updateDelegateErrors]);
    var onBackButtonPress = function () {
        onClose === null || onClose === void 0 ? void 0 : onClose();
    };
    var clearError = function () {
        var _a;
        if ((0, EmptyObject_1.isEmptyObject)(updateDelegateErrors) && (0, EmptyObject_1.isEmptyObject)(validateCodeAction === null || validateCodeAction === void 0 ? void 0 : validateCodeAction.errorFields)) {
            return;
        }
        (0, Delegate_1.clearDelegateErrorsByField)((_a = currentDelegate === null || currentDelegate === void 0 ? void 0 : currentDelegate.email) !== null && _a !== void 0 ? _a : '', 'updateDelegateRole');
    };
    return (<ValidateCodeActionModal_1.default clearError={clearError} onClose={onBackButtonPress} validateCodeActionErrorField="updateDelegateRole" isLoading={currentDelegate === null || currentDelegate === void 0 ? void 0 : currentDelegate.isLoading} validateError={updateDelegateErrors} isVisible={isValidateCodeActionModalVisible} title={translate('delegate.makeSureItIsYou')} sendValidateCode={function () { return (0, User_1.requestValidateCodeAction)(); }} handleSubmitForm={function (validateCode) { return (0, Delegate_1.updateDelegateRole)(login, role, validateCode); }} descriptionPrimary={translate('delegate.enterMagicCode', { contactMethod: (_g = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _g !== void 0 ? _g : '' })}/>);
}
UpdateDelegateMagicCodeModal.displayName = 'UpdateDelegateMagicCodeModal';
exports.default = UpdateDelegateMagicCodeModal;
