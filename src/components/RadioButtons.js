"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FormHelpMessage_1 = require("./FormHelpMessage");
var RadioButtonWithLabel_1 = require("./RadioButtonWithLabel");
function RadioButtons(_a, ref) {
    var items = _a.items, onPress = _a.onPress, _b = _a.defaultCheckedValue, defaultCheckedValue = _b === void 0 ? '' : _b, radioButtonStyle = _a.radioButtonStyle, errorText = _a.errorText, _c = _a.onInputChange, onInputChange = _c === void 0 ? function () { } : _c, value = _a.value;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, react_1.useState)(defaultCheckedValue), checkedValue = _d[0], setCheckedValue = _d[1];
    (0, react_1.useEffect)(function () {
        if (value === checkedValue || value === undefined) {
            return;
        }
        setCheckedValue(value !== null && value !== void 0 ? value : '');
    }, [checkedValue, value]);
    return (<>
            <react_native_1.View style={styles.mt6} ref={ref}>
                {items.map(function (item) { return (<RadioButtonWithLabel_1.default key={item.value} isChecked={item.value === checkedValue} style={[styles.mb4, radioButtonStyle]} onPress={function () {
                setCheckedValue(item.value);
                onInputChange(item.value);
                return onPress(item.value);
            }} label={item.label}/>); })}
            </react_native_1.View>
            {!!errorText && <FormHelpMessage_1.default message={errorText}/>}
        </>);
}
RadioButtons.displayName = 'RadioButtons';
exports.default = (0, react_1.forwardRef)(RadioButtons);
