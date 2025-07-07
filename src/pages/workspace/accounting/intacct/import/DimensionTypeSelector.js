"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function DimensionTypeSelector(_a) {
    var _b = _a.errorText, errorText = _b === void 0 ? '' : _b, _c = _a.value, value = _c === void 0 ? '' : _c, onInputChange = _a.onInputChange;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var selectionOptions = [
        {
            value: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG,
            text: translate('common.tag'),
            alternateText: translate('workspace.common.lineItemLevel'),
            keyForList: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG,
            isSelected: value === CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG,
        },
        {
            value: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
            text: translate('workspace.common.reportField'),
            alternateText: translate('workspace.common.reportLevel'),
            keyForList: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
            isSelected: value === CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
        },
    ];
    var onDimensionTypeSelected = function (dimensionType) {
        if (!onInputChange || dimensionType.value === value) {
            return;
        }
        onInputChange(dimensionType.value);
    };
    return (<react_native_1.View>
            <Text_1.default style={[styles.textLabelSupporting, styles.mb1]}>{translate('workspace.common.displayedAs')}</Text_1.default>
            <react_native_1.View style={[styles.mhn5, styles.pb5, styles.mb0]}>
                {selectionOptions.map(function (option) { return (<RadioListItem_1.default key={option.value} item={option} showTooltip={false} isFocused={option.isSelected} onSelectRow={onDimensionTypeSelected}/>); })}
                {!!errorText && (<FormHelpMessage_1.default style={styles.mh5} isError={!!errorText} message={errorText}/>)}
            </react_native_1.View>
        </react_native_1.View>);
}
exports.default = DimensionTypeSelector;
