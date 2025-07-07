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
var PopoverProvider_1 = require("@components/PopoverProvider");
var BaseTooltip_1 = require("./BaseTooltip");
function PopoverAnchorTooltip(_a) {
    var _b = _a.shouldRender, shouldRender = _b === void 0 ? true : _b, children = _a.children, props = __rest(_a, ["shouldRender", "children"]);
    var _c = (0, react_1.useContext)(PopoverProvider_1.PopoverContext), isOpen = _c.isOpen, popoverAnchor = _c.popoverAnchor;
    var tooltipRef = (0, react_1.useRef)(null);
    var isPopoverRelatedToTooltipOpen = (0, react_1.useMemo)(function () {
        var _a, _b;
        // eslint-disable-next-line @typescript-eslint/dot-notation, react-compiler/react-compiler
        var tooltipNode = (_b = (_a = tooltipRef.current) === null || _a === void 0 ? void 0 : _a['_childNode']) !== null && _b !== void 0 ? _b : null;
        if (isOpen && popoverAnchor && tooltipNode && ((popoverAnchor instanceof Node && tooltipNode.contains(popoverAnchor)) || tooltipNode === popoverAnchor)) {
            return true;
        }
        return false;
    }, [isOpen, popoverAnchor]);
    if (!shouldRender || isPopoverRelatedToTooltipOpen) {
        return children;
    }
    return (<BaseTooltip_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={tooltipRef}>
            {children}
        </BaseTooltip_1.default>);
}
PopoverAnchorTooltip.displayName = 'PopoverAnchorTooltip';
exports.default = PopoverAnchorTooltip;
