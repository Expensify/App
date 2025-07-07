"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sortable_1 = require("@dnd-kit/sortable");
var utilities_1 = require("@dnd-kit/utilities");
var react_1 = require("react");
function SortableItem(_a) {
    var id = _a.id, children = _a.children;
    var _b = (0, sortable_1.useSortable)({ id: id }), attributes = _b.attributes, listeners = _b.listeners, setNodeRef = _b.setNodeRef, transform = _b.transform, transition = _b.transition;
    var style = {
        touchAction: 'none',
        transform: utilities_1.CSS.Transform.toString(transform),
        transition: transition,
    };
    return (<div ref={setNodeRef} style={style} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...attributes} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...listeners}>
            {children}
        </div>);
}
exports.default = SortableItem;
