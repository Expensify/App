"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useLocalize_1 = require("@hooks/useLocalize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var NetSuiteCustomListSelectorModal_1 = require("./NetSuiteCustomListSelectorModal");
function NetSuiteCustomListPicker(_a) {
    var value = _a.value, policy = _a.policy, internalIDInputID = _a.internalIDInputID, errorText = _a.errorText, _b = _a.onInputChange, onInputChange = _b === void 0 ? function () { } : _b;
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, react_1.useState)(false), isPickerVisible = _c[0], setIsPickerVisible = _c[1];
    var hidePickerModal = function () {
        setIsPickerVisible(false);
    };
    var updateInput = function (item) {
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(item.value);
        if (internalIDInputID) {
            onInputChange(item.id, internalIDInputID);
        }
        hidePickerModal();
    };
    return (<>
            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={value} description={translate('workspace.netsuite.import.importCustomFields.customLists.fields.listName')} onPress={function () { return setIsPickerVisible(true); }} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText}/>
            <NetSuiteCustomListSelectorModal_1.default isVisible={isPickerVisible} currentCustomListValue={value !== null && value !== void 0 ? value : ''} onCustomListSelected={updateInput} onClose={hidePickerModal} label={translate('workspace.netsuite.import.importCustomFields.customLists.fields.listName')} policy={policy} onBackdropPress={Navigation_1.default.dismissModal}/>
        </>);
}
NetSuiteCustomListPicker.displayName = 'NetSuiteCustomListPicker';
exports.default = NetSuiteCustomListPicker;
