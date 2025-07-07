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
var react_1 = require("react");
var Button_1 = require("@components/Button");
var CalendarPicker_1 = require("@components/DatePicker/CalendarPicker");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItem_1 = require("@components/MenuItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var SingleSelectListItem_1 = require("@components/SelectionList/SingleSelectListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchDatePresetFilterBase(_a) {
    var dateKey = _a.dateKey, titleKey = _a.titleKey, presets = _a.presets;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true })[0];
    var _b = (0, react_1.useState)(null), selectedDateModifier = _b[0], setSelectedDateModifier = _b[1];
    var _c = (0, react_1.useState)(function () {
        var _a;
        return (_a = {},
            _a[CONST_1.default.SEARCH.DATE_MODIFIERS.ON] = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm["".concat(dateKey).concat(CONST_1.default.SEARCH.DATE_MODIFIERS.ON)],
            _a[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE] = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm["".concat(dateKey).concat(CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE)],
            _a[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER] = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm["".concat(dateKey).concat(CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER)],
            _a);
    }), dateValues = _c[0], setDateValues = _c[1];
    var setDateValue = (0, react_1.useCallback)(function (dateModifier, value) {
        setDateValues(function (prevDateValues) {
            var _a, _b, _c;
            if (dateModifier === CONST_1.default.SEARCH.DATE_MODIFIERS.ON && (0, SearchQueryUtils_1.isSearchDatePreset)(value)) {
                return _a = {},
                    _a[CONST_1.default.SEARCH.DATE_MODIFIERS.ON] = value,
                    _a[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE] = undefined,
                    _a[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER] = undefined,
                    _a;
            }
            if (dateModifier !== CONST_1.default.SEARCH.DATE_MODIFIERS.ON && (0, SearchQueryUtils_1.isSearchDatePreset)(prevDateValues[CONST_1.default.SEARCH.DATE_MODIFIERS.ON])) {
                return __assign(__assign({}, prevDateValues), (_b = {}, _b[dateModifier] = value, _b[CONST_1.default.SEARCH.DATE_MODIFIERS.ON] = undefined, _b));
            }
            return __assign(__assign({}, prevDateValues), (_c = {}, _c[dateModifier] = value, _c));
        });
    }, []);
    var dateDisplayValues = (0, react_1.useMemo)(function () {
        var _a;
        var dateOn = dateValues[CONST_1.default.SEARCH.DATE_MODIFIERS.ON];
        var dateBefore = dateValues[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE];
        var dateAfter = dateValues[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER];
        return _a = {},
            // dateOn could be a preset e.g. Last month which should not be displayed as the On field
            _a[CONST_1.default.SEARCH.DATE_MODIFIERS.ON] = (0, SearchQueryUtils_1.isSearchDatePreset)(dateOn) ? undefined : dateOn,
            _a[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE] = dateBefore,
            _a[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER] = dateAfter,
            _a;
    }, [dateValues]);
    var getInitialEphemeralDateValue = (0, react_1.useCallback)(function (dateModifier) { return (dateModifier ? dateDisplayValues[dateModifier] : undefined); }, [dateDisplayValues]);
    var _d = (0, react_1.useState)(function () { return getInitialEphemeralDateValue(selectedDateModifier); }), ephemeralDateValue = _d[0], setEphemeralDateValue = _d[1];
    var chooseDateModifier = (0, react_1.useCallback)(function (dateModifier) {
        setSelectedDateModifier(dateModifier);
        setEphemeralDateValue(getInitialEphemeralDateValue(dateModifier));
    }, [getInitialEphemeralDateValue]);
    var goBack = (0, react_1.useCallback)(function () {
        if (!selectedDateModifier) {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
            return;
        }
        setSelectedDateModifier(null);
        setEphemeralDateValue(getInitialEphemeralDateValue(null));
    }, [selectedDateModifier, getInitialEphemeralDateValue]);
    var reset = (0, react_1.useCallback)(function () {
        var _a;
        if (!selectedDateModifier) {
            setDateValues((_a = {}, _a[CONST_1.default.SEARCH.DATE_MODIFIERS.ON] = undefined, _a[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE] = undefined, _a[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER] = undefined, _a));
            return;
        }
        setDateValue(selectedDateModifier, undefined);
        goBack();
    }, [selectedDateModifier, setDateValue, goBack]);
    var save = (0, react_1.useCallback)(function () {
        var _a;
        var _b, _c, _d;
        if (!selectedDateModifier) {
            (0, Search_1.updateAdvancedFilters)((_a = {},
                _a["".concat(dateKey).concat(CONST_1.default.SEARCH.DATE_MODIFIERS.ON)] = (_b = dateValues[CONST_1.default.SEARCH.DATE_MODIFIERS.ON]) !== null && _b !== void 0 ? _b : null,
                _a["".concat(dateKey).concat(CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE)] = (_c = dateValues[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE]) !== null && _c !== void 0 ? _c : null,
                _a["".concat(dateKey).concat(CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER)] = (_d = dateValues[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER]) !== null && _d !== void 0 ? _d : null,
                _a));
            goBack();
            return;
        }
        setDateValue(selectedDateModifier, ephemeralDateValue);
        goBack();
    }, [selectedDateModifier, setDateValue, goBack, ephemeralDateValue, dateKey, dateValues]);
    var title = (0, react_1.useMemo)(function () {
        if (!selectedDateModifier) {
            return translate(titleKey);
        }
        return translate("common.".concat(selectedDateModifier.toLowerCase()));
    }, [selectedDateModifier, titleKey, translate]);
    return (<ScreenWrapper_1.default testID={SearchDatePresetFilterBase.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={title} onBackButtonPress={goBack}/>
            <ScrollView_1.default contentContainerStyle={[styles.flexGrow1]}>
                {!selectedDateModifier ? (<>
                        {presets === null || presets === void 0 ? void 0 : presets.map(function (preset) { return (<SingleSelectListItem_1.default key={preset} showTooltip item={{
                    text: translate("search.filters.date.presets.".concat(preset)),
                    isSelected: dateValues[CONST_1.default.SEARCH.DATE_MODIFIERS.ON] === preset,
                }} onSelectRow={function () { return setDateValue(CONST_1.default.SEARCH.DATE_MODIFIERS.ON, preset); }}/>); })}
                        <MenuItem_1.default shouldShowRightIcon viewMode={CONST_1.default.OPTION_MODE.COMPACT} title={translate('common.on')} description={dateDisplayValues[CONST_1.default.SEARCH.DATE_MODIFIERS.ON]} onPress={function () { return chooseDateModifier(CONST_1.default.SEARCH.DATE_MODIFIERS.ON); }}/>
                        <MenuItem_1.default shouldShowRightIcon viewMode={CONST_1.default.OPTION_MODE.COMPACT} title={translate('common.before')} description={dateDisplayValues[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE]} onPress={function () { return chooseDateModifier(CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE); }}/>
                        <MenuItem_1.default shouldShowRightIcon viewMode={CONST_1.default.OPTION_MODE.COMPACT} title={translate('common.after')} description={dateDisplayValues[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER]} onPress={function () { return chooseDateModifier(CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER); }}/>
                    </>) : (<CalendarPicker_1.default value={ephemeralDateValue} onSelected={setEphemeralDateValue} minDate={CONST_1.default.CALENDAR_PICKER.MIN_DATE} maxDate={CONST_1.default.CALENDAR_PICKER.MAX_DATE}/>)}
            </ScrollView_1.default>
            <Button_1.default text={translate('common.reset')} onPress={reset} style={[styles.mh4, styles.mt4]} large/>
            <FormAlertWithSubmitButton_1.default buttonText={translate('common.save')} containerStyles={[styles.m4, styles.mt3, styles.mb5]} onSubmit={save} enabledWhenOffline/>
        </ScreenWrapper_1.default>);
}
SearchDatePresetFilterBase.displayName = 'SearchDatePresetFilterBase';
exports.default = SearchDatePresetFilterBase;
