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
exports.ImageBehaviorContext = void 0;
exports.ImageBehaviorContextProvider = ImageBehaviorContextProvider;
var react_1 = require("react");
var ImageBehaviorContext = (0, react_1.createContext)({
    shouldSetAspectRatioInStyle: true,
});
exports.ImageBehaviorContext = ImageBehaviorContext;
function ImageBehaviorContextProvider(_a) {
    var children = _a.children, value = __rest(_a, ["children"]);
    return <ImageBehaviorContext.Provider value={value}>{children}</ImageBehaviorContext.Provider>;
}
