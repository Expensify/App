"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var goToSettings_1 = require("@libs/goToSettings");
function ImportContactButton(_a) {
    var showImportContacts = _a.showImportContacts, inputHelperText = _a.inputHelperText, _b = _a.isInSearch, isInSearch = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return showImportContacts && inputHelperText ? (<react_native_1.View style={[styles.ph5, styles.pb5, styles.flexRow]}>
            <Text_1.default style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>
                {isInSearch ? "".concat(translate('common.noResultsFound'), ". ") : null}
                <Text_1.default style={[styles.textLabel, styles.minHeight5, styles.link]} onPress={goToSettings_1.default}>
                    {translate('contact.importContactsTitle')}
                </Text_1.default>{' '}
                {translate('contact.importContactsExplanation')}
            </Text_1.default>
        </react_native_1.View>) : null;
}
ImportContactButton.displayName = 'ImportContactButton';
exports.default = ImportContactButton;
