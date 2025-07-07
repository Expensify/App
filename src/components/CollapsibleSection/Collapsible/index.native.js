"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_collapsible_1 = require("react-native-collapsible");
function Collapsible(_a) {
    var _b = _a.isOpened, isOpened = _b === void 0 ? false : _b, children = _a.children;
    return <react_native_collapsible_1.default collapsed={!isOpened}>{children}</react_native_collapsible_1.default>;
}
Collapsible.displayName = 'Collapsible';
exports.default = Collapsible;
