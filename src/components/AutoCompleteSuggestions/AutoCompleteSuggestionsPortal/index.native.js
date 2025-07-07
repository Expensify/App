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
var portal_1 = require("@gorhom/portal");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BaseAutoCompleteSuggestions_1 = require("@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var getBottomSuggestionPadding_1 = require("./getBottomSuggestionPadding");
var TransparentOverlay_1 = require("./TransparentOverlay/TransparentOverlay");
function AutoCompleteSuggestionsPortal(_a) {
    var _b = _a.left, left = _b === void 0 ? 0 : _b, _c = _a.width, width = _c === void 0 ? 0 : _c, _d = _a.bottom, bottom = _d === void 0 ? 0 : _d, _e = _a.resetSuggestions, resetSuggestions = _e === void 0 ? function () { } : _e, props = __rest(_a, ["left", "width", "bottom", "resetSuggestions"]);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var bottomPadding = (0, getBottomSuggestionPadding_1.default)(bottom);
    var styles = (0, react_1.useMemo)(function () { return StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({ left: left, width: width, bottom: bottom + bottomPadding }); }, [StyleUtils, left, width, bottom, bottomPadding]);
    if (!width) {
        return null;
    }
    return (<portal_1.Portal hostName="suggestions">
            <TransparentOverlay_1.default onPress={resetSuggestions}/>
            <react_native_1.View style={styles}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <BaseAutoCompleteSuggestions_1.default width={width} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>
            </react_native_1.View>
        </portal_1.Portal>);
}
AutoCompleteSuggestionsPortal.displayName = 'AutoCompleteSuggestionsPortal';
exports.default = AutoCompleteSuggestionsPortal;
