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
exports.default = withToggleVisibilityView;
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getComponentDisplayName_1 = require("@libs/getComponentDisplayName");
function withToggleVisibilityView(WrappedComponent) {
    function WithToggleVisibilityView(_a, ref) {
        var _b = _a.isVisible, isVisible = _b === void 0 ? false : _b, rest = __rest(_a, ["isVisible"]);
        var styles = (0, useThemeStyles_1.default)();
        return (<react_native_1.View style={!isVisible && styles.visuallyHidden} collapsable={false}>
                <WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest} ref={ref} isVisible={isVisible}/>
            </react_native_1.View>);
    }
    WithToggleVisibilityView.displayName = "WithToggleVisibilityViewWithRef(".concat((0, getComponentDisplayName_1.default)(WrappedComponent), ")");
    return react_1.default.forwardRef(WithToggleVisibilityView);
}
