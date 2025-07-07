"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ValidateCodeActionModal_1 = require("@components/ValidateCodeActionModal");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var User_1 = require("@libs/actions/User");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function VerifyAccountPage(_a) {
    var _b, _c, _d, _e;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true })[0];
    var contactMethod = (_b = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _b !== void 0 ? _b : '';
    var translate = (0, useLocalize_1.default)().translate;
    var loginData = loginList === null || loginList === void 0 ? void 0 : loginList[contactMethod];
    var validateLoginError = (0, ErrorUtils_1.getEarliestErrorField)(loginData, 'validateLogin');
    var isUserValidated = (_c = account === null || account === void 0 ? void 0 : account.validated) !== null && _c !== void 0 ? _c : false;
    var _f = (0, react_1.useState)(true), isValidateCodeActionModalVisible = _f[0], setIsValidateCodeActionModalVisible = _f[1];
    var navigateForwardTo = (_d = route.params) === null || _d === void 0 ? void 0 : _d.forwardTo;
    var backTo = (_e = route.params) === null || _e === void 0 ? void 0 : _e.backTo;
    (0, useBeforeRemove_1.default)(function () { return setIsValidateCodeActionModalVisible(false); });
    (0, react_1.useEffect)(function () { return function () { return (0, User_1.clearUnvalidatedNewContactMethodAction)(); }; }, []);
    var handleSubmitForm = (0, react_1.useCallback)(function (validateCode) {
        (0, User_1.validateSecondaryLogin)(loginList, contactMethod, validateCode, true);
    }, [loginList, contactMethod]);
    var clearError = (0, react_1.useCallback)(function () {
        (0, User_1.clearContactMethodErrors)(contactMethod, 'validateLogin');
    }, [contactMethod]);
    var closeModal = (0, react_1.useCallback)(function () {
        // Disable modal visibility so the navigation is animated
        setIsValidateCodeActionModalVisible(false);
        Navigation_1.default.goBack(backTo);
    }, [backTo]);
    // Handle navigation once the user is validated
    (0, react_1.useEffect)(function () {
        if (!isUserValidated) {
            return;
        }
        setIsValidateCodeActionModalVisible(false);
        if (navigateForwardTo) {
            Navigation_1.default.navigate(navigateForwardTo, { forceReplace: true });
        }
        else {
            Navigation_1.default.goBack(backTo);
        }
    }, [isUserValidated, navigateForwardTo, backTo]);
    // Once user is validated or the modal is dismissed, we don't want to show empty content.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (isUserValidated || !isValidateCodeActionModalVisible) {
        return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={VerifyAccountPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('contacts.validateAccount')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                <FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>
            </ScreenWrapper_1.default>);
    }
    return (<ValidateCodeActionModal_1.default sendValidateCode={User_1.requestValidateCodeAction} handleSubmitForm={handleSubmitForm} validateError={validateLoginError} validateCodeActionErrorField="validateLogin" isVisible={isValidateCodeActionModalVisible} title={translate('contacts.validateAccount')} descriptionPrimary={translate('contacts.featureRequiresValidate')} descriptionSecondary={translate('contacts.enterMagicCode', { contactMethod: contactMethod })} clearError={clearError} onClose={closeModal} onModalHide={function () { }}/>);
}
VerifyAccountPage.displayName = 'VerifyAccountPage';
exports.default = VerifyAccountPage;
