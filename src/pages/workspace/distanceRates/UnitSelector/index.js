"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useLocalize_1 = require("@hooks/useLocalize");
var WorkspacesSettingsUtils_1 = require("@libs/WorkspacesSettingsUtils");
var UnitSelectorModal_1 = require("./UnitSelectorModal");
function UnitSelector(_a) {
    var defaultValue = _a.defaultValue, wrapperStyle = _a.wrapperStyle, label = _a.label, setNewUnit = _a.setNewUnit;
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(false), isPickerVisible = _b[0], setIsPickerVisible = _b[1];
    var showPickerModal = function () {
        setIsPickerVisible(true);
    };
    var hidePickerModal = function () {
        setIsPickerVisible(false);
    };
    var updateUnitInput = function (unit) {
        setNewUnit(unit);
        hidePickerModal();
    };
    var title = defaultValue ? expensify_common_1.Str.recapitalize(translate((0, WorkspacesSettingsUtils_1.getUnitTranslationKey)(defaultValue))) : '';
    return (<react_native_1.View>
            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={title} description={label} onPress={showPickerModal} wrapperStyle={wrapperStyle}/>
            <UnitSelectorModal_1.default isVisible={isPickerVisible} currentUnit={defaultValue} onClose={hidePickerModal} onUnitSelected={updateUnitInput} label={label}/>
        </react_native_1.View>);
}
UnitSelector.displayName = 'UnitSelector';
exports.default = UnitSelector;
