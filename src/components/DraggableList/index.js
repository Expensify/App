"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@dnd-kit/core");
var modifiers_1 = require("@dnd-kit/modifiers");
var sortable_1 = require("@dnd-kit/sortable");
var react_1 = require("react");
var ScrollView_1 = require("@components/ScrollView");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SortableItem_1 = require("./SortableItem");
var minimumActivationDistance = 5; // pointer must move at least this much before starting to drag
/**
 * Draggable (vertical) list using dnd-kit. Dragging is restricted to the vertical axis only
 *
 */
function DraggableList(_a, ref) {
    var _b = _a.data, data = _b === void 0 ? [] : _b, renderItem = _a.renderItem, keyExtractor = _a.keyExtractor, onDragEndCallback = _a.onDragEnd, 
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ListFooterComponent = _a.ListFooterComponent;
    var styles = (0, useThemeStyles_1.default)();
    var items = data.map(function (item, index) {
        return keyExtractor(item, index);
    });
    /**
     * Function to be called when the user finishes dragging an item
     * It will reorder the list and call the callback function
     * to notify the parent component about the change
     */
    var onDragEnd = function (event) {
        var active = event.active, over = event.over;
        if (over !== null && active.id !== over.id) {
            var oldIndex = items.indexOf(active.id.toString());
            var newIndex = items.indexOf(over.id.toString());
            var reorderedItems = (0, sortable_1.arrayMove)(data, oldIndex, newIndex);
            onDragEndCallback === null || onDragEndCallback === void 0 ? void 0 : onDragEndCallback({ data: reorderedItems });
        }
    };
    var sortableItems = data.map(function (item, index) {
        var key = keyExtractor(item, index);
        return (<SortableItem_1.default id={key} key={key}>
                {renderItem({
                item: item,
                getIndex: function () { return index; },
                isActive: false,
                drag: function () { },
            })}
            </SortableItem_1.default>);
    });
    var sensors = [
        (0, core_1.useSensor)(core_1.PointerSensor, {
            activationConstraint: {
                distance: minimumActivationDistance,
            },
        }),
    ];
    return (<ScrollView_1.default ref={ref} style={styles.flex1} contentContainerStyle={styles.flex1}>
            <div>
                <core_1.DndContext onDragEnd={onDragEnd} sensors={sensors} collisionDetection={core_1.closestCenter} modifiers={[modifiers_1.restrictToParentElement, modifiers_1.restrictToVerticalAxis]}>
                    <sortable_1.SortableContext items={items} strategy={sortable_1.verticalListSortingStrategy}>
                        {sortableItems}
                    </sortable_1.SortableContext>
                </core_1.DndContext>
            </div>
            {ListFooterComponent}
        </ScrollView_1.default>);
}
DraggableList.displayName = 'DraggableList';
exports.default = react_1.default.forwardRef(DraggableList);
