"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var BusinessTypeSelectorModal_1 = require("./BusinessTypeSelectorModal");
function BusinessTypePicker(_a) {
    var _b = _a.errorText, errorText = _b === void 0 ? '' : _b, _c = _a.value, value = _c === void 0 ? '' : _c, wrapperStyle = _a.wrapperStyle, onInputChange = _a.onInputChange, label = _a.label, onBlur = _a.onBlur;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, react_1.useState)(false), isPickerVisible = _d[0], setIsPickerVisible = _d[1];
    var showPickerModal = function () {
        setIsPickerVisible(true);
    };
    var hidePickerModal = function (shouldBlur) {
        if (shouldBlur === void 0) { shouldBlur = true; }
        if (onBlur && shouldBlur) {
            onBlur();
        }
        setIsPickerVisible(false);
    };
    var updateBusinessTypeInput = function (businessTypeItem) {
        if (onInputChange && businessTypeItem.value !== value) {
            onInputChange(businessTypeItem.value);
        }
        // If the user selects any business type, call the hidePickerModal function with shouldBlur = false
        // to prevent the onBlur function from being called.
        hidePickerModal(false);
    };
    var title = value ? translate("businessInfoStep.incorporationType.".concat(value)) : '';
    var descStyle = title.length === 0 ? styles.textNormal : null;
    return (<react_native_1.View>
            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={title} description={label} descriptionTextStyle={descStyle} onPress={showPickerModal} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText} wrapperStyle={wrapperStyle}/>
            <BusinessTypeSelectorModal_1.default isVisible={isPickerVisible} currentBusinessType={value} onClose={hidePickerModal} onBusinessTypeSelected={updateBusinessTypeInput} label={label}/>
        </react_native_1.View>);
}
BusinessTypePicker.displayName = 'BusinessTypePicker';
exports.default = BusinessTypePicker;
