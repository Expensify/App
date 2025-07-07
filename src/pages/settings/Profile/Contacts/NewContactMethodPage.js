"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var ValidateCodeActionModal_1 = require("@components/ValidateCodeActionModal");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var LoginUtils_1 = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var UserUtils_1 = require("@libs/UserUtils");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NewContactMethodForm_1 = require("@src/types/form/NewContactMethodForm");
function NewContactMethodPage(_a) {
    var _b, _c, _d;
    var route = _a.route;
    var contactMethod = (0, UserUtils_1.getContactMethod)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var loginInputRef = (0, react_1.useRef)(null);
    var _e = (0, react_1.useState)(false), isValidateCodeActionModalVisible = _e[0], setIsValidateCodeActionModalVisible = _e[1];
    var pendingContactAction = (0, useOnyx_1.default)(ONYXKEYS_1.default.PENDING_CONTACT_ACTION, { canBeMissing: true })[0];
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true })[0];
    var loginData = loginList === null || loginList === void 0 ? void 0 : loginList[(_b = pendingContactAction === null || pendingContactAction === void 0 ? void 0 : pendingContactAction.contactMethod) !== null && _b !== void 0 ? _b : contactMethod];
    var validateLoginError = (0, ErrorUtils_1.getLatestErrorField)(loginData, 'addedLogin');
    var navigateBackTo = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.backTo;
    var hasFailedToSendVerificationCode = !!((_d = pendingContactAction === null || pendingContactAction === void 0 ? void 0 : pendingContactAction.errorFields) === null || _d === void 0 ? void 0 : _d.actionVerified);
    var handleValidateMagicCode = (0, react_1.useCallback)(function (values) {
        var phoneLogin = (0, LoginUtils_1.getPhoneLogin)(values.phoneOrEmail);
        var validateIfNumber = (0, LoginUtils_1.validateNumber)(phoneLogin);
        var submitDetail = (validateIfNumber || values.phoneOrEmail).trim().toLowerCase();
        (0, User_1.addPendingContactMethod)(submitDetail);
        setIsValidateCodeActionModalVisible(true);
    }, []);
    var addNewContactMethod = (0, react_1.useCallback)(function (magicCode) {
        var _a;
        (0, User_1.addNewContactMethod)((0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((_a = pendingContactAction === null || pendingContactAction === void 0 ? void 0 : pendingContactAction.contactMethod) !== null && _a !== void 0 ? _a : ''), magicCode);
    }, [pendingContactAction === null || pendingContactAction === void 0 ? void 0 : pendingContactAction.contactMethod]);
    var prevPendingContactAction = (0, usePrevious_1.default)(pendingContactAction);
    (0, useBeforeRemove_1.default)(function () { return setIsValidateCodeActionModalVisible(false); });
    (0, react_1.useEffect)(function () {
        var _a;
        if (!(pendingContactAction === null || pendingContactAction === void 0 ? void 0 : pendingContactAction.actionVerified)) {
            return;
        }
        Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_CONTACT_METHOD_DETAILS.getRoute((0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((_a = prevPendingContactAction === null || prevPendingContactAction === void 0 ? void 0 : prevPendingContactAction.contactMethod) !== null && _a !== void 0 ? _a : ''), navigateBackTo, true));
        (0, User_1.clearUnvalidatedNewContactMethodAction)();
    }, [pendingContactAction === null || pendingContactAction === void 0 ? void 0 : pendingContactAction.actionVerified, prevPendingContactAction === null || prevPendingContactAction === void 0 ? void 0 : prevPendingContactAction.contactMethod, navigateBackTo]);
    var validate = (0, react_1.useCallback)(function (values) {
        var phoneLogin = (0, LoginUtils_1.getPhoneLogin)(values.phoneOrEmail);
        var validateIfNumber = (0, LoginUtils_1.validateNumber)(phoneLogin);
        var errors = {};
        if (!values.phoneOrEmail) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'phoneOrEmail', translate('contacts.genericFailureMessages.contactMethodRequired'));
        }
        else if (values.phoneOrEmail.length > CONST_1.default.LOGIN_CHARACTER_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'phoneOrEmail', translate('common.error.characterLimitExceedCounter', {
                length: values.phoneOrEmail.length,
                limit: CONST_1.default.LOGIN_CHARACTER_LIMIT,
            }));
        }
        if (!!values.phoneOrEmail && !(validateIfNumber || expensify_common_1.Str.isValidEmail(values.phoneOrEmail))) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'phoneOrEmail', translate('contacts.genericFailureMessages.invalidContactMethod'));
        }
        if (!!values.phoneOrEmail && (loginList === null || loginList === void 0 ? void 0 : loginList[validateIfNumber || values.phoneOrEmail.toLowerCase()])) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'phoneOrEmail', translate('contacts.genericFailureMessages.enteredMethodIsAlreadySubmitted'));
        }
        return errors;
    }, 
    // We don't need `loginList` because when submitting this form
    // the loginList gets updated, causing this function to run again.
    // https://github.com/Expensify/App/issues/20610
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [translate]);
    var onBackButtonPress = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(navigateBackTo));
    }, [navigateBackTo]);
    return (<ScreenWrapper_1.default onEntryTransitionEnd={function () { var _a; return (_a = loginInputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }} includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={NewContactMethodPage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('contacts.newContactMethod')} onBackButtonPress={onBackButtonPress}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NEW_CONTACT_METHOD_FORM} validate={validate} onSubmit={handleValidateMagicCode} submitButtonText={translate('common.add')} style={[styles.flexGrow1, styles.mh5]} shouldHideFixErrorsAlert>
                    <Text_1.default style={styles.mb5}>{translate('common.pleaseEnterEmailOrPhoneNumber')}</Text_1.default>
                    <react_native_1.View style={styles.mb6}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} label={"".concat(translate('common.email'), "/").concat(translate('common.phoneNumber'))} aria-label={"".concat(translate('common.email'), "/").concat(translate('common.phoneNumber'))} role={CONST_1.default.ROLE.PRESENTATION} inputMode={CONST_1.default.INPUT_MODE.EMAIL} ref={loginInputRef} inputID={NewContactMethodForm_1.default.PHONE_OR_EMAIL} autoCapitalize="none" enterKeyHint="done"/>
                    </react_native_1.View>
                    {hasFailedToSendVerificationCode && (<DotIndicatorMessage_1.default messages={(0, ErrorUtils_1.getLatestErrorField)(pendingContactAction, 'actionVerified')} type="error"/>)}
                </FormProvider_1.default>
                <ValidateCodeActionModal_1.default validateCodeActionErrorField="addedLogin" validateError={validateLoginError} handleSubmitForm={addNewContactMethod} clearError={function () {
            var _a;
            if (!loginData) {
                return;
            }
            (0, User_1.clearContactMethodErrors)((0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((_a = pendingContactAction === null || pendingContactAction === void 0 ? void 0 : pendingContactAction.contactMethod) !== null && _a !== void 0 ? _a : contactMethod), 'addedLogin');
            (0, User_1.clearPendingContactActionErrors)();
        }} onClose={function () {
            if (pendingContactAction === null || pendingContactAction === void 0 ? void 0 : pendingContactAction.contactMethod) {
                (0, User_1.clearContactMethod)(pendingContactAction === null || pendingContactAction === void 0 ? void 0 : pendingContactAction.contactMethod);
                (0, User_1.clearUnvalidatedNewContactMethodAction)();
            }
            setIsValidateCodeActionModalVisible(false);
        }} isVisible={isValidateCodeActionModalVisible} title={translate('delegate.makeSureItIsYou')} sendValidateCode={function () { return (0, User_1.requestValidateCodeAction)(); }} descriptionPrimary={translate('contacts.enterMagicCode', { contactMethod: contactMethod })}/>
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
NewContactMethodPage.displayName = 'NewContactMethodPage';
exports.default = NewContactMethodPage;
