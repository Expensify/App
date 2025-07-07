"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var LoginUtils_1 = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var MergeAccounts_1 = require("@userActions/MergeAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var MergeAccountDetailsForm_1 = require("@src/types/form/MergeAccountDetailsForm");
var getValidateCodeErrorKey = function (err) {
    if (err.includes('403')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.TOO_MANY_ATTEMPTS;
    }
    if (err.includes('404')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_NO_EXIST;
    }
    if (err.includes('401')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_SAML_PRIMARY_LOGIN;
    }
    if (err.includes('402')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_SAML_NOT_SUPPORTED;
    }
    if (err.includes('400 Cannot merge account into itself')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_MERGE_SELF;
    }
    return null;
};
function AccountDetailsPage() {
    var _a;
    var formRef = (0, react_1.useRef)(null);
    var navigation = (0, native_1.useNavigation)();
    var userEmailOrPhone = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; }, canBeMissing: true })[0];
    var getValidateCodeForAccountMerge = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { return account === null || account === void 0 ? void 0 : account.getValidateCodeForAccountMerge; }, canBeMissing: true })[0];
    var params = (0, native_1.useRoute)().params;
    var _b = (0, react_1.useState)((_a = params === null || params === void 0 ? void 0 : params.email) !== null && _a !== void 0 ? _a : ''), email = _b[0], setEmail = _b[1];
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var validateCodeSent = getValidateCodeForAccountMerge === null || getValidateCodeForAccountMerge === void 0 ? void 0 : getValidateCodeForAccountMerge.validateCodeSent;
    var latestError = (0, ErrorUtils_1.getLatestErrorMessage)(getValidateCodeForAccountMerge);
    var errorKey = getValidateCodeErrorKey(latestError);
    var genericError = !errorKey ? latestError : undefined;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        var task = react_native_1.InteractionManager.runAfterInteractions(function () {
            if (!validateCodeSent || !email) {
                return;
            }
            return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_MERGE_ACCOUNTS_MAGIC_CODE.getRoute(email));
        });
        return function () { return task.cancel(); };
    }, [validateCodeSent, email]));
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        var task = react_native_1.InteractionManager.runAfterInteractions(function () {
            if (!errorKey || !email) {
                return;
            }
            return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, errorKey));
        });
        return function () { return task.cancel(); };
    }, [errorKey, email]));
    (0, react_1.useEffect)(function () {
        var unsubscribe = navigation.addListener('blur', function () {
            (0, MergeAccounts_1.clearGetValidateCodeForAccountMerge)();
        });
        return unsubscribe;
    }, [navigation]);
    var validate = function (values) {
        var errors = {};
        var login = values[MergeAccountDetailsForm_1.default.PHONE_OR_EMAIL];
        if (!login) {
            (0, ErrorUtils_1.addErrorMessage)(errors, MergeAccountDetailsForm_1.default.PHONE_OR_EMAIL, translate('common.pleaseEnterEmailOrPhoneNumber'));
        }
        else if (login.trim() === userEmailOrPhone) {
            (0, ErrorUtils_1.addErrorMessage)(errors, MergeAccountDetailsForm_1.default.PHONE_OR_EMAIL, translate('common.error.email'));
        }
        else {
            var phoneLogin = (0, LoginUtils_1.getPhoneLogin)(login);
            var validateIfNumber = (0, LoginUtils_1.validateNumber)(phoneLogin);
            if (!expensify_common_1.Str.isValidEmail(login) && !validateIfNumber) {
                if ((0, ValidationUtils_1.isNumericWithSpecialChars)(login)) {
                    (0, ErrorUtils_1.addErrorMessage)(errors, MergeAccountDetailsForm_1.default.PHONE_OR_EMAIL, translate('common.error.phoneNumber'));
                }
                else {
                    (0, ErrorUtils_1.addErrorMessage)(errors, MergeAccountDetailsForm_1.default.PHONE_OR_EMAIL, translate('loginForm.error.invalidFormatEmailLogin'));
                }
            }
        }
        if (!values[MergeAccountDetailsForm_1.default.CONSENT]) {
            (0, ErrorUtils_1.addErrorMessage)(errors, MergeAccountDetailsForm_1.default.CONSENT, translate('common.error.fieldRequired'));
        }
        return errors;
    };
    return (<ScreenWrapper_1.default shouldEnableMaxHeight includeSafeAreaPaddingBottom testID={AccountDetailsPage.displayName} shouldShowOfflineIndicator={false}>
            <HeaderWithBackButton_1.default title={translate('mergeAccountsPage.mergeAccount')} onBackButtonPress={function () { return Navigation_1.default.dismissModal(); }} shouldDisplayHelpButton={false}/>
            <FullPageOfflineBlockingView_1.default>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.MERGE_ACCOUNT_DETAILS_FORM} onSubmit={function (values) {
            (0, MergeAccounts_1.requestValidationCodeForAccountMerge)(values[MergeAccountDetailsForm_1.default.PHONE_OR_EMAIL]);
        }} style={[styles.flexGrow1, styles.mh5]} shouldTrimValues validate={validate} submitButtonText={translate('common.next')} isSubmitButtonVisible={false} ref={formRef}>
                    <react_native_1.View style={[styles.flexGrow1, styles.mt3]}>
                        <react_native_1.View>
                            <Text_1.default>
                                {translate('mergeAccountsPage.accountDetails.accountToMergeInto')}
                                <Text_1.default style={styles.textStrong}>{userEmailOrPhone}</Text_1.default>
                            </Text_1.default>
                        </react_native_1.View>
                        <InputWrapper_1.default ref={inputCallbackRef} InputComponent={TextInput_1.default} inputID={MergeAccountDetailsForm_1.default.PHONE_OR_EMAIL} autoCapitalize="none" label={translate('loginForm.phoneOrEmail')} aria-label={translate('loginForm.phoneOrEmail')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mt8]} autoCorrect={false} onChangeText={setEmail} value={email}/>
                        <InputWrapper_1.default style={[styles.mt8]} InputComponent={CheckboxWithLabel_1.default} inputID={MergeAccountDetailsForm_1.default.CONSENT} label={translate('mergeAccountsPage.accountDetails.notReversibleConsent')} aria-label={translate('mergeAccountsPage.accountDetails.notReversibleConsent')}/>
                    </react_native_1.View>
                    <FormAlertWithSubmitButton_1.default isAlertVisible={!!genericError} onSubmit={function () {
            var _a;
            (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.submit();
        }} message={genericError} buttonText={translate('common.next')} enabledWhenOffline={false} containerStyles={styles.mt3} isLoading={getValidateCodeForAccountMerge === null || getValidateCodeForAccountMerge === void 0 ? void 0 : getValidateCodeForAccountMerge.isLoading}/>
                </FormProvider_1.default>
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
AccountDetailsPage.displayName = 'AccountDetailsPage';
exports.default = AccountDetailsPage;
