"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
var SelectCircle_1 = require("./SelectCircle");
var Text_1 = require("./Text");
function SingleOptionSelector(_a) {
    var _b = _a.options, options = _b === void 0 ? [] : _b, selectedOptionKey = _a.selectedOptionKey, _c = _a.onSelectOption, onSelectOption = _c === void 0 ? function () { } : _c, optionRowStyles = _a.optionRowStyles, selectCircleStyles = _a.selectCircleStyles;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={styles.pt4}>
            {options.map(function (option) { return (<react_native_1.View style={styles.flexRow} key={option.key}>
                    <PressableWithoutFeedback_1.default style={[styles.singleOptionSelectorRow, optionRowStyles]} onPress={function () { return onSelectOption(option); }} role={CONST_1.default.ROLE.BUTTON} accessibilityState={{ checked: selectedOptionKey === option.key }} aria-checked={selectedOptionKey === option.key} accessibilityLabel={option.label}>
                        <SelectCircle_1.default isChecked={selectedOptionKey ? selectedOptionKey === option.key : false} selectCircleStyles={[styles.ml0, styles.singleOptionSelectorCircle, selectCircleStyles]}/>
                        <Text_1.default>{translate(option.label)}</Text_1.default>
                    </PressableWithoutFeedback_1.default>
                </react_native_1.View>); })}
        </react_native_1.View>);
}
SingleOptionSelector.displayName = 'SingleOptionSelector';
exports.default = SingleOptionSelector;
