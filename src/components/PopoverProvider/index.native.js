"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopoverContext = void 0;
var react_1 = require("react");
var PopoverContext = react_1.default.createContext({
    onOpen: function () { },
    popover: null,
    close: function () { },
    isOpen: false,
    setActivePopoverExtraAnchorRef: function () { },
});
exports.PopoverContext = PopoverContext;
function PopoverContextProvider(props) {
    var contextValue = react_1.default.useMemo(function () { return ({
        onOpen: function () { },
        close: function () { },
        popover: null,
        isOpen: false,
        setActivePopoverExtraAnchorRef: function () { },
    }); }, []);
    return <PopoverContext.Provider value={contextValue}>{props.children}</PopoverContext.Provider>;
}
PopoverContextProvider.displayName = 'PopoverContextProvider';
exports.default = PopoverContextProvider;
