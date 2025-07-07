"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useScrollContext;
var react_1 = require("react");
var ScrollViewWithContext_1 = require("@components/ScrollViewWithContext");
function useScrollContext() {
    return (0, react_1.useContext)(ScrollViewWithContext_1.ScrollContext);
}
