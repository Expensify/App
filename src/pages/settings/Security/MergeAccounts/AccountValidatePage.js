"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var ValidateCodeActionForm_1 = require("@components/ValidateCodeActionForm");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var MergeAccounts_1 = require("@userActions/MergeAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var getMergeErrorPage = function (err) {
    if (err.includes('403')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.TOO_MANY_ATTEMPTS;
    }
    if (err.includes('401 Cannot merge accounts - 2FA enabled')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_2FA;
    }
    if (err.includes('401 Not authorized - domain under control')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_SAML_DOMAIN_CONTROL;
    }
    if (err.includes('405 Cannot merge account under invoicing')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_INVOICING;
    }
    if (err.includes('405 Cannot merge SmartScanner account')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_SMART_SCANNER;
    }
    if (err.includes('405 Cannot merge into unvalidated account')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ACCOUNT_UNVALIDATED;
    }
    if (err.includes('413')) {
        return CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED;
    }
    return null;
};
var getAuthenticationErrorKey = function (err) {
    if (!err) {
        return null;
    }
    if (err.includes('Invalid validateCode')) {
        return 'mergeAccountsPage.accountValidate.errors.incorrectMagicCode';
    }
    return 'mergeAccountsPage.accountValidate.errors.fallback';
};
function AccountValidatePage() {
    var _a;
    var validateCodeFormRef = (0, react_1.useRef)(null);
    var navigation = (0, native_1.useNavigation)();
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, {
        selector: function (data) { return ({
            mergeWithValidateCode: data === null || data === void 0 ? void 0 : data.mergeWithValidateCode,
            getValidateCodeForAccountMerge: data === null || data === void 0 ? void 0 : data.getValidateCodeForAccountMerge,
        }); },
        canBeMissing: true,
    })[0];
    var params = (0, native_1.useRoute)().params;
    var email = (_a = params.login) !== null && _a !== void 0 ? _a : '';
    var mergeWithValidateCode = account === null || account === void 0 ? void 0 : account.mergeWithValidateCode;
    var getValidateCodeForAccountMerge = account === null || account === void 0 ? void 0 : account.getValidateCodeForAccountMerge;
    var isAccountMerged = mergeWithValidateCode === null || mergeWithValidateCode === void 0 ? void 0 : mergeWithValidateCode.isAccountMerged;
    var latestError = (0, ErrorUtils_1.getLatestErrorMessage)(mergeWithValidateCode);
    var errorPage = getMergeErrorPage(latestError);
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        if (!isAccountMerged || !email) {
            return;
        }
        return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, 'success'), { forceReplace: true });
    }, [isAccountMerged, email]));
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        if (!errorPage || !email) {
            return;
        }
        return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, errorPage), { forceReplace: true });
    }, [errorPage, email]));
    (0, react_1.useEffect)(function () {
        var unsubscribe = navigation.addListener('blur', function () {
            (0, MergeAccounts_1.clearGetValidateCodeForAccountMerge)();
            (0, MergeAccounts_1.clearMergeWithValidateCode)();
        });
        return unsubscribe;
    }, [navigation]);
    var authenticationErrorKey = getAuthenticationErrorKey(latestError);
    var validateCodeError = !errorPage && authenticationErrorKey ? { authError: translate(authenticationErrorKey) } : undefined;
    return (<ScreenWrapper_1.default shouldEnableMaxHeight includeSafeAreaPaddingBottom testID={AccountValidatePage.displayName}>
            <HeaderWithBackButton_1.default title={translate('mergeAccountsPage.mergeAccount')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_MERGE_ACCOUNTS.getRoute());
        }} shouldDisplayHelpButton={false}/>
            <ScrollView_1.default style={[styles.w100, styles.h100, styles.flex1]} contentContainerStyle={[styles.flexGrow1]}>
                <ValidateCodeActionForm_1.default descriptionPrimary={translate('mergeAccountsPage.accountValidate.confirmMerge')} descriptionPrimaryStyles={__assign(__assign({}, styles.mb8), styles.textStrong)} descriptionSecondary={<react_native_1.View style={[styles.w100]}>
                            <Text_1.default style={[styles.mb8]}>
                                {translate('mergeAccountsPage.accountValidate.lossOfUnsubmittedData')}
                                <Text_1.default style={styles.textStrong}>{email}</Text_1.default>.
                            </Text_1.default>
                            <Text_1.default>
                                {translate('mergeAccountsPage.accountValidate.enterMagicCode')}
                                <Text_1.default style={styles.textStrong}>{email}</Text_1.default>.
                            </Text_1.default>
                        </react_native_1.View>} descriptionSecondaryStyles={styles.mb8} handleSubmitForm={function (code) {
            (0, MergeAccounts_1.mergeWithValidateCode)(email, code);
        }} sendValidateCode={function () {
            (0, MergeAccounts_1.requestValidationCodeForAccountMerge)(email, true);
        }} shouldSkipInitialValidation clearError={function () { return (0, MergeAccounts_1.clearMergeWithValidateCode)(); }} validateError={validateCodeError} hasMagicCodeBeenSent={getValidateCodeForAccountMerge === null || getValidateCodeForAccountMerge === void 0 ? void 0 : getValidateCodeForAccountMerge.validateCodeResent} submitButtonText={translate('mergeAccountsPage.mergeAccount')} forwardedRef={validateCodeFormRef} isLoading={mergeWithValidateCode === null || mergeWithValidateCode === void 0 ? void 0 : mergeWithValidateCode.isLoading}/>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
AccountValidatePage.displayName = 'AccountValidatePage';
exports.default = AccountValidatePage;
