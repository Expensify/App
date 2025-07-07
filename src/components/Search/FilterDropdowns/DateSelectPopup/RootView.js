"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var MenuItem_1 = require("@components/MenuItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function RootView(_a) {
    var value = _a.value, applyChanges = _a.applyChanges, resetChanges = _a.resetChanges, setView = _a.setView;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var label = translate('common.date');
    return (<react_native_1.View style={[!shouldUseNarrowLayout && styles.pv4, styles.gap2]}>
            {shouldUseNarrowLayout && <Text_1.default style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text_1.default>}

            <react_native_1.View>
                {Object.values(CONST_1.default.SEARCH.DATE_MODIFIERS).map(function (dateType) {
            var dateValue = value[dateType];
            var description = dateValue !== null && dateValue !== void 0 ? dateValue : undefined;
            var lowerDateModifier = dateType.toLowerCase();
            return (<MenuItem_1.default key={dateType} shouldShowRightIcon title={translate("common.".concat(lowerDateModifier))} description={description} viewMode={CONST_1.default.OPTION_MODE.COMPACT} onPress={function () { return setView(dateType); }}/>);
        })}
            </react_native_1.View>

            <react_native_1.View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button_1.default medium style={[styles.flex1]} text={translate('common.reset')} onPress={resetChanges}/>
                <Button_1.default success medium style={[styles.flex1]} text={translate('common.apply')} onPress={applyChanges}/>
            </react_native_1.View>
        </react_native_1.View>);
}
RootView.displayName = 'RootView';
exports.default = RootView;
