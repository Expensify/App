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
var Modal_1 = require("@components/Modal");
var CONST_1 = require("@src/CONST");
/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
function Popover(_a) {
    var animationIn = _a.animationIn, animationOut = _a.animationOut, popoverAnchorPosition = _a.popoverAnchorPosition, disableAnimation = _a.disableAnimation, _b = _a.anchorPosition, anchorPosition = _b === void 0 ? {} : _b, fromSidebarMediumScreen = _a.fromSidebarMediumScreen, propsWithoutAnimation = __rest(_a, ["animationIn", "animationOut", "popoverAnchorPosition", "disableAnimation", "anchorPosition", "fromSidebarMediumScreen"]);
    return (<Modal_1.default type={fromSidebarMediumScreen ? CONST_1.default.MODAL.MODAL_TYPE.POPOVER : CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED} popoverAnchorPosition={fromSidebarMediumScreen ? anchorPosition : undefined} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...propsWithoutAnimation} 
    // Mobile will always has fullscreen menu
    fullscreen animationIn="slideInUp" animationOut="slideOutDown"/>);
}
Popover.displayName = 'Popover';
exports.default = Popover;
