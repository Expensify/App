"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var MenuItemWithTopDescription_1 = require("./MenuItemWithTopDescription");
function AutoUpdateTime(_a) {
    var timezone = _a.timezone;
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, getLocalDateFromDatetime = _b.getLocalDateFromDatetime;
    var styles = (0, useThemeStyles_1.default)();
    /** @returns Returns the locale Date object */
    var getCurrentUserLocalTime = (0, react_1.useCallback)(function () { return getLocalDateFromDatetime(undefined, timezone.selected); }, [getLocalDateFromDatetime, timezone.selected]);
    var _c = (0, react_1.useState)(getCurrentUserLocalTime), currentUserLocalTime = _c[0], setCurrentUserLocalTime = _c[1];
    var minuteRef = (0, react_1.useRef)(new Date().getMinutes());
    var timezoneName = (0, react_1.useMemo)(function () {
        if (timezone.selected) {
            return DateUtils_1.default.getZoneAbbreviation(currentUserLocalTime, timezone.selected);
        }
        return '';
    }, [currentUserLocalTime, timezone.selected]);
    (0, react_1.useEffect)(function () {
        // If any of the props that getCurrentUserLocalTime depends on change, we want to update the displayed time immediately
        setCurrentUserLocalTime(getCurrentUserLocalTime());
        // Also, if the user leaves this page open, we want to make sure the displayed time is updated every minute when the clock changes
        // To do this we create an interval to check if the minute has changed every second and update the displayed time if it has
        var interval = setInterval(function () {
            var currentMinute = new Date().getMinutes();
            if (currentMinute !== minuteRef.current) {
                setCurrentUserLocalTime(getCurrentUserLocalTime());
                minuteRef.current = currentMinute;
            }
        }, 1000);
        return function () { return clearInterval(interval); };
    }, [getCurrentUserLocalTime]);
    return (<react_native_1.View style={[styles.w100, styles.detailsPageSectionContainer]}>
            <MenuItemWithTopDescription_1.default style={[styles.ph0]} title={"".concat(DateUtils_1.default.formatToLocalTime(currentUserLocalTime), " ").concat(timezoneName)} description={translate('detailsPage.localTime')} interactive={false}/>
        </react_native_1.View>);
}
AutoUpdateTime.displayName = 'AutoUpdateTime';
exports.default = AutoUpdateTime;
