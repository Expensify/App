"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useOnyx_1 = require("@hooks/useOnyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var InitialListValueSelectorModal_1 = require("./InitialListValueSelectorModal");
function InitialListValueSelector(_a, forwardedRef) {
    var _b = _a.value, value = _b === void 0 ? '' : _b, _c = _a.label, label = _c === void 0 ? '' : _c, rightLabel = _a.rightLabel, _d = _a.subtitle, subtitle = _d === void 0 ? '' : _d, _e = _a.errorText, errorText = _e === void 0 ? '' : _e, onInputChange = _a.onInputChange;
    var formDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT)[0];
    var _f = (0, react_1.useState)(false), isPickerVisible = _f[0], setIsPickerVisible = _f[1];
    var showPickerModal = function () {
        setIsPickerVisible(true);
    };
    var hidePickerModal = function () {
        setIsPickerVisible(false);
    };
    var updateValueInput = function (initialValue) {
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(value === initialValue ? '' : initialValue);
        hidePickerModal();
    };
    (0, react_1.useEffect)(function () {
        var _a, _b, _c;
        var currentValueIndex = Object.values((_a = formDraft === null || formDraft === void 0 ? void 0 : formDraft.listValues) !== null && _a !== void 0 ? _a : {}).findIndex(function (listValue) { return listValue === value; });
        var isCurrentValueDisabled = (_c = (_b = formDraft === null || formDraft === void 0 ? void 0 : formDraft.disabledListValues) === null || _b === void 0 ? void 0 : _b[currentValueIndex]) !== null && _c !== void 0 ? _c : true;
        if (isCurrentValueDisabled && value !== '') {
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange('');
        }
    }, [formDraft === null || formDraft === void 0 ? void 0 : formDraft.disabledListValues, formDraft === null || formDraft === void 0 ? void 0 : formDraft.listValues, onInputChange, value]);
    return (<react_native_1.View>
            <MenuItemWithTopDescription_1.default ref={forwardedRef} shouldShowRightIcon title={value} description={label} rightLabel={rightLabel} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText} onPress={showPickerModal}/>
            <InitialListValueSelectorModal_1.default isVisible={isPickerVisible} currentValue={value} onClose={hidePickerModal} onValueSelected={updateValueInput} label={label} subtitle={subtitle}/>
        </react_native_1.View>);
}
InitialListValueSelector.displayName = 'InitialListValueSelector';
exports.default = (0, react_1.forwardRef)(InitialListValueSelector);
