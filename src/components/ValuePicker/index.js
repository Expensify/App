"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ValueSelectionList_1 = require("./ValueSelectionList");
var ValueSelectorModal_1 = require("./ValueSelectorModal");
function ValuePicker(_a, forwardedRef) {
    var value = _a.value, label = _a.label, items = _a.items, _b = _a.placeholder, placeholder = _b === void 0 ? '' : _b, _c = _a.errorText, errorText = _c === void 0 ? '' : _c, onInputChange = _a.onInputChange, furtherDetails = _a.furtherDetails, _d = _a.shouldShowTooltips, shouldShowTooltips = _d === void 0 ? true : _d, _e = _a.shouldShowModal, shouldShowModal = _e === void 0 ? true : _e;
    var _f = (0, react_1.useState)(false), isPickerVisible = _f[0], setIsPickerVisible = _f[1];
    var showPickerModal = function () {
        setIsPickerVisible(true);
    };
    var hidePickerModal = function () {
        setIsPickerVisible(false);
    };
    var updateInput = function (item) {
        if (item.value !== value) {
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(item.value);
        }
        hidePickerModal();
    };
    var selectedItem = items === null || items === void 0 ? void 0 : items.find(function (item) { return item.value === value; });
    return (<react_native_1.View>
            {shouldShowModal ? (<>
                    <MenuItemWithTopDescription_1.default ref={forwardedRef} shouldShowRightIcon 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        title={(selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.label) || placeholder || ''} description={label} onPress={showPickerModal} furtherDetails={furtherDetails} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText}/>
                    <ValueSelectorModal_1.default isVisible={isPickerVisible} label={label} selectedItem={selectedItem} items={items} onClose={hidePickerModal} onItemSelected={updateInput} shouldShowTooltips={shouldShowTooltips} onBackdropPress={Navigation_1.default.dismissModal} shouldEnableKeyboardAvoidingView={false}/>
                </>) : (<ValueSelectionList_1.default items={items} selectedItem={selectedItem} onItemSelected={updateInput} shouldShowTooltips={shouldShowTooltips}/>)}
        </react_native_1.View>);
}
ValuePicker.displayName = 'ValuePicker';
exports.default = (0, react_1.forwardRef)(ValuePicker);
