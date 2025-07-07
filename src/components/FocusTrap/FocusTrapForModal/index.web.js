"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var focus_trap_react_1 = require("focus-trap-react");
var react_1 = require("react");
var sharedTrapStack_1 = require("@components/FocusTrap/sharedTrapStack");
var blurActiveElement_1 = require("@libs/Accessibility/blurActiveElement");
var ReportActionComposeFocusManager_1 = require("@libs/ReportActionComposeFocusManager");
function FocusTrapForModal(_a) {
    var children = _a.children, active = _a.active, _b = _a.initialFocus, initialFocus = _b === void 0 ? false : _b, _c = _a.shouldPreventScroll, shouldPreventScroll = _c === void 0 ? false : _c;
    return (<focus_trap_react_1.FocusTrap active={active} focusTrapOptions={{
            onActivate: blurActiveElement_1.default,
            preventScroll: shouldPreventScroll,
            trapStack: sharedTrapStack_1.default,
            clickOutsideDeactivates: true,
            initialFocus: initialFocus,
            fallbackFocus: document.body,
            setReturnFocus: function (element) {
                if (ReportActionComposeFocusManager_1.default.isFocused()) {
                    return false;
                }
                return element;
            },
        }}>
            {children}
        </focus_trap_react_1.FocusTrap>);
}
FocusTrapForModal.displayName = 'FocusTrapForModal';
exports.default = FocusTrapForModal;
