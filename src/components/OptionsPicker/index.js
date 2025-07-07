"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var OptionItem_1 = require("./OptionItem");
function OptionsPicker(_a) {
    var options = _a.options, selectedOption = _a.selectedOption, onOptionSelected = _a.onOptionSelected, style = _a.style, isDisabled = _a.isDisabled;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    if (shouldUseNarrowLayout) {
        return (<react_native_1.View style={[styles.flexColumn, styles.flex1, style]}>
                {options.map(function (option, index) { return (<react_1.Fragment key={option.key}>
                        <OptionItem_1.default title={option.title} icon={option.icon} isSelected={selectedOption === option.key} isDisabled={isDisabled} onPress={function () { return onOptionSelected(option.key); }}/>
                        {index < options.length - 1 && <react_native_1.View style={styles.mb3}/>}
                    </react_1.Fragment>); })}
            </react_native_1.View>);
    }
    return (<react_native_1.View style={[styles.flexRow, styles.flex1, style]}>
            {options.map(function (option, index) { return (<react_1.Fragment key={option.key}>
                    <OptionItem_1.default title={option.title} icon={option.icon} isSelected={selectedOption === option.key} isDisabled={isDisabled} onPress={function () { return onOptionSelected(option.key); }}/>
                    {index < options.length - 1 && <react_native_1.View style={styles.mr3}/>}
                </react_1.Fragment>); })}
        </react_native_1.View>);
}
OptionsPicker.displayName = 'OptionsPicker';
exports.default = OptionsPicker;
