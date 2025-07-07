"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CategorySelectorModal_1 = require("./CategorySelectorModal");
function CategorySelector(_a) {
    var _b = _a.defaultValue, defaultValue = _b === void 0 ? '' : _b, wrapperStyle = _a.wrapperStyle, label = _a.label, setNewCategory = _a.setNewCategory, policyID = _a.policyID, focused = _a.focused, isPickerVisible = _a.isPickerVisible, showPickerModal = _a.showPickerModal, hidePickerModal = _a.hidePickerModal;
    var styles = (0, useThemeStyles_1.default)();
    var updateCategoryInput = function (categoryItem) {
        setNewCategory(categoryItem);
        hidePickerModal();
    };
    var title = defaultValue;
    var descStyle = title.length === 0 ? styles.textNormal : null;
    return (<react_native_1.View>
            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={title} description={label} descriptionTextStyle={descStyle} onPress={showPickerModal} wrapperStyle={wrapperStyle} focused={focused}/>
            <CategorySelectorModal_1.default policyID={policyID} isVisible={isPickerVisible} currentCategory={defaultValue} onClose={hidePickerModal} onCategorySelected={updateCategoryInput} label={label}/>
        </react_native_1.View>);
}
CategorySelector.displayName = 'CategorySelector';
exports.default = CategorySelector;
