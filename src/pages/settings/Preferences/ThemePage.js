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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ThemePage() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var preferredTheme = (0, useOnyx_1.default)(ONYXKEYS_1.default.PREFERRED_THEME)[0];
    var isOptionSelected = (0, react_1.useRef)(false);
    var _b = CONST_1.default.THEME, DEFAULT = _b.DEFAULT, FALLBACK = _b.FALLBACK, themes = __rest(_b, ["DEFAULT", "FALLBACK"]);
    var localesToThemes = Object.values(themes).map(function (theme) { return ({
        value: theme,
        text: translate("themePage.themes.".concat(theme, ".label")),
        keyForList: theme,
        isSelected: (preferredTheme !== null && preferredTheme !== void 0 ? preferredTheme : CONST_1.default.THEME.DEFAULT) === theme,
    }); });
    var updateTheme = function (selectedTheme) {
        if (isOptionSelected.current) {
            return;
        }
        isOptionSelected.current = true;
        (0, User_1.updateTheme)(selectedTheme.value);
    };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={ThemePage.displayName}>
            <HeaderWithBackButton_1.default title={translate('themePage.theme')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <Text_1.default style={[styles.mh5, styles.mv4]}>{translate('themePage.chooseThemeBelowOrSync')}</Text_1.default>
            <SelectionList_1.default sections={[{ data: localesToThemes }]} ListItem={RadioListItem_1.default} onSelectRow={updateTheme} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_a = localesToThemes.find(function (theme) { return theme.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList}/>
        </ScreenWrapper_1.default>);
}
ThemePage.displayName = 'ThemePage';
exports.default = ThemePage;
