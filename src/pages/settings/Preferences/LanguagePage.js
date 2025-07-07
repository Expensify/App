"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var App_1 = require("@userActions/App");
var LOCALES_1 = require("@src/CONST/LOCALES");
function LanguagePage() {
    var _a;
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, preferredLocale = _b.preferredLocale;
    var isOptionSelected = (0, react_1.useRef)(false);
    var locales = (0, react_1.useMemo)(function () {
        return LOCALES_1.SORTED_LOCALES.map(function (locale) { return ({
            value: locale,
            text: LOCALES_1.LOCALE_TO_LANGUAGE_STRING[locale],
            keyForList: locale,
            isSelected: preferredLocale === locale,
        }); });
    }, [preferredLocale]);
    var updateLanguage = function (selectedLanguage) {
        if (isOptionSelected.current) {
            return;
        }
        isOptionSelected.current = true;
        (0, App_1.setLocaleAndNavigate)(selectedLanguage.value);
    };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={LanguagePage.displayName}>
            <HeaderWithBackButton_1.default title={translate('languagePage.language')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <FullPageOfflineBlockingView_1.default>
                <SelectionList_1.default sections={[{ data: locales }]} ListItem={RadioListItem_1.default} onSelectRow={updateLanguage} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_a = locales.find(function (locale) { return locale.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList}/>
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
LanguagePage.displayName = 'LanguagePage';
exports.default = LanguagePage;
