"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Expensicons_1 = require("./Icon/Expensicons");
var Text_1 = require("./Text");
var TextInput_1 = require("./TextInput");
function SearchBar(_a) {
    var label = _a.label, style = _a.style, _b = _a.icon, icon = _b === void 0 ? Expensicons_1.MagnifyingGlass : _b, inputValue = _a.inputValue, onChangeText = _a.onChangeText, onSubmitEditing = _a.onSubmitEditing, shouldShowEmptyState = _a.shouldShowEmptyState;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var translate = (0, useLocalize_1.default)().translate;
    return (<>
            <react_native_1.View style={[styles.getSearchBarStyle(shouldUseNarrowLayout), style]}>
                <TextInput_1.default label={label} accessibilityLabel={label} role={CONST_1.default.ROLE.PRESENTATION} value={inputValue} onChangeText={onChangeText} inputMode={CONST_1.default.INPUT_MODE.TEXT} selectTextOnFocus spellCheck={false} icon={(inputValue === null || inputValue === void 0 ? void 0 : inputValue.length) ? undefined : icon} iconContainerStyle={styles.p0} onSubmitEditing={function () { return onSubmitEditing === null || onSubmitEditing === void 0 ? void 0 : onSubmitEditing(inputValue); }} shouldShowClearButton shouldHideClearButton={!(inputValue === null || inputValue === void 0 ? void 0 : inputValue.length)}/>
            </react_native_1.View>
            {!!shouldShowEmptyState && inputValue.length !== 0 && (<react_native_1.View style={[styles.ph5, styles.pt3, styles.pb5]}>
                    <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('common.noResultsFoundMatching', { searchString: inputValue })}</Text_1.default>
                </react_native_1.View>)}
        </>);
}
SearchBar.displayName = 'SearchBar';
exports.default = SearchBar;
