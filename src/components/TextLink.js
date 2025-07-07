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
var useEnvironment_1 = require("@hooks/useEnvironment");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var Text_1 = require("./Text");
function TextLink(_a, ref) {
    var href = _a.href, onPress = _a.onPress, children = _a.children, style = _a.style, _b = _a.onMouseDown, onMouseDown = _b === void 0 ? function (event) { return event.preventDefault(); } : _b, rest = __rest(_a, ["href", "onPress", "children", "style", "onMouseDown"]);
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var styles = (0, useThemeStyles_1.default)();
    var openLink = function (event) {
        if (onPress) {
            onPress(event);
        }
        else {
            Link.openLink(href, environmentURL);
        }
    };
    var openLinkOnTap = function (event) {
        event.preventDefault();
        openLink(event);
    };
    var openLinkOnEnterKey = function (event) {
        if (event.key !== 'Enter') {
            return;
        }
        event.preventDefault();
        openLink(event);
    };
    return (<Text_1.default style={[styles.link, style]} role={CONST_1.default.ROLE.LINK} href={href} onPress={openLinkOnTap} onKeyDown={openLinkOnEnterKey} onMouseDown={onMouseDown} ref={ref} suppressHighlighting 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}>
            {children}
        </Text_1.default>);
}
TextLink.displayName = 'TextLink';
exports.default = (0, react_1.forwardRef)(TextLink);
