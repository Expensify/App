"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Checkbox_1 = require("@components/Checkbox");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var RadioListItem_1 = require("./RadioListItem");
/**
 * MultiSelectListItem mirrors the behavior of a default RadioListItem, but adds support
 * for the new style of multi selection lists.
 */
function MultiSelectListItem(_a) {
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, onSelectRow = _a.onSelectRow, onDismissError = _a.onDismissError, shouldPreventEnterKeySubmit = _a.shouldPreventEnterKeySubmit, _b = _a.isMultilineSupported, isMultilineSupported = _b === void 0 ? false : _b, _c = _a.isAlternateTextMultilineSupported, isAlternateTextMultilineSupported = _c === void 0 ? false : _c, _d = _a.alternateTextNumberOfLines, alternateTextNumberOfLines = _d === void 0 ? 2 : _d, onFocus = _a.onFocus, shouldSyncFocus = _a.shouldSyncFocus, wrapperStyle = _a.wrapperStyle, titleStyles = _a.titleStyles;
    var styles = (0, useThemeStyles_1.default)();
    var isSelected = item.isSelected;
    var checkboxComponent = (0, react_1.useCallback)(function () {
        var _a;
        return (<Checkbox_1.default shouldSelectOnPressEnter isChecked={isSelected} accessibilityLabel={(_a = item.text) !== null && _a !== void 0 ? _a : ''} onPress={function () { return onSelectRow(item); }}/>);
    }, [isSelected, item, onSelectRow]);
    return (<RadioListItem_1.default item={item} isFocused={isFocused} showTooltip={showTooltip} isDisabled={isDisabled} rightHandSideComponent={checkboxComponent} onSelectRow={onSelectRow} onDismissError={onDismissError} shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit} isMultilineSupported={isMultilineSupported} isAlternateTextMultilineSupported={isAlternateTextMultilineSupported} alternateTextNumberOfLines={alternateTextNumberOfLines} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus} wrapperStyle={[wrapperStyle, styles.optionRowCompact]} titleStyles={titleStyles}/>);
}
MultiSelectListItem.displayName = 'MultiSelectListItem';
exports.default = MultiSelectListItem;
