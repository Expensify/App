"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var portal_1 = require("@gorhom/portal");
var react_1 = require("react");
var Provider_1 = require("@components/DragAndDrop/Provider");
function DragAndDropConsumer(_a) {
    var children = _a.children, onDrop = _a.onDrop;
    var _b = (0, react_1.useContext)(Provider_1.DragAndDropContext), isDraggingOver = _b.isDraggingOver, setOnDropHandler = _b.setOnDropHandler, dropZoneID = _b.dropZoneID;
    (0, react_1.useEffect)(function () {
        if (!onDrop) {
            return;
        }
        setOnDropHandler === null || setOnDropHandler === void 0 ? void 0 : setOnDropHandler(onDrop);
    }, [onDrop, setOnDropHandler]);
    if (!isDraggingOver) {
        return null;
    }
    return <portal_1.Portal hostName={dropZoneID}>{children}</portal_1.Portal>;
}
DragAndDropConsumer.displayName = 'DragAndDropConsumer';
exports.default = DragAndDropConsumer;
