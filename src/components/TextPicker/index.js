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
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var TextSelectorModal_1 = require("./TextSelectorModal");
function TextPicker(_a, forwardedRef) {
    var _b;
    var value = _a.value, description = _a.description, _c = _a.placeholder, placeholder = _c === void 0 ? '' : _c, _d = _a.errorText, errorText = _d === void 0 ? '' : _d, onInputChange = _a.onInputChange, furtherDetails = _a.furtherDetails, rightLabel = _a.rightLabel, _e = _a.disabled, disabled = _e === void 0 ? false : _e, _f = _a.interactive, interactive = _f === void 0 ? true : _f, _g = _a.required, required = _g === void 0 ? false : _g, rest = __rest(_a, ["value", "description", "placeholder", "errorText", "onInputChange", "furtherDetails", "rightLabel", "disabled", "interactive", "required"]);
    var styles = (0, useThemeStyles_1.default)();
    var _h = (0, react_1.useState)(false), isPickerVisible = _h[0], setIsPickerVisible = _h[1];
    var showPickerModal = function () {
        if (disabled) {
            return;
        }
        setIsPickerVisible(true);
    };
    var hidePickerModal = function () {
        setIsPickerVisible(false);
    };
    var updateInput = function (updatedValue) {
        if (updatedValue !== value) {
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(updatedValue);
        }
        hidePickerModal();
    };
    return (<react_native_1.View>
            <MenuItemWithTopDescription_1.default ref={forwardedRef} shouldShowRightIcon={!disabled} title={(_b = value !== null && value !== void 0 ? value : placeholder) !== null && _b !== void 0 ? _b : ''} description={description} onPress={showPickerModal} furtherDetails={furtherDetails} rightLabel={rightLabel} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText} style={[styles.moneyRequestMenuItem]} interactive={interactive}/>
            <TextSelectorModal_1.default value={value} isVisible={isPickerVisible} description={description} onClose={hidePickerModal} onValueSelected={updateInput} disabled={disabled} required={required} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>
        </react_native_1.View>);
}
TextPicker.displayName = 'TextPicker';
exports.default = (0, react_1.forwardRef)(TextPicker);
