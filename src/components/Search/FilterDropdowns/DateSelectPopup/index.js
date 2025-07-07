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
var CONST_1 = require("@src/CONST");
var CalendarView_1 = require("./CalendarView");
var RootView_1 = require("./RootView");
function DateSelectPopup(_a) {
    var value = _a.value, closeOverlay = _a.closeOverlay, onChange = _a.onChange;
    var _b = (0, react_1.useState)(value), localDateValues = _b[0], setLocalDateValues = _b[1];
    var _c = (0, react_1.useState)(null), view = _c[0], setView = _c[1];
    var setDateValue = function (key, dateValue) {
        setLocalDateValues(function (currentValue) {
            var _a;
            return __assign(__assign({}, currentValue), (_a = {}, _a[key] = dateValue, _a));
        });
    };
    var navigateToRootView = (0, react_1.useCallback)(function () {
        setView(null);
    }, []);
    var resetChanges = (0, react_1.useCallback)(function () {
        var _a;
        closeOverlay();
        onChange((_a = {},
            _a[CONST_1.default.SEARCH.DATE_MODIFIERS.ON] = null,
            _a[CONST_1.default.SEARCH.DATE_MODIFIERS.BEFORE] = null,
            _a[CONST_1.default.SEARCH.DATE_MODIFIERS.AFTER] = null,
            _a));
    }, [closeOverlay, onChange]);
    var applyChanges = (0, react_1.useCallback)(function () {
        closeOverlay();
        onChange(localDateValues);
    }, [closeOverlay, localDateValues, onChange]);
    if (!view) {
        return (<RootView_1.default value={localDateValues} applyChanges={applyChanges} resetChanges={resetChanges} setView={setView}/>);
    }
    return (<CalendarView_1.default view={view} value={localDateValues[view]} navigateBack={navigateToRootView} setValue={setDateValue}/>);
}
DateSelectPopup.displayName = 'DateSelectPopup';
exports.default = DateSelectPopup;
