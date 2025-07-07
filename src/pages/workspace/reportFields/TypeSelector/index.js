"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useLocalize_1 = require("@hooks/useLocalize");
var WorkspaceReportFieldUtils = require("@libs/WorkspaceReportFieldUtils");
var CONST_1 = require("@src/CONST");
var TypeSelectorModal_1 = require("./TypeSelectorModal");
function TypeSelector(_a, forwardedRef) {
    var value = _a.value, _b = _a.label, label = _b === void 0 ? '' : _b, rightLabel = _a.rightLabel, _c = _a.subtitle, subtitle = _c === void 0 ? '' : _c, _d = _a.errorText, errorText = _d === void 0 ? '' : _d, onInputChange = _a.onInputChange, onTypeSelected = _a.onTypeSelected;
    var translate = (0, useLocalize_1.default)().translate;
    var _e = (0, react_1.useState)(false), isPickerVisible = _e[0], setIsPickerVisible = _e[1];
    var showPickerModal = function () {
        setIsPickerVisible(true);
    };
    var hidePickerModal = function () {
        setIsPickerVisible(false);
    };
    var updateTypeInput = function (reportField) {
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(reportField.value);
        onTypeSelected === null || onTypeSelected === void 0 ? void 0 : onTypeSelected(reportField.value);
        hidePickerModal();
    };
    return (<react_native_1.View>
            <MenuItemWithTopDescription_1.default ref={forwardedRef} shouldShowRightIcon title={value ? expensify_common_1.Str.recapitalize(translate(WorkspaceReportFieldUtils.getReportFieldTypeTranslationKey(value))) : ''} description={label} rightLabel={rightLabel} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText} onPress={showPickerModal}/>
            <TypeSelectorModal_1.default isVisible={isPickerVisible} currentType={value} onClose={hidePickerModal} onTypeSelected={updateTypeInput} label={label} subtitle={subtitle}/>
        </react_native_1.View>);
}
TypeSelector.displayName = 'TypeSelector';
exports.default = (0, react_1.forwardRef)(TypeSelector);
