"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var keyboard_1 = require("@src/utils/keyboard");
var ExpenseLimitTypeSelectorModal_1 = require("./ExpenseLimitTypeSelectorModal");
function ExpenseLimitTypeSelector(_a) {
    var defaultValue = _a.defaultValue, wrapperStyle = _a.wrapperStyle, label = _a.label, setNewExpenseLimitType = _a.setNewExpenseLimitType;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(false), isPickerVisible = _b[0], setIsPickerVisible = _b[1];
    var showPickerModal = function () {
        keyboard_1.default.dismiss().then(function () {
            setIsPickerVisible(true);
        });
    };
    var hidePickerModal = function () {
        setIsPickerVisible(false);
    };
    var updateExpenseLimitTypeInput = function (expenseLimitType) {
        setNewExpenseLimitType(expenseLimitType);
        hidePickerModal();
    };
    var title = translate("workspace.rules.categoryRules.expenseLimitTypes.".concat(defaultValue));
    var descStyle = !title ? styles.textNormal : null;
    return (<react_native_1.View>
            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={title} description={label} descriptionTextStyle={descStyle} onPress={showPickerModal} wrapperStyle={wrapperStyle}/>
            <ExpenseLimitTypeSelectorModal_1.default isVisible={isPickerVisible} currentExpenseLimitType={defaultValue} onClose={hidePickerModal} onExpenseLimitTypeSelected={updateExpenseLimitTypeInput} label={label}/>
        </react_native_1.View>);
}
ExpenseLimitTypeSelector.displayName = 'ExpenseLimitTypeSelector';
exports.default = ExpenseLimitTypeSelector;
