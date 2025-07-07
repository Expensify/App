"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Checkbox_1 = require("./Checkbox");
var FormHelpMessage_1 = require("./FormHelpMessage");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
var Text_1 = require("./Text");
function CheckboxWithLabel(_a, ref) {
    var _b;
    var _c = _a.errorText, errorText = _c === void 0 ? '' : _c, _d = _a.isChecked, isCheckedProp = _d === void 0 ? false : _d, _e = _a.defaultValue, defaultValue = _e === void 0 ? false : _e, _f = _a.onInputChange, onInputChange = _f === void 0 ? function () { } : _f, LabelComponent = _a.LabelComponent, label = _a.label, accessibilityLabel = _a.accessibilityLabel, style = _a.style, value = _a.value;
    var styles = (0, useThemeStyles_1.default)();
    // We need to pick the first value that is strictly a boolean
    // https://github.com/Expensify/App/issues/16885#issuecomment-1520846065
    var _g = (0, react_1.useState)(function () { return [value, defaultValue, isCheckedProp].find(function (item) { return typeof item === 'boolean'; }); }), isChecked = _g[0], setIsChecked = _g[1];
    var toggleCheckbox = function () {
        onInputChange(!isChecked);
        setIsChecked(!isChecked);
    };
    return (<react_native_1.View style={style}>
            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.breakWord]}>
                <Checkbox_1.default isChecked={isChecked} onPress={toggleCheckbox} style={[styles.checkboxWithLabelCheckboxStyle]} hasError={!!errorText} ref={ref} accessibilityLabel={(_b = accessibilityLabel !== null && accessibilityLabel !== void 0 ? accessibilityLabel : label) !== null && _b !== void 0 ? _b : ''}/>
                <PressableWithFeedback_1.default tabIndex={-1} accessible={false} onPress={toggleCheckbox} pressDimmingValue={variables_1.default.checkboxLabelActiveOpacity} 
    // We want to disable hover dimming
    hoverDimmingValue={variables_1.default.checkboxLabelHoverOpacity} style={[styles.flexRow, styles.alignItemsCenter, styles.noSelect, styles.w100]} wrapperStyle={[styles.ml3, styles.pr2, styles.w100, styles.flexWrap, styles.flexShrink1]}>
                    {!!label && <Text_1.default style={[styles.ml1]}>{label}</Text_1.default>}
                    {!!LabelComponent && <LabelComponent />}
                </PressableWithFeedback_1.default>
            </react_native_1.View>
            <FormHelpMessage_1.default message={errorText}/>
        </react_native_1.View>);
}
CheckboxWithLabel.displayName = 'CheckboxWithLabel';
exports.default = react_1.default.forwardRef(CheckboxWithLabel);
