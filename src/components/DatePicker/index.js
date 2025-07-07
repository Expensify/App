"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons = require("@components/Icon/Expensicons");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var mergeRefs_1 = require("@libs/mergeRefs");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var DatePickerModal_1 = require("./DatePickerModal");
var PADDING_MODAL_DATE_PICKER = 8;
function DatePicker(_a, ref) {
    var defaultValue = _a.defaultValue, disabled = _a.disabled, errorText = _a.errorText, inputID = _a.inputID, label = _a.label, _b = _a.minDate, minDate = _b === void 0 ? (0, date_fns_1.setYear)(new Date(), CONST_1.default.CALENDAR_PICKER.MIN_YEAR) : _b, _c = _a.maxDate, maxDate = _c === void 0 ? (0, date_fns_1.setYear)(new Date(), CONST_1.default.CALENDAR_PICKER.MAX_YEAR) : _c, onInputChange = _a.onInputChange, _d = _a.onTouched, onTouched = _d === void 0 ? function () { } : _d, placeholder = _a.placeholder, value = _a.value, _e = _a.shouldSaveDraft, shouldSaveDraft = _e === void 0 ? false : _e, formID = _a.formID, _f = _a.autoFocus, autoFocus = _f === void 0 ? false : _f, _g = _a.shouldHideClearButton, shouldHideClearButton = _g === void 0 ? false : _g;
    var styles = (0, useThemeStyles_1.default)();
    var _h = (0, useWindowDimensions_1.default)(), windowHeight = _h.windowHeight, windowWidth = _h.windowWidth;
    var translate = (0, useLocalize_1.default)().translate;
    var _j = (0, react_1.useState)(false), isModalVisible = _j[0], setIsModalVisible = _j[1];
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var _k = (0, react_1.useState)(value || defaultValue || undefined), selectedDate = _k[0], setSelectedDate = _k[1];
    var _l = (0, react_1.useState)({ horizontal: 0, vertical: 0 }), popoverPosition = _l[0], setPopoverPosition = _l[1];
    var textInputRef = (0, react_1.useRef)(null);
    var anchorRef = (0, react_1.useRef)(null);
    var _m = (0, react_1.useState)(false), isInverted = _m[0], setIsInverted = _m[1];
    var isAutoFocused = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        var _a;
        if (shouldSaveDraft && formID) {
            (0, FormActions_1.setDraftValues)(formID, (_a = {}, _a[inputID] = selectedDate, _a));
        }
        if (selectedDate === value || !value) {
            return;
        }
        setSelectedDate(value);
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);
    var calculatePopoverPosition = (0, react_1.useCallback)(function () {
        var _a;
        (_a = anchorRef.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (x, y, width, height) {
            var wouldExceedBottom = y + CONST_1.default.POPOVER_DATE_MAX_HEIGHT + PADDING_MODAL_DATE_PICKER > windowHeight;
            setIsInverted(wouldExceedBottom);
            setPopoverPosition({
                horizontal: x + width,
                vertical: y + (wouldExceedBottom ? 0 : height + PADDING_MODAL_DATE_PICKER),
            });
        });
    }, [windowHeight]);
    var handlePress = (0, react_1.useCallback)(function () {
        calculatePopoverPosition();
        setIsModalVisible(true);
    }, [calculatePopoverPosition]);
    var closeDatePicker = (0, react_1.useCallback)(function () {
        var _a;
        (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        setIsModalVisible(false);
    }, []);
    var handleDateSelected = function (newDate) {
        onTouched === null || onTouched === void 0 ? void 0 : onTouched();
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(newDate);
        setSelectedDate(newDate);
        closeDatePicker();
    };
    var handleClear = function () {
        onTouched === null || onTouched === void 0 ? void 0 : onTouched();
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange('');
        setSelectedDate('');
    };
    (0, react_1.useEffect)(function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            calculatePopoverPosition();
        });
    }, [calculatePopoverPosition, windowWidth]);
    (0, react_1.useEffect)(function () {
        if (!autoFocus || isAutoFocused.current) {
            return;
        }
        isAutoFocused.current = true;
        react_native_1.InteractionManager.runAfterInteractions(function () {
            handlePress();
        });
    }, [handlePress, autoFocus]);
    var getValidDateForCalendar = (0, react_1.useMemo)(function () {
        if (!selectedDate) {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return defaultValue || (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.FNS_FORMAT_STRING);
        }
        return selectedDate;
    }, [selectedDate, defaultValue]);
    return (<>
            <react_native_1.View ref={anchorRef} style={styles.mv2}>
                <TextInput_1.default ref={(0, mergeRefs_1.default)(ref, textInputRef)} inputID={inputID} forceActiveLabel icon={selectedDate ? null : Expensicons.Calendar} iconContainerStyle={styles.pr0} label={label} accessibilityLabel={label} role={CONST_1.default.ROLE.PRESENTATION} value={selectedDate} placeholder={placeholder !== null && placeholder !== void 0 ? placeholder : translate('common.dateFormat')} errorText={errorText} inputStyle={styles.pointerEventsNone} disabled={disabled} readOnly onPress={handlePress} textInputContainerStyles={isModalVisible ? styles.borderColorFocus : {}} shouldHideClearButton={shouldHideClearButton} onClearInput={handleClear}/>
            </react_native_1.View>

            <DatePickerModal_1.default inputID={inputID} minDate={minDate} maxDate={maxDate} value={getValidDateForCalendar} onSelected={handleDateSelected} isVisible={isModalVisible} onClose={closeDatePicker} anchorPosition={popoverPosition} shouldPositionFromTop={!isInverted}/>
        </>);
}
DatePicker.displayName = 'DatePicker';
exports.default = (0, react_1.forwardRef)(DatePicker);
