"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMouseContext = void 0;
exports.MouseProvider = MouseProvider;
var react_1 = require("react");
var MouseContext = (0, react_1.createContext)({
    isMouseDownOnInput: false,
    setMouseDown: function () { },
    setMouseUp: function () { },
});
function MouseProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(false), isMouseDownOnInput = _b[0], setIsMouseDownOnInput = _b[1];
    var setMouseDown = function () { return setIsMouseDownOnInput(true); };
    var setMouseUp = function () { return setIsMouseDownOnInput(false); };
    var value = (0, react_1.useMemo)(function () { return ({ isMouseDownOnInput: isMouseDownOnInput, setMouseDown: setMouseDown, setMouseUp: setMouseUp }); }, [isMouseDownOnInput]);
    return <MouseContext.Provider value={value}>{children}</MouseContext.Provider>;
}
var useMouseContext = function () { return (0, react_1.useContext)(MouseContext); };
exports.useMouseContext = useMouseContext;
