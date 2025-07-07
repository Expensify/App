"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var CalendarPicker_1 = require("@components/DatePicker/CalendarPicker");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function CalendarView(_a) {
    var view = _a.view, value = _a.value, navigateBack = _a.navigateBack, setValue = _a.setValue;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _b = (0, react_1.useState)(value), localDateValue = _b[0], setLocalDateValue = _b[1];
    var lowerDateModifier = view.toLowerCase();
    var resetChanges = function () {
        setValue(view, null);
        navigateBack();
    };
    var saveChanges = function () {
        setValue(view, localDateValue);
        navigateBack();
    };
    return (<react_native_1.View style={[!shouldUseNarrowLayout && styles.pv4]}>
            <HeaderWithBackButton_1.default shouldDisplayHelpButton={false} style={[styles.h10, styles.pb3]} subtitle={translate("common.".concat(lowerDateModifier))} onBackButtonPress={navigateBack}/>

            <CalendarPicker_1.default value={localDateValue !== null && localDateValue !== void 0 ? localDateValue : undefined} onSelected={setLocalDateValue} maxDate={CONST_1.default.CALENDAR_PICKER.MAX_DATE} minDate={CONST_1.default.CALENDAR_PICKER.MIN_DATE}/>

            <react_native_1.View style={[styles.flexRow, styles.gap2, styles.ph5, styles.pt2]}>
                <Button_1.default medium style={[styles.flex1]} text={translate('common.reset')} onPress={resetChanges}/>
                <Button_1.default success medium style={[styles.flex1]} text={translate('common.save')} onPress={saveChanges}/>
            </react_native_1.View>
        </react_native_1.View>);
}
CalendarView.displayName = 'CalendarView';
exports.default = CalendarView;
