"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function NetSuiteCustomFieldMappingPicker(_a) {
    var _b;
    var value = _a.value, errorText = _a.errorText, onInputChange = _a.onInputChange;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var options = [CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];
    var selectionData = (_b = options.map(function (option) { return ({
        text: translate("workspace.netsuite.import.importTypes.".concat(option, ".label")),
        keyForList: option,
        isSelected: value === option,
        value: option,
        alternateText: translate("workspace.netsuite.import.importTypes.".concat(option, ".description")),
    }); })) !== null && _b !== void 0 ? _b : [];
    return (<>
            <SelectionList_1.default sections={[{ data: selectionData }]} onSelectRow={function (selected) {
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(selected.value);
        }} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={value !== null && value !== void 0 ? value : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG} shouldSingleExecuteRowSelect shouldUpdateFocusedIndex/>
            {!!errorText && (<react_native_1.View style={styles.ph5}>
                    <FormHelpMessage_1.default isError={!!errorText} message={errorText}/>
                </react_native_1.View>)}
        </>);
}
NetSuiteCustomFieldMappingPicker.displayName = 'NetSuiteCustomFieldMappingPicker';
exports.default = NetSuiteCustomFieldMappingPicker;
