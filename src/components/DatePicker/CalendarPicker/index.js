"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var CONST_1 = require("@src/CONST");
var ArrowIcon_1 = require("./ArrowIcon");
var Day_1 = require("./Day");
var generateMonthMatrix_1 = require("./generateMonthMatrix");
var YearPickerModal_1 = require("./YearPickerModal");
function getInitialCurrentDateView(value, minDate, maxDate) {
    var initialCurrentDateView = typeof value === 'string' ? (0, date_fns_1.parseISO)(value) : new Date(value);
    if (maxDate < initialCurrentDateView) {
        initialCurrentDateView = maxDate;
    }
    else if (minDate > initialCurrentDateView) {
        initialCurrentDateView = minDate;
    }
    return initialCurrentDateView;
}
function CalendarPicker(_a) {
    var _b;
    var _c = _a.value, value = _c === void 0 ? new Date() : _c, _d = _a.minDate, minDate = _d === void 0 ? (0, date_fns_1.setYear)(new Date(), CONST_1.default.CALENDAR_PICKER.MIN_YEAR) : _d, _e = _a.maxDate, maxDate = _e === void 0 ? (0, date_fns_1.setYear)(new Date(), CONST_1.default.CALENDAR_PICKER.MAX_YEAR) : _e, onSelected = _a.onSelected, _f = _a.DayComponent, DayComponent = _f === void 0 ? Day_1.default : _f, selectableDates = _a.selectableDates;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var themeStyles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var pressableRef = (0, react_1.useRef)(null);
    var _g = (0, react_1.useState)(function () { return getInitialCurrentDateView(value, minDate, maxDate); }), currentDateView = _g[0], setCurrentDateView = _g[1];
    var _h = (0, react_1.useState)(false), isYearPickerVisible = _h[0], setIsYearPickerVisible = _h[1];
    var isFirstRender = (0, react_1.useRef)(true);
    var currentMonthView = currentDateView.getMonth();
    var currentYearView = currentDateView.getFullYear();
    var calendarDaysMatrix = (0, generateMonthMatrix_1.default)(currentYearView, currentMonthView);
    var initialHeight = ((calendarDaysMatrix === null || calendarDaysMatrix === void 0 ? void 0 : calendarDaysMatrix.length) || CONST_1.default.MAX_CALENDAR_PICKER_ROWS) * CONST_1.default.CALENDAR_PICKER_DAY_HEIGHT;
    var heightValue = (0, react_native_reanimated_1.useSharedValue)(initialHeight);
    var minYear = (0, date_fns_1.getYear)(new Date(minDate));
    var maxYear = (0, date_fns_1.getYear)(new Date(maxDate));
    var _j = (0, react_1.useState)(function () {
        return Array.from({ length: maxYear - minYear + 1 }, function (v, i) { return i + minYear; }).map(function (year) { return ({
            text: year.toString(),
            value: year,
            keyForList: year.toString(),
            isSelected: year === currentDateView.getFullYear(),
        }); });
    }), years = _j[0], setYears = _j[1];
    var onYearSelected = function (year) {
        setIsYearPickerVisible(false);
        setCurrentDateView(function (prev) {
            var newCurrentDateView = (0, date_fns_1.setYear)(new Date(prev), year);
            setYears(function (prevYears) {
                return prevYears.map(function (item) { return (__assign(__assign({}, item), { isSelected: item.value === newCurrentDateView.getFullYear() })); });
            });
            return newCurrentDateView;
        });
    };
    /**
     * Calls the onSelected function with the selected date.
     * @param day - The day of the month that was selected.
     */
    var onDayPressed = function (day) {
        setCurrentDateView(function (prev) {
            var newCurrentDateView = (0, date_fns_1.setDate)(new Date(prev), day);
            onSelected === null || onSelected === void 0 ? void 0 : onSelected((0, date_fns_1.format)(new Date(newCurrentDateView), CONST_1.default.DATE.FNS_FORMAT_STRING));
            return newCurrentDateView;
        });
    };
    /**
     * Handles the user pressing the previous month arrow of the calendar picker.
     */
    var moveToPrevMonth = function () {
        setCurrentDateView(function (prev) {
            var prevMonth = (0, date_fns_1.subMonths)(new Date(prev), 1);
            // if year is subtracted, we need to update the years list
            if (prevMonth.getFullYear() < prev.getFullYear()) {
                setYears(function (prevYears) {
                    return prevYears.map(function (item) { return (__assign(__assign({}, item), { isSelected: item.value === prevMonth.getFullYear() })); });
                });
            }
            return prevMonth;
        });
    };
    /**
     * Handles the user pressing the next month arrow of the calendar picker.
     */
    var moveToNextMonth = function () {
        setCurrentDateView(function (prev) {
            var nextMonth = (0, date_fns_1.addMonths)(new Date(prev), 1);
            // if year is added, we need to update the years list
            if (nextMonth.getFullYear() > prev.getFullYear()) {
                setYears(function (prevYears) {
                    return prevYears.map(function (item) { return (__assign(__assign({}, item), { isSelected: item.value === nextMonth.getFullYear() })); });
                });
            }
            return nextMonth;
        });
    };
    var monthNames = DateUtils_1.default.getMonthNames().map(function (month) { return expensify_common_1.Str.recapitalize(month); });
    var daysOfWeek = DateUtils_1.default.getDaysOfWeek().map(function (day) { return day.toUpperCase(); });
    var hasAvailableDatesNextMonth = (0, date_fns_1.startOfDay)(new Date(maxDate)) > (0, date_fns_1.endOfMonth)(new Date(currentDateView));
    var hasAvailableDatesPrevMonth = (0, date_fns_1.endOfDay)(new Date(minDate)) < (0, date_fns_1.startOfMonth)(new Date(currentDateView));
    (0, react_1.useEffect)(function () {
        if (isSmallScreenWidth || isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        var rowCount = (calendarDaysMatrix === null || calendarDaysMatrix === void 0 ? void 0 : calendarDaysMatrix.length) || CONST_1.default.MAX_CALENDAR_PICKER_ROWS;
        var newHeight = rowCount * CONST_1.default.CALENDAR_PICKER_DAY_HEIGHT;
        heightValue.set((0, react_native_reanimated_1.withTiming)(newHeight, { duration: 50 }));
    }, [calendarDaysMatrix, heightValue, isSmallScreenWidth]);
    var animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        return {
            height: heightValue.get(),
        };
    });
    var webOnlyMarginStyle = isSmallScreenWidth ? {} : styles.mh1;
    var calendarContainerStyle = isSmallScreenWidth ? [webOnlyMarginStyle, themeStyles.calendarBodyContainer] : [webOnlyMarginStyle, animatedStyle];
    return (<react_native_1.View style={[themeStyles.pb4]}>
            <react_native_1.View style={[themeStyles.calendarHeader, themeStyles.flexRow, themeStyles.justifyContentBetween, themeStyles.alignItemsCenter, themeStyles.ph5]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
                <PressableWithFeedback_1.default onPress={function () {
            var _a;
            (_a = pressableRef === null || pressableRef === void 0 ? void 0 : pressableRef.current) === null || _a === void 0 ? void 0 : _a.blur();
            setIsYearPickerVisible(true);
        }} ref={pressableRef} style={[themeStyles.alignItemsCenter, themeStyles.flexRow, themeStyles.flex1, themeStyles.justifyContentStart]} wrapperStyle={[themeStyles.alignItemsCenter]} hoverDimmingValue={1} disabled={years.length <= 1} testID="currentYearButton" accessibilityLabel={translate('common.currentYear')}>
                    <Text_1.default style={themeStyles.sidebarLinkTextBold} testID="currentYearText" accessibilityLabel={translate('common.currentYear')}>
                        {currentYearView}
                    </Text_1.default>
                    <ArrowIcon_1.default disabled={years.length <= 1}/>
                </PressableWithFeedback_1.default>
                <react_native_1.View style={[themeStyles.alignItemsCenter, themeStyles.flexRow, themeStyles.flex1, themeStyles.justifyContentEnd, themeStyles.mrn2]}>
                    <Text_1.default style={themeStyles.sidebarLinkTextBold} testID="currentMonthText" accessibilityLabel={translate('common.currentMonth')}>
                        {monthNames.at(currentMonthView)}
                    </Text_1.default>
                    <PressableWithFeedback_1.default shouldUseAutoHitSlop={false} testID="prev-month-arrow" disabled={!hasAvailableDatesPrevMonth} onPress={moveToPrevMonth} hoverDimmingValue={1} accessibilityLabel={translate('common.previous')}>
                        <ArrowIcon_1.default disabled={!hasAvailableDatesPrevMonth} direction={CONST_1.default.DIRECTION.LEFT}/>
                    </PressableWithFeedback_1.default>
                    <PressableWithFeedback_1.default shouldUseAutoHitSlop={false} testID="next-month-arrow" disabled={!hasAvailableDatesNextMonth} onPress={moveToNextMonth} hoverDimmingValue={1} accessibilityLabel={translate('common.next')}>
                        <ArrowIcon_1.default disabled={!hasAvailableDatesNextMonth}/>
                    </PressableWithFeedback_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[themeStyles.flexRow, webOnlyMarginStyle]}>
                {daysOfWeek.map(function (dayOfWeek) {
            var _a;
            return (<react_native_1.View key={dayOfWeek} style={[themeStyles.calendarDayRoot, themeStyles.flex1, themeStyles.justifyContentCenter, themeStyles.alignItemsCenter]} dataSet={_a = {}, _a[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _a}>
                        <Text_1.default style={themeStyles.sidebarLinkTextBold}>{dayOfWeek[0]}</Text_1.default>
                    </react_native_1.View>);
        })}
            </react_native_1.View>
            <react_native_reanimated_1.default.View style={calendarContainerStyle}>
                {calendarDaysMatrix === null || calendarDaysMatrix === void 0 ? void 0 : calendarDaysMatrix.map(function (week) { return (<react_native_1.View key={"week-".concat(week.toString())} style={[themeStyles.flexRow, themeStyles.calendarWeekContainer]}>
                        {week.map(function (day, index) {
                var _a;
                var _b;
                var currentDate = new Date(currentYearView, currentMonthView, day);
                var isBeforeMinDate = currentDate < (0, date_fns_1.startOfDay)(new Date(minDate));
                var isAfterMaxDate = currentDate > (0, date_fns_1.startOfDay)(new Date(maxDate));
                var isSelectable = selectableDates ? selectableDates === null || selectableDates === void 0 ? void 0 : selectableDates.some(function (date) { return (0, date_fns_1.isSameDay)((0, date_fns_1.parseISO)(date), currentDate); }) : true;
                var isDisabled = !day || isBeforeMinDate || isAfterMaxDate || !isSelectable;
                var isSelected = !!day && (0, date_fns_1.isSameDay)((0, date_fns_1.parseISO)(value.toString()), new Date(currentYearView, currentMonthView, day));
                var handleOnPress = function () {
                    if (!day || isDisabled) {
                        return;
                    }
                    onDayPressed(day);
                };
                var key = "".concat(index, "_day-").concat(day);
                return (<PressableWithoutFeedback_1.default key={key} disabled={isDisabled} onPress={handleOnPress} style={themeStyles.calendarDayRoot} accessibilityLabel={(_b = day === null || day === void 0 ? void 0 : day.toString()) !== null && _b !== void 0 ? _b : ''} tabIndex={day ? 0 : -1} accessible={!!day} dataSet={_a = {}, _a[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _a}>
                                    {function (_a) {
                        var hovered = _a.hovered, pressed = _a.pressed;
                        return (<DayComponent selected={isSelected} disabled={isDisabled} hovered={hovered} pressed={pressed}>
                                            {day}
                                        </DayComponent>);
                    }}
                                </PressableWithoutFeedback_1.default>);
            })}
                    </react_native_1.View>); })}
            </react_native_reanimated_1.default.View>
            <YearPickerModal_1.default isVisible={isYearPickerVisible} years={years} currentYear={currentYearView} onYearChange={onYearSelected} onClose={function () { return setIsYearPickerVisible(false); }}/>
        </react_native_1.View>);
}
exports.default = CalendarPicker;
