"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_collapse_1 = require("react-collapse");
function Collapsible(_a) {
    var _b = _a.isOpened, isOpened = _b === void 0 ? false : _b, children = _a.children;
    return <react_collapse_1.Collapse isOpened={isOpened}>{children}</react_collapse_1.Collapse>;
}
exports.default = Collapsible;
