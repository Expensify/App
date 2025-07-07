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
function NetSuiteCustomSegmentMappingPicker(_a) {
    var value = _a.value, errorText = _a.errorText, onInputChange = _a.onInputChange;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var selectionData = [
        {
            text: translate("workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentTitle"),
            keyForList: CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            isSelected: value === CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            value: CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
        },
        {
            text: translate("workspace.netsuite.import.importCustomFields.customSegments.addForm.recordTitle"),
            keyForList: CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            isSelected: value === CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            value: CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
        },
    ];
    return (<>
            <SelectionList_1.default sections={[{ data: selectionData }]} onSelectRow={function (selected) {
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(selected.value);
        }} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={value !== null && value !== void 0 ? value : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG} shouldSingleExecuteRowSelect shouldUpdateFocusedIndex/>
            {!!errorText && (<react_native_1.View style={styles.ph5}>
                    <FormHelpMessage_1.default isError={!!errorText} message={errorText}/>
                </react_native_1.View>)}
        </>);
}
NetSuiteCustomSegmentMappingPicker.displayName = 'NetSuiteCustomSegmentMappingPicker';
exports.default = NetSuiteCustomSegmentMappingPicker;
