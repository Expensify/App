"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var react_native_1 = require("react-native");
var BaseAutoCompleteSuggestions_1 = require("@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var getBottomSuggestionPadding_1 = require("./getBottomSuggestionPadding");
var TransparentOverlay_1 = require("./TransparentOverlay/TransparentOverlay");
/**
 * On the mobile-web platform, when long-pressing on auto-complete suggestions,
 * we need to prevent focus shifting to avoid blurring the main input (which makes the suggestions picker close and fires the onSelect callback).
 * The desired pattern for all platforms is to do nothing on long-press.
 * On the native platform, tapping on auto-complete suggestions will not blur the main input.
 */
function AutoCompleteSuggestionsPortal(_a) {
    var _b = _a.left, left = _b === void 0 ? 0 : _b, _c = _a.width, width = _c === void 0 ? 0 : _c, _d = _a.bottom, bottom = _d === void 0 ? 0 : _d, _e = _a.resetSuggestions, resetSuggestions = _e === void 0 ? function () { } : _e, props = __rest(_a, ["left", "width", "bottom", "resetSuggestions"]);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var bodyElement = document.querySelector('body');
    var componentToRender = (<BaseAutoCompleteSuggestions_1.default width={width} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
    return (!!width &&
        bodyElement &&
        react_dom_1.default.createPortal(<>
                <TransparentOverlay_1.default onPress={resetSuggestions}/>
                <react_native_1.View style={StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({ left: left, width: width, bottom: bottom - (0, getBottomSuggestionPadding_1.default)() })}>{componentToRender}</react_native_1.View>
            </>, bodyElement));
}
AutoCompleteSuggestionsPortal.displayName = 'AutoCompleteSuggestionsPortal';
exports.default = AutoCompleteSuggestionsPortal;
