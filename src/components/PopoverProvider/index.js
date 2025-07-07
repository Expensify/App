"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopoverContext = void 0;
var react_1 = require("react");
var PopoverContext = (0, react_1.createContext)({
    onOpen: function () { },
    popover: null,
    popoverAnchor: null,
    close: function () { },
    isOpen: false,
    setActivePopoverExtraAnchorRef: function () { },
});
exports.PopoverContext = PopoverContext;
function elementContains(ref, target) {
    var _a;
    if ((ref === null || ref === void 0 ? void 0 : ref.current) && 'contains' in ref.current && ((_a = ref === null || ref === void 0 ? void 0 : ref.current) === null || _a === void 0 ? void 0 : _a.contains(target))) {
        return true;
    }
    return false;
}
function PopoverContextProvider(props) {
    var _a = (0, react_1.useState)(false), isOpen = _a[0], setIsOpen = _a[1];
    var activePopoverRef = (0, react_1.useRef)(null);
    var _b = (0, react_1.useState)(null), activePopoverAnchor = _b[0], setActivePopoverAnchor = _b[1];
    var _c = (0, react_1.useState)([]), activePopoverExtraAnchorRefs = _c[0], setActivePopoverExtraAnchorRefs = _c[1];
    var closePopover = (0, react_1.useCallback)(function (anchorRef) {
        if (!activePopoverRef.current || (anchorRef && anchorRef !== activePopoverRef.current.anchorRef)) {
            return false;
        }
        activePopoverRef.current.close();
        activePopoverRef.current = null;
        setIsOpen(false);
        setActivePopoverAnchor(null);
        return true;
    }, []);
    (0, react_1.useEffect)(function () {
        var listener = function (e) {
            var _a, _b, _c;
            if (elementContains((_a = activePopoverRef.current) === null || _a === void 0 ? void 0 : _a.ref, e.target) || elementContains((_b = activePopoverRef.current) === null || _b === void 0 ? void 0 : _b.anchorRef, e.target)) {
                return;
            }
            // Incase there are any extra anchor refs where the popover should not close on click
            // for example, the case when the QAB tooltip is clicked it closes the popover this will prevent that
            if (activePopoverExtraAnchorRefs === null || activePopoverExtraAnchorRefs === void 0 ? void 0 : activePopoverExtraAnchorRefs.some(function (ref) { return elementContains(ref, e.target); })) {
                return;
            }
            var ref = (_c = activePopoverRef.current) === null || _c === void 0 ? void 0 : _c.anchorRef;
            closePopover(ref);
        };
        document.addEventListener('click', listener, true);
        return function () {
            document.removeEventListener('click', listener, true);
        };
    }, [closePopover, activePopoverExtraAnchorRefs]);
    (0, react_1.useEffect)(function () {
        var listener = function (e) {
            var _a;
            if (elementContains((_a = activePopoverRef.current) === null || _a === void 0 ? void 0 : _a.ref, e.target)) {
                return;
            }
            closePopover();
        };
        document.addEventListener('contextmenu', listener);
        return function () {
            document.removeEventListener('contextmenu', listener);
        };
    }, [closePopover]);
    (0, react_1.useEffect)(function () {
        var listener = function (e) {
            if (e.key !== 'Escape') {
                return;
            }
            if (closePopover()) {
                e.stopImmediatePropagation();
            }
        };
        document.addEventListener('keyup', listener, true);
        return function () {
            document.removeEventListener('keyup', listener, true);
        };
    }, [closePopover]);
    (0, react_1.useEffect)(function () {
        var listener = function () {
            if (document.hasFocus()) {
                return;
            }
            closePopover();
        };
        document.addEventListener('visibilitychange', listener);
        return function () {
            document.removeEventListener('visibilitychange', listener);
        };
    }, [closePopover]);
    (0, react_1.useEffect)(function () {
        var listener = function (e) {
            var _a;
            if (elementContains((_a = activePopoverRef.current) === null || _a === void 0 ? void 0 : _a.ref, e.target)) {
                return;
            }
            closePopover();
        };
        document.addEventListener('wheel', listener, true);
        return function () {
            document.removeEventListener('wheel', listener, true);
        };
    }, [closePopover]);
    var onOpen = (0, react_1.useCallback)(function (popoverParams) {
        if (activePopoverRef.current && activePopoverRef.current.ref !== (popoverParams === null || popoverParams === void 0 ? void 0 : popoverParams.ref)) {
            closePopover(activePopoverRef.current.anchorRef);
        }
        activePopoverRef.current = popoverParams;
        setActivePopoverAnchor(popoverParams.anchorRef.current);
        setIsOpen(true);
    }, [closePopover]);
    // To set the extra anchor refs for the popover when prop-drilling is not possible
    var setActivePopoverExtraAnchorRef = (0, react_1.useCallback)(function (extraAnchorRef) {
        if (!extraAnchorRef) {
            return;
        }
        setActivePopoverExtraAnchorRefs(function (prev) {
            if (!prev) {
                return [extraAnchorRef];
            }
            if (prev === null || prev === void 0 ? void 0 : prev.includes(extraAnchorRef)) {
                return prev;
            }
            return __spreadArray(__spreadArray([], prev, true), [extraAnchorRef], false);
        });
    }, []);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        onOpen: onOpen,
        setActivePopoverExtraAnchorRef: setActivePopoverExtraAnchorRef,
        close: closePopover,
        // eslint-disable-next-line react-compiler/react-compiler
        popover: activePopoverRef.current,
        popoverAnchor: activePopoverAnchor,
        isOpen: isOpen,
    }); }, [onOpen, closePopover, isOpen, activePopoverAnchor, setActivePopoverExtraAnchorRef]);
    return <PopoverContext.Provider value={contextValue}>{props.children}</PopoverContext.Provider>;
}
PopoverContextProvider.displayName = 'PopoverContextProvider';
exports.default = PopoverContextProvider;
