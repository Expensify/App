"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AccountUtils_1 = require("@libs/AccountUtils");
var App_1 = require("@userActions/App");
var LOCALES_1 = require("@src/CONST/LOCALES");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Picker_1 = require("./Picker");
function LocalePicker(_a) {
    var _b = _a.size, size = _b === void 0 ? 'normal' : _b;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var preferredLocale = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, { canBeMissing: true })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var locales = (0, react_1.useMemo)(function () {
        var sortedLocales = LOCALES_1.SORTED_LOCALES;
        return sortedLocales.map(function (locale) { return ({
            value: locale,
            label: LOCALES_1.LOCALE_TO_LANGUAGE_STRING[locale],
            keyForList: locale,
            isSelected: preferredLocale === locale,
        }); });
    }, [preferredLocale]);
    var shouldDisablePicker = AccountUtils_1.default.isValidateCodeFormSubmitting(account);
    return (<Picker_1.default label={size === 'normal' ? translate('languagePage.language') : null} onInputChange={function (locale) {
            if (locale === preferredLocale) {
                return;
            }
            (0, App_1.setLocale)(locale);
        }} isDisabled={shouldDisablePicker} items={locales} shouldAllowDisabledStyle={false} shouldShowOnlyTextWhenDisabled={false} size={size} value={preferredLocale} containerStyles={size === 'small' ? styles.pickerContainerSmall : {}} backgroundColor={theme.signInPage}/>);
}
LocalePicker.displayName = 'LocalePicker';
exports.default = LocalePicker;
