"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItem_1 = require("@components/MenuItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var KeyboardShortcut_1 = require("@libs/KeyboardShortcut");
var CONST_1 = require("@src/CONST");
function KeyboardShortcutsPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shortcuts = Object.values(CONST_1.default.KEYBOARD_SHORTCUTS)
        .map(function (shortcut) {
        var platformAdjustedModifiers = KeyboardShortcut_1.default.getPlatformEquivalentForKeys(shortcut.modifiers);
        return {
            displayName: KeyboardShortcut_1.default.getDisplayName(shortcut.shortcutKey, platformAdjustedModifiers),
            descriptionKey: shortcut.descriptionKey,
        };
    })
        .filter(function (shortcut) { return !!shortcut.descriptionKey; });
    /**
     * Render the information of a single shortcut
     * @param shortcut - The shortcut to render
     */
    var renderShortcut = function (shortcut) { return (<MenuItem_1.default key={shortcut.displayName} title={shortcut.displayName} description={translate("keyboardShortcutsPage.shortcuts.".concat(shortcut.descriptionKey))} wrapperStyle={[styles.ph0, styles.cursorAuto]} interactive={false}/>); };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={KeyboardShortcutsPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('keyboardShortcutsPage.title')}/>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                <react_native_1.View style={[styles.ph5, styles.pv3]}>
                    <Text_1.default style={[styles.mb3, styles.webViewStyles.baseFontStyle]}>{translate('keyboardShortcutsPage.subtitle')}</Text_1.default>
                    {shortcuts.map(renderShortcut)}
                </react_native_1.View>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
KeyboardShortcutsPage.displayName = 'KeyboardShortcutsPage';
exports.default = KeyboardShortcutsPage;
