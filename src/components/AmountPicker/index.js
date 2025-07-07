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
var CONST_1 = require("@src/CONST");
var callOrReturn_1 = require("@src/types/utils/callOrReturn");
var AmountSelectorModal_1 = require("./AmountSelectorModal");
function AmountPicker(_a, forwardedRef) {
    var value = _a.value, description = _a.description, title = _a.title, _b = _a.errorText, errorText = _b === void 0 ? '' : _b, onInputChange = _a.onInputChange, furtherDetails = _a.furtherDetails, rightLabel = _a.rightLabel, rest = __rest(_a, ["value", "description", "title", "errorText", "onInputChange", "furtherDetails", "rightLabel"]);
    var _c = (0, react_1.useState)(false), isPickerVisible = _c[0], setIsPickerVisible = _c[1];
    var showPickerModal = function () {
        setIsPickerVisible(true);
    };
    var hidePickerModal = function () {
        setIsPickerVisible(false);
    };
    var updateInput = function (updatedValue) {
        if (updatedValue !== value) {
            // We cast the updatedValue to a number and then back to a string to remove any leading zeros and separating commas
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(String(Number(updatedValue)));
        }
        hidePickerModal();
    };
    return (<react_native_1.View>
            <MenuItemWithTopDescription_1.default ref={forwardedRef} shouldShowRightIcon title={(0, callOrReturn_1.default)(title, value)} description={description} onPress={showPickerModal} furtherDetails={furtherDetails} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} rightLabel={rightLabel} errorText={errorText}/>
            <AmountSelectorModal_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} value={value} isVisible={isPickerVisible} description={description} onClose={hidePickerModal} onValueSelected={updateInput}/>
        </react_native_1.View>);
}
AmountPicker.displayName = 'AmountPicker';
exports.default = (0, react_1.forwardRef)(AmountPicker);
