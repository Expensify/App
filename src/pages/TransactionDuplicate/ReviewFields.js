"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var InteractiveStepSubHeader_1 = require("@components/InteractiveStepSubHeader");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function ReviewFields(_a) {
    var stepNames = _a.stepNames, label = _a.label, options = _a.options, index = _a.index, onSelectRow = _a.onSelectRow;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var falsyCount = 0;
    var filteredOptions = options === null || options === void 0 ? void 0 : options.filter(function (name) {
        if (name.text !== translate('violations.none')) {
            return true;
        }
        falsyCount++;
        return falsyCount <= 1;
    });
    var sections = (0, react_1.useMemo)(function () {
        return filteredOptions === null || filteredOptions === void 0 ? void 0 : filteredOptions.map(function (option) { return ({
            text: option.text,
            keyForList: option.text,
            value: option.value,
        }); });
    }, [filteredOptions]);
    return (<react_native_1.View key={index} style={styles.flex1}>
            {stepNames.length > 1 && (<react_native_1.View style={[styles.w100, styles.ph5, styles.mb5, styles.mt3, { height: CONST_1.default.BANK_ACCOUNT.STEPS_HEADER_HEIGHT }]}>
                    <InteractiveStepSubHeader_1.default stepNames={stepNames} startStepIndex={index}/>
                </react_native_1.View>)}

            <Text_1.default family="EXP_NEW_KANSAS_MEDIUM" fontSize={variables_1.default.fontSizeLarge} style={[styles.pb5, styles.ph5, stepNames.length < 1 && styles.mt3]}>
                {label}
            </Text_1.default>
            <SelectionList_1.default sections={[{ data: sections !== null && sections !== void 0 ? sections : [] }]} ListItem={RadioListItem_1.default} onSelectRow={onSelectRow}/>
        </react_native_1.View>);
}
ReviewFields.displayName = 'ReviewFields';
exports.default = ReviewFields;
