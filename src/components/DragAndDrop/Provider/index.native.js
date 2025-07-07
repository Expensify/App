"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragAndDropContext = void 0;
var react_1 = require("react");
var DragAndDropContext = react_1.default.createContext({});
exports.DragAndDropContext = DragAndDropContext;
function DragAndDropProvider(_a) {
    var children = _a.children;
    return children;
}
DragAndDropProvider.displayName = 'DragAndDropProvider';
exports.default = DragAndDropProvider;
