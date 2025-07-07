"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var PopoverWithMeasuredContent_1 = require("@components/PopoverWithMeasuredContent");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var CalendarPicker_1 = require("./CalendarPicker");
var DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};
var popoverDimensions = {
    height: CONST_1.default.POPOVER_DATE_MIN_HEIGHT,
    width: CONST_1.default.POPOVER_DATE_WIDTH,
};
function DatePickerModal(_a) {
    var _b;
    var value = _a.value, defaultValue = _a.defaultValue, inputID = _a.inputID, _c = _a.minDate, minDate = _c === void 0 ? (0, date_fns_1.setYear)(new Date(), CONST_1.default.CALENDAR_PICKER.MIN_YEAR) : _c, _d = _a.maxDate, maxDate = _d === void 0 ? (0, date_fns_1.setYear)(new Date(), CONST_1.default.CALENDAR_PICKER.MAX_YEAR) : _d, onInputChange = _a.onInputChange, onTouched = _a.onTouched, _e = _a.shouldSaveDraft, shouldSaveDraft = _e === void 0 ? false : _e, formID = _a.formID, isVisible = _a.isVisible, onClose = _a.onClose, anchorPosition = _a.anchorPosition, onSelected = _a.onSelected, _f = _a.shouldCloseWhenBrowserNavigationChanged, shouldCloseWhenBrowserNavigationChanged = _f === void 0 ? false : _f, _g = _a.shouldPositionFromTop, shouldPositionFromTop = _g === void 0 ? false : _g;
    var _h = (0, react_1.useState)((_b = value !== null && value !== void 0 ? value : defaultValue) !== null && _b !== void 0 ? _b : undefined), selectedDate = _h[0], setSelectedDate = _h[1];
    var anchorRef = (0, react_1.useRef)(null);
    var styles = (0, useThemeStyles_1.default)();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    (0, react_1.useEffect)(function () {
        var _a;
        if (shouldSaveDraft && formID) {
            (0, FormActions_1.setDraftValues)(formID, (_a = {}, _a[inputID] = selectedDate, _a));
        }
        if (selectedDate !== value) {
            setSelectedDate(value);
        }
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);
    var handleDateSelection = function (newValue) {
        onSelected === null || onSelected === void 0 ? void 0 : onSelected(newValue);
        onTouched === null || onTouched === void 0 ? void 0 : onTouched();
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(newValue);
        setSelectedDate(newValue);
    };
    return (<PopoverWithMeasuredContent_1.default anchorRef={anchorRef} isVisible={isVisible} onClose={onClose} anchorPosition={anchorPosition} popoverDimensions={popoverDimensions} shouldCloseWhenBrowserNavigationChanged={shouldCloseWhenBrowserNavigationChanged} innerContainerStyle={isSmallScreenWidth ? styles.w100 : { width: CONST_1.default.POPOVER_DATE_WIDTH }} anchorAlignment={DEFAULT_ANCHOR_ORIGIN} restoreFocusType={CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.DELETE} shouldSwitchPositionIfOverflow shouldEnableNewFocusManagement shouldMeasureAnchorPositionFromTop={shouldPositionFromTop} shouldSkipRemeasurement>
            <CalendarPicker_1.default minDate={minDate} maxDate={maxDate} value={selectedDate} onSelected={handleDateSelection}/>
        </PopoverWithMeasuredContent_1.default>);
}
DatePickerModal.displayName = 'DatePickerModal';
exports.default = DatePickerModal;
